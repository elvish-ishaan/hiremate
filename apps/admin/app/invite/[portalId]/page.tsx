"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, PhoneCall, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MicVAD } from "@ricky0123/vad-web";

enum InterviewStatus {
  PING = "ping",
  START = "start",
  ONGOING = "ongoing",
  FINISHED = "finished",
}

interface Conversation {
  agent: string;
}

// Helper to hash audio chunks
function hashFloat32Array(arr: Float32Array): string {
  let hash = 0;
  for (let i = 0; i < arr.length; i++) {
    hash = ((hash << 5) - hash) + Math.floor(arr[i] * 100000);
    hash |= 0;
  }
  return hash.toString();
}

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
  const userId = "258ff316-ea42-49a7-83cf-9a36e6897bc6";

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
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.sessionId) setSessionId(data.sessionId);
      setStatus(data.status);
      setLatestQuestion(data.question);
      setConversation((prev) => [...prev, { agent: data.question }]);

      const buffer = new Uint8Array(data.questionBuffer?.data || []);
      const blob = new Blob([buffer], { type: "audio/wav" });
      setAudioBuffer(blob);
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
        redemptionFrames: 30,
        preSpeechPadFrames: 3,
        minSpeechFrames: 10,
        submitUserSpeechOnPause: true,
        onSpeechEnd: (audio: Float32Array) => {
          let count = 1;
          console.log(audio,'getting audio time:', count);
          count++;
          
          if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(
              JSON.stringify({
                status,
                answer: audio,
                question: latestQuestion,
                sessionId,
              })
            );
          }
        },
      });

       myvad.start();
    };

    initAudio();
  }, [latestQuestion, webSocket]);

  return (
    <div className="flex justify-between min-h-screen">
      {/* Camera + User Preview */}
      <div className="bg-black flex flex-col w-full items-center justify-center p-6 relative">
        <div className="w-full h-full flex justify-between items-center">
          <div className="text-primary font-semibold flex gap-2">
            <Eye /> You are under observation
          </div>
          <Badge className="px-3 py-1">{status}</Badge>
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-xl w-full aspect-video border"
        />
        {!hasMedia && (
          <div className="absolute text-white text-center text-sm">
            Please allow camera & mic access to continue.
          </div>
        )}
        <div className="p-3">
          <Button className="bg-red-700 w-20">
            <PhoneCall className="text-white" />
          </Button>
        </div>
      </div>

      {/* AI + Chat Interface */}
      <div className="flex flex-col w-1/2 p-6 gap-4 bg-muted/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="text-primary" />
          <h2 className="text-lg font-semibold">AI Interview Assistant</h2>
        </div>
        <Card className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3">
          {conversation.map((msg, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              {msg.agent && (
                <div className="text-primary text-sm flex gap-2">
                  <Bot className="text-primary size-15" />
                  {msg.agent}
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
