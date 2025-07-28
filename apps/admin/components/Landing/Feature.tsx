import React from "react";
import { ShineBorder } from "../magicui/shine-border";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Sparkles,
  CheckCircle,
  BadgeCheck,
  UserCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { DotPattern } from "../magicui/dot-pattern";
import { cn } from "@/lib/utils";

const features = [
  {
    id: 1,
    title: "Automate Interviews",
    description: "AI handles end-to-end interviews with smart question logic.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Cheat Detection",
    description: "Advanced behavior & environmental analysis for fairness.",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Scoring System",
    description: "Auto-score answers using accuracy, tone, and completeness.",
    icon: CheckCircle,
  },
  {
    id: 4,
    title: "Candidate Reports",
    description: "Get full breakdowns: answers, scores, transcripts, and more.",
    icon: FileText,
  },
  {
    id: 5,
    title: "Human-like AI Agent",
    description: "Dynamic follow-ups & adaptive questioning like real interviews.",
    icon: UserCheck,
  },
  {
    id: 6,
    title: "Efficient Evaluation",
    description: "Quickly compare candidates with summarized metrics.",
    icon: BadgeCheck,
  },
];

const Feature = () => {
  return (
    <div
  className="w-full flex flex-col items-center justify-center px-6 py-16
    bg-[linear-gradient(to_right,rgba(0,0,0,0.5),rgba(0,128,0,0.2))]
    backdrop-blur-xl 
    border border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
>
      <h1 className="text-3xl font-semibold text-primary text-center mb-10">
        Features
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.id}
              className="relative hover:scale-105 transition-all h-44 w-full max-w-xs mx-auto overflow-hidden flex flex-col justify-center px-4 py-3 text-left" 
            >
              <ShineBorder shineColor={["#52b788", "#2d6a4f", "#FFBE7B"]} />
              <CardHeader className="flex flex-col items-center text-center space-x-4 p-0">
                <div className="flex-shrink-0">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold text-primary">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground leading-snug">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Feature;
