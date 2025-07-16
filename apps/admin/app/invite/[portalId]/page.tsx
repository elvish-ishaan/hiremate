"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Bot } from "lucide-react";
import { toast } from "sonner";

export default function InterviewPage() {
  const { portalId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Welcome to your AI interview! Ready to begin?" },
  ]);
  const [input, setInput] = useState("");

  const [hasMedia, setHasMedia] = useState(false);

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

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);

    // Simulate AI response (Replace this with WebSocket or API)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: `AI says: "${input}" — interesting!` },
      ]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Camera + User Preview */}
      <div className="bg-black flex items-center justify-center p-6 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-xl w-full max-w-md aspect-video border border-white/20"
        />
        {!hasMedia && (
          <div className="absolute text-white text-center text-sm">
            Please allow camera & mic access to continue.
          </div>
        )}
      </div>

      {/* AI + Chat Interface */}
      <div className="flex flex-col p-6 gap-4 bg-muted/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="text-primary" />
          <h2 className="text-lg font-semibold">AI Interview Assistant</h2>
        </div>

        <Card className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 text-sm max-w-sm ${
                  msg.from === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </Card>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer or message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button type="button" onClick={handleSend}>
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
