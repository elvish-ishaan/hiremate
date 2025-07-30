"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import Loader from "../loaders/loader";

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrgModal = ({
  open,
  onOpenChange,
}: CreateOrganizationModalProps) => {
  const [form, setForm] = useState({
    name: "",
    logo: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    const organizationData = {
      ...form,
      logo: form.logo.trim() === "" ? null : form.logo,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_URL}/organization/create-organization`, organizationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Organization created successfully");
      setForm({ name: "", logo: "" });
      onOpenChange(false); // close modal
    } catch (error) {
      toast.error("Something went wrong");
    }finally{
        setLoading(false)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg px-6 py-8 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Create Organization</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new organization for managing job portals and hiring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Card className="p-6 space-y-5 shadow-none border">
            <div>
              <Label className=" my-2" htmlFor="name">Organization Name</Label>
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
              <Label className=" my-2" htmlFor="logo">Logo URL (optional)</Label>
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
            { loading ? <Loader/> : "Create Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
