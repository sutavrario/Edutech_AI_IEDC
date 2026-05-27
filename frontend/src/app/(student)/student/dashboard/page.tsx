"use client";

import { useEffect, useState } from "react";
import { PageWrapper, AnimatedSection } from "@/components/shared/Wrappers";
import { CourseCard, StatsCard } from "@/components/shared/Cards";
import { BookOpen, Clock, Target, PlayCircle, Library } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MotivationalQuotes from "@/components/sections/motivational-quotes";
import { fetchWithAuth } from "@/lib/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    fetchWithAuth("/users/dashboard-stats")
      .then(setStats)
      .catch(console.error);
  }, []);
  
  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-900">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-600">
            {stats?.class_name ? `Class ${stats.class_name}` : "Class Not Set"} • {stats?.board_name || "Board Not Set"}
          </p>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="mb-8">
        <AnimatedSection direction="up" delay={0.05}>
          <MotivationalQuotes />
        </AnimatedSection>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnimatedSection delay={0.1}>
          <StatsCard 
            title="Enrolled Subjects" 
            value={stats?.subjects?.length?.toString() || "0"} 
            icon={<Library className="w-6 h-6 text-blue-500" />} 
            trend="Active syllabus" 
          />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <StatsCard 
            title="Available Videos" 
            value={stats?.videos_count?.toString() || "0"} 
            icon={<PlayCircle className="w-6 h-6 text-red-500" />} 
            trend="Mapped to topics" 
          />
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <StatsCard 
            title="Quizzes Mastered" 
            value="0" 
            icon={<Target className="w-6 h-6 text-green-500" />} 
            trend="Coming soon" 
          />
        </AnimatedSection>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Content Area */}
        <div className="space-y-8">
          <AnimatedSection direction="up" delay={0.2}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Enrolled Subjects</h2>
            </div>
            
            {!stats?.subjects || stats.subjects.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500">No subjects found for your enrolled class. Please ask your administrator to add syllabus data.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stats.subjects.map((subject: any, index: number) => (
                  <CourseCard 
                    key={subject.id}
                    title={subject.name} 
                    progress={0} 
                    icon={<BookOpen className="w-6 h-6 text-blue-500" />} 
                  />
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </PageWrapper>
  );
}
