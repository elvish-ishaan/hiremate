import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left: Registration Form */}
      <div className="flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">Create your HireMate account</h2>
          <p className="text-gray-600 mb-8 text-sm">
            Start automating your interview process with AI-powered tools.
          </p>

          <form className="space-y-6">
            <div className=" gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your full name" required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>

            <Button type="submit" className="w-full rounded-xl text-lg py-5">
              Register
            </Button>

            <p className="text-sm text-center text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right: Hero Section */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-center px-10">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">
            Welcome to HireMate
          </h2>
          <p className="text-lg text-blue-900">
            The smartest way to interview candidates — automate, detect, and evaluate with AI.
          </p>
        </div>
      </div>
    </div>
  );
}