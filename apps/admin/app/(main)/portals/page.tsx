"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const PortalsPage = () => {
  const router = useRouter();
  const [portals, setPortals] = useState<Portal[]>([]);
  const [orgId, setOrgId] = useState<string>("9b6d4ff3-dbd2-441e-9acb-101e846d8718");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        const res = await axios.get(`${API_URL}/portal/${orgId}/list-portals`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.data.success) {
          toast.error(res.data.message);
        }

        setPortals(res.data?.portals || []);
      } catch (error) {
        toast.error("Failed to fetch portals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortals();
  }, [orgId]);

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
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full mt-2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-3" />
                <Skeleton className="h-4 w-1/4" />
              </Card>
            ))
          : portals.map((portal) => (
              <Card key={portal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {portal.title}
                    </CardTitle>
                    <Badge
                      variant={portal.status === "opened" ? "default" : "outline"}
                      className={
                        portal.status === "closed"
                          ? "text-red-500 border-red-500"
                          : ""
                      }
                    >
                      {portal.status === "opened" ? "Opened" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    • {portal.jobType}
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
