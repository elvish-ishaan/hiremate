"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Home, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InterviewEnded() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="max-w-md w-full text-center p-8 shadow-xl backdrop-blur-lg border border-primary/20 bg-white/80 dark:bg-black/20">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 className="text-green-500 w-12 h-12" />
          <h2 className="text-2xl font-semibold text-primary">Interview Completed</h2>
          <p className="text-muted-foreground text-sm">
            Thank you for participating. Your responses have been recorded.
          </p>
          <div className="flex gap-3 mt-4 w-full justify-center">
            <Button
              variant="default"
              className="bg-primary w-32"
              onClick={() => router.push("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="outline"
              className="w-32"
              onClick={() => router.refresh()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
