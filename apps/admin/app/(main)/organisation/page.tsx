"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";

export default function CreateOrganizationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    logo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const organizationData = {
      ...form,
      logo: form.logo.trim() === "" ? null : form.logo,
    };

    try {
        //send with token
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/organization/create-organization`, organizationData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!res.data.success) {
            toast.error(res.data.message);
        }
        toast.success("Organization created successfully");
    } catch (error) {
        toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">
          Create Organization
        </h1>
        <p className="text-muted-foreground text-sm">
          Add a new organization for managing job portals and hiring.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <div>
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g., Acme Corporation"
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo URL (optional)</Label>
            <Input
              id="logo"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </Card>

        <Button type="submit" className="w-full text-base py-5 rounded-xl">
          Create Organization
        </Button>
      </form>
    </div>
  );
}
