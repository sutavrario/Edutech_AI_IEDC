"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper, AnimatedSection } from "@/components/shared/Wrappers";
import {
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  Library,
  FileText,
  Hash,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

interface SyllabusStats {
  boards: number;
  classes: number;
  subjects: number;
  chapters: number;
  topics: number;
  students: number;
  videos: number;
  quizzes: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<SyllabusStats | null>(null);

  useEffect(() => {
    fetchWithAuth("/syllabus/stats")
      .then(setStats)
      .catch(console.error);
  }, []);

  const syllabusCards = [
    {
      title: "Boards",
      value: stats?.boards ?? "—",
      icon: Layers,
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "bg-violet-500/10",
      href: "/admin/boards",
    },
    {
      title: "Classes",
      value: stats?.classes ?? "—",
      icon: GraduationCap,
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/10",
      href: "/admin/classes",
    },
    {
      title: "Subjects",
      value: stats?.subjects ?? "—",
      icon: Library,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
      href: "/admin/subjects",
    },
    {
      title: "Chapters",
      value: stats?.chapters ?? "—",
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
      href: "/admin/chapters",
    },
    {
      title: "Topics",
      value: stats?.topics ?? "—",
      icon: Hash,
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/10",
      href: "/admin/topics",
    },
  ];

  const mockCards = [
    {
      title: "Total Students",
      value: stats?.students?.toString() ?? "—",
      icon: Users,
      gradient: "from-indigo-500 to-blue-600",
      bgGlow: "bg-indigo-500/10",
      trend: "Active enrolled",
    },
    {
      title: "Total Videos",
      value: stats?.videos?.toString() ?? "—",
      icon: PlayCircle,
      gradient: "from-red-500 to-pink-500",
      bgGlow: "bg-red-500/10",
      trend: "Mapped to syllabus",
    },
    {
      title: "Total Quizzes",
      value: stats?.quizzes?.toString() ?? "—",
      icon: HelpCircle,
      gradient: "from-cyan-500 to-teal-500",
      bgGlow: "bg-cyan-500/10",
      trend: "Coming soon",
    },
  ];

  const quickActions = [
    { label: "Syllabus Editor", href: "/admin/syllabus", icon: BookOpen, color: "text-[#5A4BDA]", bg: "bg-[#5A4BDA]/10" },
    { label: "Manage Boards", href: "/admin/boards", icon: Layers, color: "text-violet-600", bg: "bg-violet-100" },
    { label: "Manage Classes", href: "/admin/classes", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Manage Subjects", href: "/admin/subjects", icon: Library, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Manage Chapters", href: "/admin/chapters", icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Manage Topics", href: "/admin/topics", icon: Hash, color: "text-pink-600", bg: "bg-pink-100" },
  ];

  const recentActivity = [
    { action: "Platform initialized", time: "Just now", icon: Sparkles, color: "text-[#5A4BDA]" },
    { action: "Admin portal activated", time: "Just now", icon: TrendingUp, color: "text-emerald-500" },
    { action: "Syllabus module ready", time: "Just now", icon: BookOpen, color: "text-blue-500" },
    { action: "Database connected", time: "Just now", icon: Clock, color: "text-amber-500" },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#5A4BDA] to-[#7C6FE4]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Command Center
            </h1>
            <p className="text-gray-500 text-sm">
              Monitor and manage your education platform
            </p>
          </div>
        </div>
      </div>

      {/* Syllabus Stats */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Syllabus Overview
        </h2>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        {syllabusCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Link href={card.href}>
                <div className="group relative bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {/* Glow */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 ${card.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Mock Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {mockCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <div className="relative bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 overflow-hidden">
                <div className={`absolute -top-8 -right-8 w-24 h-24 ${card.bgGlow} rounded-full blur-2xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  {card.trend && (
                    <p className="text-xs text-gray-400 mt-1">{card.trend}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <AnimatedSection delay={0.3} direction="up">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5A4BDA]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${action.bg}`}>
                        <Icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        {action.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection delay={0.4} direction="up">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{item.action}</p>
                    </div>
                    <span className="text-xs text-gray-400">{item.time}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PageWrapper>
  );
}
