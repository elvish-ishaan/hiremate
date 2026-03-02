"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { getStorageItem } from "@/lib/storage";

export default function CreatePortalPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    jobType: "",
    department: "",
    skillsRequired: "",
    organizationId: "",
  });

  useEffect(() => {
    const org = JSON.parse(getStorageItem("organization") || "{}");
    setForm((prev) => ({ ...prev, organizationId: org.id || "" }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const portalData = {
      ...form,
      skillsRequired: form.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await axios.post(`${API_URL}/portal/create-portal`, portalData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStorageItem("token")}`,
        },
      });
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      setForm({
        title: "",
        description: "",
        role: "",
        jobType: "",
        department: "",
        skillsRequired: "",
        organizationId: "",
      });
      toast.success("Portal created successfully");
      router.push("/portals");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">
          Create New Job Portal
        </h1>
        <p className="text-muted-foreground text-sm">
          Set up a new hiring portal by filling in the required details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="my-2" htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g., React Developer Internship"
              />
            </div>
            <div>
              <Label className="my-2" htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <div>
              <Label className="my-2" htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <Label className="my-2" htmlFor="jobType">Job Type</Label>
              <Input
                id="jobType"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                required
                placeholder="e.g., Full-time / Internship"
              />
            </div>
          </div>

          <div>
            <Label className="my-2" htmlFor="skillsRequired">Skills Required</Label>
            <Input
              id="skillsRequired"
              name="skillsRequired"
              value={form.skillsRequired}
              onChange={handleChange}
              placeholder="Comma-separated, e.g., React, Tailwind, TypeScript"
            />
          </div>

          <div>
            <Label className="my-2" htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description of the job portal"
            />
          </div>
        </Card>

        <Button type="submit" className="w-full text-base py-5 rounded-xl">
          Create Portal
        </Button>
      </form>
    </div>
  );
}
