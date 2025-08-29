"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
// import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";

export default function CreatePortalPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    jobType: "",
    department: "",
    skillsRequired: "",
    organizationId: JSON.parse(localStorage.getItem('organization') || "{}").id,
  });
  const [candidates, setCandidates] = useState<string[]>([]);

  // const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setCsvFile(e.target.files[0]);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //send portal data wiht org id
    const portalData = {
      ...form,
      candidates,
      skillsRequired: form.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
        const res = await axios.post(`${API_URL}/portal/create-portal`, portalData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
        });
        if (!res.data.success) {
            toast.error(res.data.message);
        }
        //clear form
        setForm({
            title: "",
            description: "",
            role: "",
            jobType: "",
            department: "",
            skillsRequired: "",
            organizationId: "",
        });
        setCandidates([]);
        toast.success("Portal created successfully");
    } catch (error) {
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
              <Label className=" my-2" htmlFor="title">Title</Label>
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
              <Label className=" my-2" htmlFor="role">Role</Label>
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
              <Label className=" my-2" htmlFor="department">Department</Label>
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
              <Label className=" my-2" htmlFor="jobType">Job Type</Label>
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
            <Label className=" my-2" htmlFor="skillsRequired">Skills Required</Label>
            <Input
              id="skillsRequired"
              name="skillsRequired"
              value={form.skillsRequired}
              onChange={handleChange}
              placeholder="Comma-separated, e.g., React, Tailwind, TypeScript"
            />
          </div>

          <div>
            <Label className=" my-2" htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description of the job portal"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="text-lg font-medium">Candidate Input</h2>

          <div>
            <Label className=" my-2" htmlFor="candidates">Candidate Emails</Label>
            <Input
              id="candidate"
              name="candidates"
              value={candidates}
              onChange={(e) => setCandidates((prev) => [...prev, e.target.value])}
              placeholder="Comma-separated emails, e.g., user1@mail.com, user2@mail.com"
            />
          </div>

          {/* <div>
            <Label className=" my-2" htmlFor="csvFile">Upload CSV</Label>
            <div className="flex items-center gap-4">
              <Input id="csvFile" type="file" accept=".csv" onChange={handleCsvUpload} />
              {csvFile && (
                <span className="text-sm text-muted-foreground">
                  {csvFile.name}
                </span>
              )}
            </div>
          </div> */}
        </Card>

        <Button type="submit" className="w-full text-base py-5 rounded-xl">
          Create Portal
        </Button>
      </form>
    </div>
  );
}
