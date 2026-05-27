"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { Brain } from "lucide-react";

export function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="h-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 text-secondary-foreground">
            {icon}
          </div>
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CourseCard({ title, progress, icon }: { title: string, progress: number, icon: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="bg-white border border-gray-100 shadow-sm cursor-pointer overflow-hidden group hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-primary/10 transition-colors">
              {icon}
            </div>
            <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-primary h-2.5 rounded-full" 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <p className="text-right text-xs text-gray-500 mt-2">{progress}% Completed</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function QuizCardPreview({ question, answer }: { question: string, answer: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="perspective-1000 w-full h-48 cursor-pointer" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl flex flex-col items-center justify-center p-6 border border-gray-200 shadow-sm">
          <Brain className="w-8 h-8 text-primary mb-3" />
          <h4 className="text-center font-medium text-gray-900">{question}</h4>
          <span className="text-xs text-gray-500 absolute bottom-4">Tap to flip</span>
        </div>
        
        {/* Back */}
        <div 
          className="absolute w-full h-full backface-hidden bg-primary rounded-xl flex items-center justify-center p-6 border border-primary shadow-sm"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-center font-semibold text-white">{answer}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthCard({ children, title, description, icon }: { children: React.ReactNode, title: string, description: string, icon: React.ReactNode }) {
  return (
    <Card className="border border-gray-200 bg-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
      <CardHeader className="space-y-2 text-center pb-8 pt-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export function StatsCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
