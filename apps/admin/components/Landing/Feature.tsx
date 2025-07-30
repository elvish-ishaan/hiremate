import React from "react";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle,
  BadgeCheck,
  UserCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";

const colors = ["#52b788", "#2d6a4f", "#FFBE7B", "#495057"];

const features = [
  {
    id: 1,
    title: "Automate Interviews",
    description: "AI handles end-to-end interviews with smart question logic.",
    details:
      "Our AI dynamically adjusts questions based on candidate responses, ensuring personalized and adaptive assessments.",
    icon: Sparkles,
    cta: "See it in Action",
  },
  {
    id: 2,
    title: "Cheat Detection",
    description:
      "Advanced behavior & environmental analysis for fairness.",
    details:
      "Face detection, screen monitoring, and room scanning ensure candidates are fairly evaluated with zero tolerance for misconduct.",
    icon: ShieldCheck,
    cta: "Explore Security",
  },
  {
    id: 3,
    title: "Scoring System",
    description:
      "Auto-score answers using accuracy, tone, and completeness.",
    details:
      "Scoring is powered by AI models trained to evaluate technical content, tone modulation, and relevance to job roles.",
    icon: CheckCircle,
    cta: "View Scoring Model",
  },
  {
    id: 4,
    title: "Candidate Reports",
    description:
      "Get full breakdowns: answers, scores, transcripts, and more.",
    details:
      "Post-interview reports include transcripts, emotion tracking, and scoring breakdowns for full visibility.",
    icon: FileText,
    cta: "Download Sample Report",
  },
  {
    id: 5,
    title: "Human-like AI Agent",
    description:
      "Dynamic follow-ups & adaptive questioning like real interviews.",
    details:
      "Our AI recruiter mimics real-time follow-ups based on candidate expressions and response depth.",
    icon: UserCheck,
    cta: "Meet the Agent",
  },
  {
    id: 6,
    title: "Efficient Evaluation",
    description:
      "Quickly compare candidates with summarized metrics.",
    details:
      "Dashboards help filter, rank, and shortlist the best candidates at scale — saving hours of manual screening.",
    icon: BadgeCheck,
    cta: "Try Comparison Tool",
  },
];

export function Feature() {
  return (
    <section className="w-full min-h-screen px-6 sm:px-12 bg-background text-foreground">
      {/* Hero Heading */}
      <div className="flex justify-center items-center min-h-[30vh]">
        <BoxReveal boxColor="#52b788" duration={0.7}>
          <h2 className="text-5xl sm:text-6xl font-bold text-center text-primary">
            Why Teams Choose Us
          </h2>
        </BoxReveal>
      </div>

      {/* Feature List */}
      <div className="max-w-5xl mx-auto flex flex-col items-start gap-32">
        {features.map(({ id, title, description, details, icon: Icon, cta }, index) => {
          const color = colors[index % colors.length];

          return (
            <div key={id} className="w-full flex flex-col items-start text-left">
              <BoxReveal boxColor={color} duration={0.4}>
                <Icon className="w-10 h-10 text-primary mb-4" />
              </BoxReveal>

              <BoxReveal boxColor={color} duration={0.5}>
                <h3 className="text-3xl sm:text-4xl font-semibold text-primary mb-2">
                  {title}
                </h3>
              </BoxReveal>

              <BoxReveal boxColor={color} duration={0.5}>
                <p className="text-lg text-muted-foreground mb-1 max-w-2xl">
                  {description}
                </p>
              </BoxReveal>

              <BoxReveal boxColor={color} duration={0.5}>
                <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
                  {details}
                </p>
              </BoxReveal>

              <BoxReveal boxColor={color} duration={0.5}>
                <Button className="bg-[#52b788] hover:bg-[#40916c]">{cta}</Button>
              </BoxReveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
