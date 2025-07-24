"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, PhoneCall, Eye, Video, VideoOff, MicOff, Mic } from "lucide-react";
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
      //agent is speaking
      setIsAgentSpeaking(true)
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.sessionId) setSessionId(data.sessionId);
      //if interview is ended, set isInterviewEnded to true
      if (data.status === InterviewStatus.FINISHED) {
        setIsInterviewEnded(true);
      }
      setStatus(data.status);
      setLatestQuestion(data.question);
      setConversation((prev) => [...prev, { agent: data.question }]);

      const buffer = new Uint8Array(data.questionBuffer?.data || []);
      const blob = new Blob([buffer], { type: "audio/wav" });
      setAudioBuffer(blob);
      setIsAgentSpeaking(false)
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
          setIsCandidateSpeaking(true)
        },
        onSpeechEnd: (audio: Float32Array) => {
          //check duplication 
          let audioCounter = 0;
          if (audioCounter > 0){
            console.log('audio counter is greater than 0, not sending answer');
            return;
          };
          setIsCandidateSpeaking(false)
          
          if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(
              JSON.stringify({
                status,
                answer: audio,
                question: latestQuestion,
                sessionId,
              })
            );
            //increment audio counter
            audioCounter++;
            console.log('incrementing audio counter to', audioCounter);

          }
        },
      });

       myvad.start();
    };

    initAudio();
  }, [latestQuestion]);

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

  return (
    <>
     {
      //if interview is ended, show a message else show the interview
      isInterviewEnded ? <InterviewEnded/> :
       <div className="flex h-screen bg-gray-50">
      {/* Left Section - Camera & Agent Side by Side */}
      <div className="flex-1 flex flex-col bg-black relative">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Interview in Progress</span>
          </div>
          <Badge className={`${getStatusColor(status)} text-white border-0`}>
            {status.toUpperCase()}
          </Badge>
        </div>

        {/* Camera and Agent Side by Side */}
        <div className="flex-1 flex gap-4 p-4 pt-16">
          {/* Camera Section */}
          <div className="flex-1 relative rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-300 ${
                isCandidateSpeaking 
                  ? 'ring-4 ring-blue-400 ring-opacity-75 shadow-lg shadow-blue-400/50' 
                  : isVideoOff 
                  ? 'opacity-0' 
                  : ''
              }`}
            />
            
            {/* Speaking Indicator for Candidate */}
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
            {/* AI Agent Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center transition-all duration-300 ${
                isAgentSpeaking 
                  ? 'ring-4 ring-purple-400 ring-opacity-75 shadow-lg shadow-purple-400/50 scale-110' 
                  : ''
              }`}>
                <Bot className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Speaking Indicator for Agent */}
            {isAgentSpeaking && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <span className="text-sm font-medium">AI is speaking</span>
              </div>
            )}

            {/* Audio Waveform Effect */}
            {isAgentSpeaking && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s'
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-12 transform -translate-x-1/2 flex flex-col gap-3">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'}`}
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Right Section - Questions */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Interview Questions</h2>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
  {conversation.map((question, index) => {
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
        <p className={`text-sm ${isLatest ? "text-blue-900 font-medium" : "text-gray-700"}`}>
          {question.agent}
        </p>
      </Card>
    );
  })}
</div>
      </div>
     </div>
     }
    </>
  );
}
