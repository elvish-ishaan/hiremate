import 'dotenv/config';
import { prisma } from '@repo/db';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import getSystemPrompt from './lib/prompts';
import { scoreAnswer } from './lib/auxOps';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_REALTIME_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

const wss = new WebSocketServer({ port: 5000 });

wss.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Port 5000 is already in use. Kill the existing process and retry.');
    process.exit(1);
  }
  throw error;
});

wss.on('connection', async (clientWs, req) => {
  clientWs.on('error', console.error);

  if (!req.url) return;

  const { query } = parse(req.url, true);
  const portalId = query.portalId as string;
  const userId = query.userId as string;

  if (!portalId || !userId) {
    console.log('Missing portalId or userId');
    clientWs.close();
    return;
  }

  const portal = await prisma.portal.findFirst({ where: { id: portalId } });
  if (!portal) {
    console.log('Portal not found');
    clientWs.close();
    return;
  }

  let sessionId: string | null = null;
  let pendingQuestion = '';

  // Connect to OpenAI Realtime API
  const openAiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  const cleanup = () => {
    if (
      openAiWs.readyState === WebSocket.OPEN ||
      openAiWs.readyState === WebSocket.CONNECTING
    ) {
      openAiWs.close();
    }
    if (
      clientWs.readyState === WebSocket.OPEN ||
      clientWs.readyState === WebSocket.CONNECTING
    ) {
      clientWs.close();
    }
  };

  openAiWs.on('error', (err) => {
    console.error('OpenAI WS error:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'error', message: 'AI service connection error' }));
    }
    cleanup();
  });

  openAiWs.on('open', () => {
    console.log('Connected to OpenAI Realtime API');
  });

  openAiWs.on('message', async (rawData) => {
    try {
      const event = JSON.parse(rawData.toString());

      switch (event.type) {
        case 'session.created': {
          openAiWs.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                modalities: ['audio', 'text'],
                instructions: getSystemPrompt(portal),
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: { model: 'whisper-1' },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 800,
                },
                tools: [
                  {
                    type: 'function',
                    name: 'end_interview',
                    description:
                      'Call this function when the interview is complete after all questions have been asked and answered.',
                    parameters: { type: 'object', properties: {} },
                  },
                ],
                tool_choice: 'auto',
              },
            })
          );
          break;
        }

        case 'session.updated': {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'ready' }));
          }
          // Trigger the opening greeting / first question
          openAiWs.send(JSON.stringify({ type: 'response.create' }));
          break;
        }

        case 'response.audio.delta': {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'audio_chunk', data: event.delta }));
          }
          break;
        }

        case 'response.output_item.done': {
          const item = event.item;

          if (item.type === 'message' && item.role === 'assistant') {
            // Extract the transcript of what the assistant said
            const content: any[] = item.content ?? [];
            const audioItem = content.find((c) => c.type === 'audio' && c.transcript);
            const textItem = content.find((c) => c.type === 'text' && c.text);
            const text = audioItem?.transcript ?? textItem?.text ?? '';
            if (text) {
              pendingQuestion = text;
            }
          } else if (item.type === 'function_call' && item.name === 'end_interview') {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'interview_ended' }));
            }
            // Required: send function call output back to OpenAI
            openAiWs.send(
              JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: item.call_id,
                  output: '{}',
                },
              })
            );
            // Allow time for the final message delivery before closing
            setTimeout(cleanup, 1500);
          }
          break;
        }

        case 'conversation.item.input_audio_transcription.completed': {
          const transcript: string = event.transcript ?? '';
          if (!transcript || !pendingQuestion) break;

          try {
            const score = await scoreAnswer(pendingQuestion, transcript);

            if (!sessionId) {
              const session = await prisma.session.create({
                data: {
                  userId,
                  portalId,
                  conversation: {
                    create: {
                      question: pendingQuestion,
                      answer: transcript,
                      score,
                    },
                  },
                },
              });
              sessionId = session.id;
            } else {
              await prisma.session.update({
                where: { id: sessionId },
                data: {
                  conversation: {
                    create: {
                      question: pendingQuestion,
                      answer: transcript,
                      score,
                    },
                  },
                },
              });
            }

            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'conversation_update',
                  question: pendingQuestion,
                  answer: transcript,
                })
              );
            }
          } catch (err) {
            console.error('Error scoring/saving answer:', err);
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Failed to handle OpenAI message:', err);
    }
  });

  openAiWs.on('close', () => {
    console.log('OpenAI WS closed');
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close();
    }
  });

  // Handle messages from client
  clientWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'start_interview': {
          // No-op: session setup is triggered automatically on connection
          break;
        }

        case 'audio_chunk': {
          if (openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.send(
              JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: msg.data,
              })
            );
          }
          break;
        }

        case 'end_interview': {
          cleanup();
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Failed to handle client message:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('Client WS closed');
    if (
      openAiWs.readyState === WebSocket.OPEN ||
      openAiWs.readyState === WebSocket.CONNECTING
    ) {
      openAiWs.close();
    }
  });
});

console.log('WebSocket server listening on port 5000');
