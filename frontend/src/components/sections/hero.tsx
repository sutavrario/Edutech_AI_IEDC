"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/shared/Buttons";
import MotivationalQuotes from "@/components/sections/motivational-quotes";
import { THEME } from "@/constants/theme";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-gray-50 overflow-hidden pt-12 pb-24">
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={THEME.ANIMATIONS.tween}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm mb-8 cursor-default"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-medium text-gray-700">AI-Powered Learning for Class 5-10</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-gray-900 leading-tight">
            Master Every Subject with Your <span className="text-primary">Personal AI Tutor</span>
          </h1>
          
          <div className="mb-12">
            <MotivationalQuotes />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <PrimaryButton size="lg" className="h-14 px-8 text-lg rounded-full" icon={<ArrowRight className="w-5 h-5" />}>
                Start Learning Free
              </PrimaryButton>
            </Link>
            <Link href="#features">
              <SecondaryButton size="lg" className="h-14 px-8 text-lg rounded-full" icon={<BookOpen className="w-5 h-5" />}>
                Explore Curriculum
              </SecondaryButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
