"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-gray-900">
            EduTech AI
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="#tutor" className="hover:text-primary transition-colors">AI Tutor</Link>
          <Link href="#gamified" className="hover:text-primary transition-colors">Learn & Earn</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium">Sign up</Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
