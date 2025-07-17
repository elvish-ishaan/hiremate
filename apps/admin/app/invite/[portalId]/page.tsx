"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot, PhoneCall, User2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MicVAD } from "@ricky0123/vad-web"


enum InterviewStatus {
    PING = "ping",
    START = "start",
    ONGOING = 'ongoing',
    FINISHED = 'finished'
}

interface Conversation {
  agent: string;
  candidate?: string;
}

export default function InterviewPage() {
  const { portalId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Welcome to your AI interview! Ready to begin?" },
  ]);
  const [input, setInput] = useState("");
  const [hasMedia, setHasMedia] = useState(false);
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.PING);
  const [latestQuestion, setLatestQuestion] = useState<string>("");
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Float32Array[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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

  const userId = "258ff316-ea42-49a7-83cf-9a36e6897bc6"
  //init the websocker connection 
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:5000?portalId=${portalId}&userId=${userId}`);
    socket.onopen = () => {
      console.log("WebSocket connection established.");
      //send the ping message on server
      socket.send(JSON.stringify({ status: InterviewStatus.PING }));
      //set the socket state
      setWebSocket(socket);
    };
    socket.onclose = (event) => {
      //clear the socket state
      setWebSocket(null);
      console.log("WebSocket connection closed:", event.code, event.reason);
    };
    return () => {
      socket.close();
    };
  }, []);

  //listen for the incoming messages
  if(!webSocket) return;
  webSocket.onmessage = (event) => {
      console.log('recve...............')
      const data = JSON.parse(event.data);
      console.log("Received message from server:", data);
      setStatus(data.status);
      
      setLatestQuestion(data.question);
      setConversation([...conversation, { agent: data.question, candidate: "yeah i can tell you"}])
      const buffer = new Uint8Array(data.questionBuffer?.data);
      // Create a blob from it
      const blob = new Blob([buffer], { type: 'audio/wav' });
      console.log(blob)
      setAudioBuffer(blob);
      
    };

  //init the audio
  const initAudio = async () => {
    //check if question is empty
    if(!latestQuestion) return
    const myvad = await MicVAD.new({
    
    onSpeechEnd: (audio: Float32Array) => {
       setRecordedChunks([...recordedChunks, audio])
       //send the audio to server to get text back
       webSocket.send(JSON.stringify({ 
        status: status,
        answer: audio,
        question: latestQuestion,
        }));
    },
})
myvad.start()
  }
  initAudio()


  return (
    <div className="flex justify-between min-h-screen">
      {/* Camera + User Preview */}
      <div className="bg-black flex flex-col w-full items-center justify-center p-6 relative">
        <div className=" w-full h-full flex justify-between items-center">
           <div className=" text-primary font-semibold flex gap-2"><Eye/> You are under observation</div>
           <Badge className=" px-3 py-1">{status}</Badge>
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
        <div className=" p-3"> 
           <Button className=" bg-red-700 w-20"><PhoneCall className=" text-white"/></Button>
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
            <div className=" flex flex-col gap-2">
              {msg.agent && <div className="text-primary text-sm flex gap-2"> <Bot className="text-primary size-15" />{msg.agent}</div>}
              <Separator/>
              {msg.candidate && <div className="text-white text-sm flex gap-2"><User2 className=" text-white size-5" />{msg.candidate}</div>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
