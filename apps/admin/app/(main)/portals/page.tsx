"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Dummy portal data matching Prisma schema + new status & date fields
const dummyPortals = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    description: "We’re hiring a frontend dev intern with React skills.",
    role: "Frontend Developer",
    skillsRequired: ["React", "Tailwind", "TypeScript"],
    candidates: ["user1", "user2"],
    jobType: "Internship",
    department: "Engineering",
    status: "opened",
    createdAt: "2025-07-10T09:00:00.000Z",
    updatedAt: "2025-07-12T14:35:00.000Z",
    organization: {
      id: "org1",
      name: "TechVerse Inc.",
      logo: null,
    },
  },
  {
    id: "2",
    title: "Data Scientist",
    description: "Looking for an experienced ML/Data Science expert.",
    role: "Data Scientist",
    skillsRequired: ["Python", "Pandas", "ML"],
    candidates: ["user3"],
    jobType: "Full-time",
    department: "AI Research",
    status: "closed",
    createdAt: "2025-07-01T10:30:00.000Z",
    updatedAt: "2025-07-08T08:20:00.000Z",
    organization: {
      id: "org2",
      name: "NeuralSoft",
      logo: null,
    },
  },
  {
    id: "3",
    title: "UI/UX Designer",
    description: "Creative UI/UX Designer needed for mobile-first apps.",
    role: "Designer",
    skillsRequired: ["Figma", "UX Research", "Design Systems"],
    candidates: [],
    jobType: "Contract",
    department: "Product Design",
    status: "opened",
    createdAt: "2025-06-28T13:15:00.000Z",
    updatedAt: "2025-07-03T16:00:00.000Z",
    organization: {
      id: "org3",
      name: "PixelStack",
      logo: null,
    },
  },
];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PortalsPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header + Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">All Job Portals</h1>
          <p className="text-sm text-muted-foreground">
            These are the portals currently configured across your organizations.
          </p>
        </div>
        <Button onClick={() => router.push("/portals/createPortal")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Portal
        </Button>
      </div>

      {/* Portal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyPortals.map((portal) => (
          <Card key={portal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{portal.title}</CardTitle>
                <Badge
                  variant={portal.status === "opened" ? "default" : "outline"}
                  className={portal.status === "closed" ? "text-red-500 border-red-500" : ""}
                >
                  {portal.status === "opened" ? "Opened" : "Closed"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {portal.organization.name} • {portal.jobType}
              </p>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <p>{portal.description}</p>
              <div className="flex flex-wrap gap-2">
                {portal.skillsRequired.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>Department: {portal.department}</p>
                <p>Candidates: {portal.candidates.length}</p>
                <p>Created: {formatDate(portal.createdAt)}</p>
                <p>Updated: {formatDate(portal.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortalsPage;
