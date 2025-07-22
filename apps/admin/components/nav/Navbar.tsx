"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";

const Navbar = () => {
  const router = useRouter();

  return (
    <header className="sticky top-4 z-50 w-[95%] mx-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="text-2xl font-semibold text-white hover:text-primary transition">
        Hiremate
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
        <Link href="#" className="hover:text-white transition">Solutions</Link>
        <Link href="#" className="hover:text-white transition">Products</Link>
        <Link href="#" className="hover:text-white transition">Pricing</Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button
          variant="outline"
          onClick={() => router.push("/auth/login")}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Login
        </Button>
        <Button
          variant="default"
          onClick={() => router.push("/auth/register")}
          className="bg-primary text-white hover:bg-primary/80"
        >
          Register
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
