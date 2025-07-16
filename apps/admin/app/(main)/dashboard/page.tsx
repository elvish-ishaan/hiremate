"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const userName = "Ishaan"; // Replace with dynamic name if available
  const recentPortals = [
    { id: 1, name: "Frontend Developer Test", createdAt: "2025-07-10" },
    { id: 2, name: "Data Science Round 1", createdAt: "2025-07-05" },
    { id: 3, name: "React Intern Screening", createdAt: "2025-06-28" },
  ];

  const handleCreatePortal = () => {
    console.log("Redirect to create portal flow...");
    // router.push("/dashboard/portals/create")
  };

  return (
    <div className="p-6 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-primary">
          Welcome back, {userName} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Here’s a quick overview of your activity.
        </p>
      </div>

      {/* Recent Portals */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Portals</h2>
          <Button onClick={handleCreatePortal}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPortals.map((portal) => (
            <Card key={portal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{portal.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Created on: {portal.createdAt}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
