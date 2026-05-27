"use client";

import { Brain, Trophy, Video, Target } from "lucide-react";
import { FeatureCard } from "@/components/shared/Cards";
import { AnimatedSection } from "@/components/shared/Wrappers";

const features = [
  {
    title: "24/7 AI Tutor",
    description: "Stuck on a problem? Get instant, step-by-step guidance from our advanced AI model tuned for school curriculum.",
    icon: <Brain className="w-6 h-6 text-primary" />,
  },
  {
    title: "Gamified Streaks",
    description: "Earn XP, maintain daily streaks, and unlock achievements as you progress through your syllabus.",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
  },
  {
    title: "Interactive Lessons",
    description: "Engaging visual content designed to make complex concepts easy to grasp and remember.",
    icon: <Video className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Personalized Path",
    description: "The platform analyzes your strengths and weaknesses to create a custom study plan just for you.",
    icon: <Target className="w-6 h-6 text-green-500" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection direction="up" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Why Choose Us?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We bring the best of modern technology to your daily studies, making learning engaging, efficient, and fun.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <AnimatedSection key={index} delay={index * 0.1} direction="up">
              <FeatureCard 
                title={feat.title} 
                description={feat.description} 
                icon={feat.icon} 
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
