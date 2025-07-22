"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-tr from-black/70 to-green-900/40 backdrop-blur-md border-t border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">HireMate</h3>
          <p className="text-sm text-white/70">
            AI-powered smart interviewing platform. Automate, analyze, and hire smarter.
          </p>
          <div className="mt-4 space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <MapPin size={16} /> Bengaluru, India
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} /> +91 98765 43210
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} /> support@hiremate.ai
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link href="/about" className="hover:text-green-400">About Us</Link></li>
            <li><Link href="/features" className="hover:text-green-400">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-green-400">Pricing</Link></li>
            <li><Link href="/faq" className="hover:text-green-400">FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-green-400">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link href="/privacy" className="hover:text-green-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-green-400">Terms of Service</Link></li>
            <li><Link href="/security" className="hover:text-green-400">Security</Link></li>
            <li><Link href="/cookies" className="hover:text-green-400">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter or Social */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Stay Updated</h4>
          <p className="text-sm text-white/70 mb-4">Get updates on new features & job tools.</p>
          <form className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 text-sm rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium"
            >
              Subscribe
            </button>
          </form>

          <div className="flex items-center gap-4 mt-6">
            <a href="https://twitter.com" className="hover:text-green-400" target="_blank" rel="noopener noreferrer"><Twitter size={18} /></a>
            <a href="https://linkedin.com" className="hover:text-green-400" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
            <a href="https://github.com" className="hover:text-green-400" target="_blank" rel="noopener noreferrer"><Github size={18} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-white/10 py-6 px-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} HireMate. All rights reserved.
      </div>
    </footer>
  );
}
