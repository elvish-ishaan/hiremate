"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Eye, Video, VideoOff, MicOff, Mic, PhoneOff, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import InterviewEnded from "@/components/interview/InterviewEnded";

type InterviewState = "connecting" | "ready" | "active" | "ended";

interface ConversationItem {
  question: string;
}

const STATUS_LABELS: Record<InterviewState, string> = {
  connecting: "Connecting...",
  ready: "Ready",
  active: "Live",
  ended: "Ended",
};

const STATUS_COLORS: Record<InterviewState, string> = {
  connecting: "bg-yellow-500",
  ready: "bg-blue-500",
  active: "bg-green-500",
  ended: "bg-red-500",
};

export default function InterviewPage() {
  const { portalId } = useParams();
  const searchParams = useSearchParams();
  const candidateToken = searchParams.get("token") ?? "";
  // Legacy support: fall back to email param if token not present
  const candidateEmail = searchParams.get("email") ?? "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const pendingInterviewEndRef = useRef<boolean>(false);

  const [hasMedia, setHasMedia] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>("connecting");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);

  const playAudioChunk = useCallback((b64: string) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    try {
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const startTime = Math.max(audioCtx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      setIsAgentSpeaking(true);
      source.onended = () => {
        if (nextPlayTimeRef.current <= audioCtx.currentTime + 0.05) {
          setIsAgentSpeaking(false);
          if (pendingInterviewEndRef.current) {
            setIsInterviewEnded(true);
          }
        }
      };
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  }, []);

  const startAudioCapture = useCallback(async (ws: WebSocket) => {
    try {
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      await audioCtx.audioWorklet.addModule("/audio-processor.worklet.js");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1 },
        video: false,
      });

      const source = audioCtx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioCtx, "audio-processor");
      workletNodeRef.current = worklet;

      worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        const int16 = new Int16Array(e.data);

        // Compute RMS to detect speech for visual indicator
        let sumSq = 0;
        for (let i = 0; i < int16.length; i++) {
          sumSq += int16[i] * int16[i];
        }
        const rms = Math.sqrt(sumSq / int16.length);
        if (rms > 500) {
          setIsCandidateSpeaking(true);
          if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
          speakingTimerRef.current = setTimeout(() => setIsCandidateSpeaking(false), 300);
        }

        if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const bytes = new Uint8Array(e.data);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const b64 = btoa(binary);
          ws.send(JSON.stringify({ type: "audio_chunk", data: b64 }));
        }
      };

      source.connect(worklet);
    } catch (err) {
      console.error("Failed to start audio capture:", err);
      toast.error("Failed to start audio capture.");
    }
  }, []);

  // Setup camera video stream (separate from audio capture)
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasMedia(true);
      } catch {
        toast.error("Camera access denied.");
        setHasMedia(false);
      }
    };
    initCamera();
  }, []);

  // WebSocket connection and message handling
  useEffect(() => {
    if (!candidateToken && !candidateEmail) return; // no token or email in the invite link
    const wsQuery = candidateToken
      ? `portalId=${portalId}&token=${candidateToken}`
      : `portalId=${portalId}&email=${encodeURIComponent(candidateEmail)}`;
    const ws = new WebSocket(`ws://localhost:5000?${wsQuery}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "start_interview" }));
    };

    ws.onmessage = async (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "ready": {
            setInterviewState("ready");
            await startAudioCapture(ws);
            break;
          }
          case "audio_chunk": {
            playAudioChunk(msg.data);
            break;
          }
          case "conversation_update": {
            setConversation((prev) => [...prev, { question: msg.question }]);
            setInterviewState("active");
            break;
          }
          case "interview_ended": {
            const audioCtx = audioCtxRef.current;
            const isAudioPlaying = audioCtx && nextPlayTimeRef.current > audioCtx.currentTime + 0.05;
            if (isAudioPlaying) {
              // Wait for the AI's farewell audio to finish before showing the ended screen
              pendingInterviewEndRef.current = true;
            } else {
              setIsInterviewEnded(true);
            }
            break;
          }
          case "error": {
            toast.error(msg.message || "An error occurred");
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };

    return () => {
      ws.close();
      audioCtxRef.current?.close();
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    };
  }, [portalId, candidateToken, candidateEmail, startAudioCapture, playAudioChunk]);

  // Scroll to latest conversation item
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleEndInterview = () => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "end_interview" }));
      ws.close();
    }
    setIsInterviewEnded(true);
  };

  const handleMuteToggle = () => {
    isMutedRef.current = !isMuted;
    setIsMuted(!isMuted);
  };

  const isConnecting = interviewState === "connecting";

  if (!candidateToken && !candidateEmail) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-gray-800">Invalid invite link</p>
          <p className="text-sm text-gray-500">This link is missing an interview token. Please use the private link sent to your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isInterviewEnded ? (
        <InterviewEnded />
      ) : (
        <div className="flex h-screen bg-gray-50">
          {/* Left Section */}
          <div className="flex-1 flex flex-col bg-black relative">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Interview in Progress</span>
              </div>
              <Badge className={`${STATUS_COLORS[interviewState]} text-white border-0`}>
                {STATUS_LABELS[interviewState]}
              </Badge>
            </div>

            {/* Camera and Agent Side by Side */}
            <div className="flex-1 flex gap-4 p-4 pt-16 pb-24">
              {/* Camera Section */}
              <div className="flex-1 relative rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isCandidateSpeaking
                      ? "ring-4 ring-blue-400 ring-opacity-75 shadow-lg shadow-blue-400/50"
                      : isVideoOff
                      ? "opacity-0"
                      : ""
                  }`}
                />

                {isCandidateSpeaking && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">You're speaking</span>
                  </div>
                )}

                {!hasMedia && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
                    <div className="text-white text-center">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Camera access required</p>
                    </div>
                  </div>
                )}

                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-xl">
                    <div className="text-white text-center">
                      <VideoOff className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Camera is off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Section */}
              <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden rounded-xl">
                {isConnecting && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 rounded-xl gap-4">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                    <p className="text-white font-medium text-sm">
                      Connecting to your interviewer...
                    </p>
                    <p className="text-slate-400 text-xs text-center px-6">
                      Please wait while we set up your session
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center transition-all duration-300 ${
                      isAgentSpeaking
                        ? "ring-4 ring-purple-400 ring-opacity-75 shadow-lg shadow-purple-400/50 scale-110"
                        : ""
                    }`}
                  >
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                </div>

                {isAgentSpeaking && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">AI is speaking</span>
                  </div>
                )}

                {isAgentSpeaking && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-purple-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.8s",
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-12 h-12 ${
                  isMuted
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white/90 text-gray-700"
                }`}
                onClick={handleMuteToggle}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-12 h-12 ${
                  isVideoOff
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white/90 text-gray-700"
                }`}
                onClick={() => setIsVideoOff(!isVideoOff)}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <Video className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="destructive"
                className="rounded-full px-5 h-12 gap-2"
                onClick={handleEndInterview}
              >
                <PhoneOff className="w-5 h-5" />
                End Interview
              </Button>
            </div>
          </div>

          {/* Right Section - Questions */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Interview Questions</h2>
              </div>
            </div>

            {conversation.length === 0 && (
              <div className="p-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  How it works
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-sm text-gray-600">
                      Wait for the AI interviewer to ask a question — it will speak out loud.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-sm text-gray-600">
                      Speak your answer clearly after the question ends. Your mic is always on.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-sm text-gray-600">
                      Questions will appear here as the interview progresses.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {isConnecting
                      ? "Connecting to session..."
                      : "Waiting for the first question..."}
                  </p>
                </div>
              ) : (
                conversation.map((item, index) => {
                  const isLatest = index === conversation.length - 1;
                  return (
                    <Card
                      key={`question-${index}`}
                      className={`p-4 transition-all duration-300 ${
                        isLatest
                          ? "border-2 border-blue-400 bg-blue-50 shadow-md"
                          : "border border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">
                          Q{index + 1}
                        </span>
                        <p
                          className={`text-sm ${
                            isLatest ? "text-blue-900 font-medium" : "text-gray-700"
                          }`}
                        >
                          {item.question}
                        </p>
                      </div>
                    </Card>
                  );
                })
              )}
              <div ref={conversationEndRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
