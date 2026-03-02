"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { getStorageItem } from "@/lib/storage";
import { UploadCloud, X } from "lucide-react";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) formData.append("logo", logoFile);

    try {
      const token = getStorageItem("token");
      const res = await axios.post(
        `${API_URL}/organization/create-organization`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      toast.success("Organization created successfully");
      router.push("/portals");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">Create Organization</h1>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Acme Corporation"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Logo (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoPreview ? (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium truncate max-w-[200px]">{logoFile?.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs w-fit"
                    onClick={removeLogo}
                  >
                    <X className="w-3 h-3" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload logo
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG — max 2MB</p>
              </button>
            )}
          </div>
        </Card>

        <Button type="submit" className="w-full text-base py-5 rounded-xl">
          Create Organization
        </Button>
      </form>
    </div>
  );
}
