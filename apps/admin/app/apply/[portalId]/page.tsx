"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Upload, X } from "lucide-react";

interface PortalDetails {
  id: string;
  title: string;
  description: string | null;
  role: string;
  skillsRequired: string[];
  jobType: string;
  department: string;
}

export default function ApplyPage() {
  const { portalId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [portal, setPortal] = useState<PortalDetails | null>(null);
  const [portalLoading, setPortalLoading] = useState(true);
  const [portalError, setPortalError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const res = await axios.get(`${API_URL}/portal/${portalId}`);
        if (res.data.success) {
          setPortal(res.data.data);
        } else {
          setPortalError("Portal not found.");
        }
      } catch {
        setPortalError("Failed to load portal details.");
      } finally {
        setPortalLoading(false);
      }
    };
    if (portalId) fetchPortal();
  }, [portalId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!resume) e.resume = "Resume PDF is required.";
    return e;
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, resume: "Only PDF files are allowed." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: "File must be under 5MB." }));
      return;
    }
    setResume(file);
    setErrors((prev) => ({ ...prev, resume: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      if (phone.trim()) formData.append("phone", phone.trim());
      if (linkedIn.trim()) formData.append("linkedIn", linkedIn.trim());
      if (coverLetter.trim()) formData.append("coverLetter", coverLetter.trim());
      formData.append("resume", resume!);

      await axios.post(`${API_URL}/candidate/${portalId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to submit application. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (portalLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (portalError || !portal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">{portalError || "Portal not found."}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
          <p className="text-gray-600">
            Thank you for applying. Check your email for a private interview link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Portal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{portal.title}</h1>
              <p className="text-gray-500 mt-1">{portal.role} · {portal.department}</p>
            </div>
            <Badge variant="secondary">{portal.jobType}</Badge>
          </div>
          {portal.description && (
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{portal.description}</p>
          )}
          {portal.skillsRequired.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {portal.skillsRequired.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply for this position</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone + LinkedIn side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resume / CV <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal"> (PDF only, max 5MB)</span>
              </label>
              {resume ? (
                <div className="flex items-center gap-3 border border-green-300 bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-green-700 flex-1 truncate">{resume.name}</span>
                  <button
                    type="button"
                    onClick={() => { setResume(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-green-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-3 py-6 text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex flex-col items-center gap-2"
                >
                  <Upload className="w-6 h-6" />
                  Click to upload your resume
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className="hidden"
              />
              {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                placeholder="Tell us why you're a great fit for this role..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
