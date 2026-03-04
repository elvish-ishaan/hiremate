"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Check,
  Users,
  Link,
  Pencil,
  Trash2,
  Download,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { getStorageItem } from "@/lib/storage";
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
  const [orgId, setOrgId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedApplyLink, setCopiedApplyLink] = useState<string | null>(null);

  // Candidates modal
  const [candidatesPortal, setCandidatesPortal] = useState<Portal | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Edit modal
  const [editPortal, setEditPortal] = useState<Portal | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    role: "",
    department: "",
    jobType: "",
    skillsRequired: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletePortalId, setDeletePortalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const token = () => getStorageItem("token");

  const copyApplyLink = (portalId: string) => {
    const link = `${window.location.origin}/apply/${portalId}`;
    navigator.clipboard.writeText(link);
    setCopiedApplyLink(portalId);
    setTimeout(() => setCopiedApplyLink(null), 2000);
  };

  useEffect(() => {
    const org = JSON.parse(getStorageItem("organization") || "{}");
    if (org.id) setOrgId(org.id);
  }, []);

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }
    fetchPortals();
  }, [orgId]);

  const fetchPortals = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/portal/${orgId}/list-portals`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.data.success) toast.error(res.data.message);
      setPortals(res.data?.portals || []);
    } catch {
      toast.error("Failed to fetch portals");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Candidates modal ---
  const openCandidatesModal = async (portal: Portal) => {
    setCandidatesPortal(portal);
    setLoadingCandidates(true);
    try {
      const res = await axios.get(`${API_URL}/candidate/${portal.id}/candidates`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setCandidates(res.data?.data || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // --- Toggle open/closed ---
  const togglePortalStatus = async (portal: Portal) => {
    setTogglingId(portal.id);
    try {
      const res = await axios.put(
        `${API_URL}/portal/${portal.id}`,
        { isOpen: !portal.isOpen },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.data.success) {
        setPortals((prev) =>
          prev.map((p) => (p.id === portal.id ? { ...p, isOpen: !portal.isOpen } : p))
        );
        toast.success(`Portal ${!portal.isOpen ? "opened" : "closed"}`);
      }
    } catch {
      toast.error("Failed to update portal status");
    } finally {
      setTogglingId(null);
    }
  };

  // --- Edit modal ---
  const openEditModal = (portal: Portal) => {
    setEditPortal(portal);
    setEditForm({
      title: portal.title,
      role: portal.role,
      department: portal.department,
      jobType: portal.jobType,
      skillsRequired: portal.skillsRequired.join(", "),
      description: portal.description || "",
    });
  };

  const handleEditSubmit = async () => {
    if (!editPortal) return;
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/portal/${editPortal.id}`,
        {
          ...editForm,
          skillsRequired: editForm.skillsRequired
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (res.data.success) {
        setPortals((prev) =>
          prev.map((p) =>
            p.id === editPortal.id ? { ...p, ...res.data.data } : p
          )
        );
        toast.success("Portal updated");
        setEditPortal(null);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to update portal");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---
  const handleDelete = async () => {
    if (!deletePortalId) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`${API_URL}/portal/${deletePortalId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.data.success) {
        setPortals((prev) => prev.filter((p) => p.id !== deletePortalId));
        toast.success("Portal deleted");
        setDeletePortalId(null);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to delete portal");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">All Job Portals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your hiring portals across your organization.
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
              <Card key={portal.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {portal.title}
                    </CardTitle>
                    <Badge
                      variant={portal.isOpen ? "default" : "outline"}
                      className={!portal.isOpen ? "text-red-500 border-red-500" : ""}
                    >
                      {portal.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">• {portal.jobType}</p>
                </CardHeader>

                <CardContent className="space-y-2 text-sm flex-1">
                  <p className="text-muted-foreground line-clamp-2">{portal.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {portal.skillsRequired.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 pt-2">
                    <p>Department: {portal.department}</p>
                    <p>Created: {formatDate(portal.createdAt)}</p>
                    <p>Updated: {formatDate(portal.updatedAt)}</p>
                  </div>
                  {(portal._count?.applicants ?? 0) > 0 && (
                    <button
                      onClick={() => openCandidatesModal(portal)}
                      className="flex items-center gap-1 text-xs text-purple-600 font-medium pt-1 hover:underline"
                    >
                      <Users className="w-3 h-3" />
                      {portal._count!.applicants} applied — view details
                    </button>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2 items-start">
                  <div className="flex gap-2 w-full flex-wrap">
                    <Button
                      onClick={() => router.push(`/reports/${portal.id}`)}
                      variant="outline"
                      className="text-sm"
                    >
                      Reports
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm gap-1"
                      onClick={() => copyApplyLink(portal.id)}
                    >
                      {copiedApplyLink === portal.id ? (
                        <><Check className="w-3 h-3 text-green-500" /> Copied!</>
                      ) : (
                        <><Link className="w-3 h-3" /> Apply Link</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm gap-1"
                      onClick={() => openCandidatesModal(portal)}
                    >
                      <Users className="w-3 h-3" /> Applicants
                    </Button>
                  </div>
                  <div className="flex gap-2 w-full flex-wrap">
                    <Button
                      variant="outline"
                      className="text-sm gap-1"
                      onClick={() => openEditModal(portal)}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm gap-1"
                      disabled={togglingId === portal.id}
                      onClick={() => togglePortalStatus(portal)}
                    >
                      {portal.isOpen ? (
                        <><ToggleRight className="w-4 h-4 text-green-500" /> Close</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4 text-muted-foreground" /> Open</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm gap-1 text-red-500 hover:text-red-600"
                      onClick={() => setDeletePortalId(portal.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
      </div>

      {/* --- Candidates Modal --- */}
      <Dialog open={!!candidatesPortal} onOpenChange={(o) => { if (!o) { setCandidatesPortal(null); setCandidates([]); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Applicants — {candidatesPortal?.title}
            </DialogTitle>
          </DialogHeader>
          {loadingCandidates ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No applicants yet.</p>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 pr-2">
                {candidates.map((c) => (
                  <div key={c.id} className="border rounded-lg p-4 space-y-1.5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-muted-foreground">{c.email}</p>
                      </div>
                      <a
                        href={c.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <Download className="w-3 h-3" /> Resume
                        </Button>
                      </a>
                    </div>
                    {c.phone && <p className="text-xs text-muted-foreground">Phone: {c.phone}</p>}
                    {c.linkedIn && (
                      <p className="text-xs text-muted-foreground">
                        LinkedIn:{" "}
                        <a href={c.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {c.linkedIn}
                        </a>
                      </p>
                    )}
                    {c.coverLetter && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-medium text-foreground">Cover Letter</summary>
                        <p className="mt-1 whitespace-pre-wrap">{c.coverLetter}</p>
                      </details>
                    )}
                    <p className="text-xs text-muted-foreground">Applied: {formatDate(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Edit Modal --- */}
      <Dialog open={!!editPortal} onOpenChange={(o) => { if (!o) setEditPortal(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Portal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editForm.department}
                  onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-jobType">Job Type</Label>
                <Input
                  id="edit-jobType"
                  value={editForm.jobType}
                  onChange={(e) => setEditForm((f) => ({ ...f, jobType: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-skills">Skills Required</Label>
              <Input
                id="edit-skills"
                value={editForm.skillsRequired}
                onChange={(e) => setEditForm((f) => ({ ...f, skillsRequired: e.target.value }))}
                placeholder="Comma-separated"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPortal(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirm --- */}
      <Dialog open={!!deletePortalId} onOpenChange={(o) => { if (!o) setDeletePortalId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Portal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete the portal and all its data. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePortalId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortalsPage;
