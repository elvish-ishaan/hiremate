"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Eye, Video, VideoOff, MicOff, Mic, PhoneOff, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MicVAD } from "@ricky0123/vad-web";
import InterviewEnded from "@/components/interview/InterviewEnded";

enum InterviewStatus {
  PING = "ping",
  START = "start",
  ONGOING = "ongoing",
  FINISHED = "finished",
}

interface Conversation {
  agent: string;
}

const STATUS_LABELS: Record<InterviewStatus, string> = {
  [InterviewStatus.PING]: "Connecting...",
  [InterviewStatus.START]: "Starting",
  [InterviewStatus.ONGOING]: "Live",
  [InterviewStatus.FINISHED]: "Ended",
};

export default function InterviewPage() {
  const { portalId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasMedia, setHasMedia] = useState(false);
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.PING);
  const [latestQuestion, setLatestQuestion] = useState<string>("");
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<Blob | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const userId = "258ff316-ea42-49a7-83cf-9a36e6897bc6";

  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Setup camera & mic
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasMedia(true);
      } catch (err) {
        toast.error("Camera or microphone access denied.");
        setHasMedia(false);
      }
    };
    initMedia();
  }, []);

  // Init WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:5000?portalId=${portalId}&userId=${userId}`);
    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(JSON.stringify({ status: InterviewStatus.PING }));
      setWebSocket(socket);
    };
    socket.onclose = (event) => {
      setWebSocket(null);
      console.log("WebSocket closed:", event.code, event.reason);
    };
    return () => socket.close();
  }, [portalId]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = (event: MessageEvent) => {
      setIsAgentSpeaking(true);
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.status === InterviewStatus.FINISHED) {
        setIsInterviewEnded(true);
      }
      if (data.status) setStatus(data.status);
      setLatestQuestion(data.question);
      setConversation((prev) => [...prev, { agent: data.question }]);

      const buffer = new Uint8Array(data.questionBuffer?.data || []);
      const blob = new Blob([buffer], { type: "audio/wav" });
      setAudioBuffer(blob);
      setIsAgentSpeaking(false);
    };

    webSocket.addEventListener("message", handleMessage);
    return () => webSocket.removeEventListener("message", handleMessage);
  }, [webSocket]);

  // Play incoming audio
  useEffect(() => {
    if (audioBuffer) {
      const audio = new Audio(URL.createObjectURL(audioBuffer));
      audio.play();
    }
  }, [audioBuffer]);

  // Initialize VAD per new question
  useEffect(() => {
    if (!latestQuestion) return;

    const initAudio = async () => {
      const myvad = await MicVAD.new({
        model: "v5",
        positiveSpeechThreshold: 0.65,
        negativeSpeechThreshold: 0.25,
        redemptionFrames: 60,
        preSpeechPadFrames: 3,
        minSpeechFrames: 10,
        submitUserSpeechOnPause: true,
        onSpeechStart: () => {
          setIsCandidateSpeaking(true);
        },
        onSpeechEnd: (audio: Float32Array) => {
          let audioCounter = 0;
          if (audioCounter > 0) {
            console.log("audio counter is greater than 0, not sending answer");
            return;
          }
          setIsCandidateSpeaking(false);

          if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(
              JSON.stringify({
                status,
                answer: audio,
                question: latestQuestion,
                sessionId,
              })
            );
            audioCounter++;
            console.log("incrementing audio counter to", audioCounter);
          }
        },
      });

      myvad.start();
    };

    initAudio();
  }, [latestQuestion]);

  // Scroll to latest question
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleEndInterview = () => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ status: InterviewStatus.FINISHED, sessionId }));
      webSocket.close();
    }
    setIsInterviewEnded(true);
  };

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.PING:
        return "bg-yellow-500";
      case InterviewStatus.START:
        return "bg-blue-500";
      case InterviewStatus.ONGOING:
        return "bg-green-500";
      case InterviewStatus.FINISHED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const isConnecting = status === InterviewStatus.PING;

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
              <Badge className={`${getStatusColor(status)} text-white border-0`}>
                {STATUS_LABELS[status]}
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
                {/* Connecting Overlay */}
                {isConnecting && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 rounded-xl gap-4">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                    <p className="text-white font-medium text-sm">Connecting to your interviewer...</p>
                    <p className="text-slate-400 text-xs text-center px-6">
                      Please wait while we set up your session
                    </p>
                  </div>
                )}

                {/* AI Agent Avatar */}
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

            {/* Controls - centered at bottom */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-12 h-12 ${isMuted ? "bg-red-500 text-white border-red-500" : "bg-white/90 text-gray-700"}`}
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-12 h-12 ${isVideoOff ? "bg-red-500 text-white border-red-500" : "bg-white/90 text-gray-700"}`}
                onClick={() => setIsVideoOff(!isVideoOff)}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
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
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Interview Questions</h2>
              </div>
            </div>

            {/* How it works — shown only before first question */}
            {conversation.length === 0 && (
              <div className="p-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How it works</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-gray-600">Wait for the AI interviewer to ask a question — it will speak out loud.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-gray-600">Speak your answer clearly after the question ends. Your mic is always on.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-gray-600">Questions will appear here as the interview progresses.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {isConnecting ? "Connecting to session..." : "Waiting for the first question..."}
                  </p>
                </div>
              ) : (
                conversation.map((question, index) => {
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
                        <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">Q{index + 1}</span>
                        <p className={`text-sm ${isLatest ? "text-blue-900 font-medium" : "text-gray-700"}`}>
                          {question.agent}
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
