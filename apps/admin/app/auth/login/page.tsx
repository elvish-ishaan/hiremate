"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";
import { API_URL } from "@/app/constant";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    if(!res.data.success){
      toast.error(res.data.message)
    }
    toast.success("Logged In")
    //save token to local storage
    localStorage.setItem("token", res.data.token)
    localStorage.setItem("user", JSON.stringify(res.data.user))
    //redirect to home page
    router.push("/dashboard")
  };

  return (
    <div
      className="min-h-screen grid md:grid-cols-2 
      bg-[linear-gradient(to_right,rgba(0,0,0,0.5),rgba(0,128,0,0.2))] 
      backdrop-blur-xl border border-white/10 
      shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Login Form */}
      <div className="flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-2">Welcome back</h2>
          <p className="text-secondary mb-8 text-sm">
            Log in to continue managing interviews with HireMate.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl text-lg py-5">
              Login
            </Button>

            <p className="text-sm text-center text-gray-300">
              Don’t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
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
            Revolutionize hiring with AI-powered interviews and instant insights.
          </p>
        </div>
      </div>
    </div>
  );
}
