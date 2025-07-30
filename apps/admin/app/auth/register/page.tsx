"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/constant";
import Loader from "@/components/loaders/loader";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      //show toast and message if sucess is false
      if (!res.data.success) {
        toast.error(res.data.message);
      }
      setLoading(false)

      toast.success("user created successfully, please login now");
      //redirect to login page
      router.push("/auth/login");
    } catch (error) {
      toast.error("something went wrong");
    }finally{
      setLoading(false)
    }
  };

  return (
    <div
      className="min-h-screen grid md:grid-cols-2
        bg-[linear-gradient(to_right,rgba(0,0,0,0.5),rgba(0,128,0,0.2))]
        backdrop-blur-xl border border-white/10
        shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Registration Form */}
      <div className="flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Create your HireMate account
          </h2>
          <p className="text-secondary mb-8 text-sm">
            Start automating your interview process with AI-powered tools.
          </p>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="gap-2">
              <Label className=" my-2" htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className=" my-2" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className=" my-2" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
            disabled={loading}
             type="submit" className="w-full rounded-xl text-lg py-5">
              { loading ? <Loader/> : "Register"}
            </Button>

            <p className="text-sm text-center text-gray-300">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right: Hero Section */}
      <div className="hidden md:flex items-center justify-center">
        <div className="text-center px-10 text-white/90">
          <h2 className="text-4xl font-bold mb-4">Welcome to HireMate</h2>
          <p className="text-lg">
            The smartest way to interview candidates — automate, detect, and evaluate with AI.
          </p>
        </div>
      </div>
    </div>
  );
}
