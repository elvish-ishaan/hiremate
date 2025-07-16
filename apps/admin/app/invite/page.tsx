"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";


export default function JoinPortalPage() {
 const searchParams = useSearchParams();
  const portalId = searchParams.get("portalId");
  const router = useRouter();

  const [portal, setPortal] = useState<Portal | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    // TODO: Replace with API call
    const fetchPortal = async () => {
      const res = await axios.get(`${API_URL}/portal/${portalId}`);
      console.log(res,'getting res from interview page')
      if (!res.data.success) {
        toast.error(res.data.message);
      }
      setPortal(res.data.data);
    };
    fetchPortal();
  }, [portalId]);

  const handleStart = () => {
    if (!acceptedTerms) {
      toast.error("You must accept the instructions to proceed.");
      return;
    }

    // Redirect to interview (you can include session or candidate info here)
    router.push(`/interview/${portal?.id}`);
  };

  if (!portal) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Joining Portal: {portal.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          Read the following carefully before beginning your interview.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>Role:</strong> {portal.role}</p>
          <p><strong>Job Type:</strong> <Badge>{portal.jobType}</Badge></p>
          <p><strong>Department:</strong> {portal.department}</p>
          <p className="pt-2">{portal.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <ul className="list-disc pl-5 space-y-1">
            <li>Do not navigate to other tabs or applications during the interview.</li>
            <li>Make sure you're in a quiet, distraction-free environment.</li>
            <li>Webcam and microphone should be turned on at all times.</li>
            <li>Do not seek help from other people or external tools.</li>
            <li>Follow instructions on screen for each question — you may be auto-evaluated.</li>
            <li>Your screen, audio, and behavior may be monitored for fairness.</li>
            <li>Looking away from the screen repeatedly may result in a lower score.</li>
          </ul>

          <div className="flex items-start gap-2 pt-3">
            <Checkbox
              id="accept"
              checked={acceptedTerms}
              onCheckedChange={(val) => setAcceptedTerms(!!val)}
            />
            <Label htmlFor="accept" className="text-sm leading-snug">
              I have read and understood the above instructions and agree to follow them during the interview.
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button
        disabled={!acceptedTerms}
        onClick={handleStart}
        className="w-full text-base py-5 rounded-xl"
      >
        Start Interview
      </Button>
    </div>
  );
}
