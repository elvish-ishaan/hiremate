import { prisma } from '@repo/db';
import { WebSocketServer } from 'ws';
import { agent } from './agent/agentClient';
import getSystemPrompt, { generateScoringPrompt } from './lib/prompts';
import { parse } from 'url';
import { bufferTollmFormat, cleanAndParseJson, encodeWAV, objectToFloat32Array, transcribeAudio } from './lib/auxOps';

enum STATUS {
  PING = "ping",
  START = "start",
  ONGOING = 'ongoing',
  FINISHED = 'finished'  
}

interface IncomingDataProps {
  userId?: string;
  status: STATUS;
  answer: string;
  question?: string;
  sessionId?: string;
  questionBuffer?: Blob;
}

const wss = new WebSocketServer({ port: 5000 });

wss.on('connection', async (ws, req) => {
  ws.on('error', console.error);

  if (!req.url) return;

  const { query } = parse(req.url, true);
  const portalId = query.portalId as string;
  const userId = query.userId as string;

  if (!portalId || !userId) {
    console.log("Missing portalId or userId");
    return;
  };

  const portal = await prisma.portal.findFirst({ where: { id: portalId } });
  if (!portal) {
    console.log("Portal not found");
    return;
  };

  //listen for the incomming messages
  ws.on('message', async (data) => {
    try {
      const parsedData: IncomingDataProps = JSON.parse(data.toString());
      console.log('message, rec')

      switch (parsedData.status) {
        case STATUS.PING: {
          // Start with initial system question
          const initialResponse = await agent.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "Begin the interview now",
            config: {
              systemInstruction: getSystemPrompt(portal),
            },
          });
        
          const initialParsed = cleanAndParseJson(initialResponse.text as string);
          //generate the audio of the text
          const response = await agent.models.generateContent({
             model: "gemini-2.5-flash-preview-tts",
             contents: [{ parts: [{ text: initialParsed.question }] }],
             config: {
                   responseModalities: ['AUDIO'],
                   speechConfig: {
                      voiceConfig: {
                         prebuiltVoiceConfig: { voiceName: 'Gacrux' },
                      },
                   },
             },
          });
       
          const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          const rawPcmBuffer = Buffer.from(data, 'base64');
          const wavBuffer = encodeWAV(rawPcmBuffer);

          ws.send(JSON.stringify({
            questionBuffer: wavBuffer,
            status: initialParsed.status ,
            question: initialParsed.question,
          }));
          break;
        }
        case STATUS.START: {
          //convert the audio to text and transcribe it
          const answerText = await transcribeAudio(parsedData.answer);
          if(!answerText){
            console.log('no answer text found')
            return
          }

          const questionAnswerPair = {
            question: parsedData.question!,
            answer: answerText,
          };

          const scoreResponse = await agent.models.generateContent({
            model: "gemini-2.0-flash",
            contents: 'Generate the response',
            config: {
              systemInstruction: generateScoringPrompt(questionAnswerPair),
            },
          });

          const parsedScore = cleanAndParseJson(scoreResponse.text as string);

          const session = await prisma.session.create({
            data: {
              userId,
              portalId,
              conversation: {
                create: {
                  question: questionAnswerPair.question,
                  answer: questionAnswerPair.answer,
                  score: parsedScore.score,
                },
              },
            },
            include: {
              conversation: true
            }
          });

          const nextQuestion = await agent.models.generateContent({
            model: "gemini-2.0-flash",
            //pass the array of all conversation data
            contents: `previous conversation: ${session?.conversation}\n. Now generate the next question`,
            config: {
              systemInstruction: getSystemPrompt(portal),
            },
          });
          //clean and parced the next question data
          const parsedNextQuestion = cleanAndParseJson(nextQuestion.text as string);
          //generate the audio of the text
          const response = await agent.models.generateContent({
             model: "gemini-2.5-flash-preview-tts",
             contents: [{ parts: [{ text: parsedNextQuestion.question }] }],
             config: {
                   responseModalities: ['AUDIO'],
                   speechConfig: {
                      voiceConfig: {
                         prebuiltVoiceConfig: { voiceName: 'Gacrux' },
                      },
                   },
             },
          });
       
          const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          const rawPcmBuffer = Buffer.from(data, 'base64');
          const wavBuffer = encodeWAV(rawPcmBuffer);

          ws.send(JSON.stringify({
            questionBuffer: wavBuffer,
            status: parsedNextQuestion.status,
            question: parsedNextQuestion.question,
            sessionId: session.id,
          }));
          break;
        }

        case STATUS.ONGOING: {
          //convert the audio to text
          const answerText = await transcribeAudio(parsedData.answer);
          if(!answerText){
            console.log('no answer text found')
            return
          }
          const scoreResponse = await agent.models.generateContent({
            model: "gemini-2.0-flash",
            contents: 'Generate the response',
            config: {
              systemInstruction: generateScoringPrompt({
                question: parsedData.question!,
                answer: answerText,
              }),
            },
          });

          const parsedScore = cleanAndParseJson(scoreResponse.text as string);

          const updatedSession = await prisma.session.update({
            where: { id: parsedData.sessionId! },
            data: {
              conversation: {
                create: {
                  question: parsedData.question!,
                  answer: parsedScore.answer,
                  score: parsedScore.score,
                },
              },
            },
            include: { conversation: true },
          });
          //prepare the converstaion for llm
          const conversationString = updatedSession.conversation
          .map(c => `Q: ${c.question}\nA: ${c.answer}`)
          .join('\n\n');

          const nextQuestion = await agent.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `previous conversation: ${conversationString}\n. Now generate the response`,
            config: {
              systemInstruction: getSystemPrompt(portal),
            },
          });

          const parsedNext = cleanAndParseJson(nextQuestion.text as string);
          //generate the audio of the text
          const response = await agent.models.generateContent({
             model: "gemini-2.5-flash-preview-tts",
             contents: [{ parts: [{ text: parsedNext.question }] }],
             config: {
                   responseModalities: ['AUDIO'],
                   speechConfig: {
                      voiceConfig: {
                         prebuiltVoiceConfig: { voiceName: 'Gacrux' },
                      },
                   },
             },
          });
       
          const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          const rawPcmBuffer = Buffer.from(data, 'base64');
          const wavBuffer = encodeWAV(rawPcmBuffer);


          ws.send(JSON.stringify({
            questionBuffer: wavBuffer,
            status: parsedNext.status,
            question: parsedNext.question,
          }));
          break;
        }

        case STATUS.FINISHED: {
          //write the logic of handling the finished state
          ws.close();
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error("Failed to handle message:", err);
      ws.send(JSON.stringify({ error: "Internal server error" }));
    }
  });
});
