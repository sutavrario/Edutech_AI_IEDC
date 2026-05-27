"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/components/shared/Wrappers";
import { fetchWithAuth } from "@/lib/api";
import { Loader2, ArrowLeft, BrainCircuit, Sparkles, Trophy, BookOpen } from "lucide-react";
import { YouTubePlayer } from "@/components/shared/YouTubePlayer";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId;

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [topicData, videosData] = await Promise.all([
          fetchWithAuth(`/syllabus/topics/${topicId}`),
          fetchWithAuth(`/videos/student?topic_id=${topicId}`),
        ]);
        
        setTopic(topicData);
        if (videosData && videosData.length > 0) {
          setVideo(videosData[0]);
        }
      } catch (e) {
        console.error("Failed to load topic learning data", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [topicId]);

  if (loading) {
    return (
      <PageWrapper className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading AI Classroom...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!topic) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic not found</h2>
          <button onClick={() => router.back()} className="text-primary hover:underline">Go back</button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/student/learning")}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary">Topic</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
          </div>
        </div>
        
        {/* Placeholder for AI Tutor action */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl shadow-lg shadow-violet-500/20 text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" /> Ask AI Tutor
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area: Video */}
        <div className="lg:col-span-2 space-y-6">
          {video ? (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <YouTubePlayer videoId={video.youtube_video_id} title={video.title} />
              
              <div className="mt-6 px-2 pb-2">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h2>
                {video.description ? (
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{video.description}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No additional description provided.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Video Coming Soon</h3>
              <p className="text-gray-500 max-w-sm">
                Your teachers are currently preparing the best video material for this topic. Check back later!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Quizzes and Gamification Placeholders */}
        <div className="space-y-6">
          
          {/* Motivation Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <BookOpen className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-200" /> Focus Mode
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">
                "The beautiful thing about learning is that no one can take it away from you."
              </p>
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                <div className="bg-white h-1.5 rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-blue-200 font-medium text-right">Topic Master: 33%</p>
            </div>
          </div>

          {/* Quiz Placeholder */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-orange-400 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Trophy className="w-24 h-24 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Knowledge Check</h3>
            <p className="text-sm text-gray-500 mb-6 relative z-10">
              Test your understanding of {topic.name} after watching the video.
            </p>
            <button disabled className="w-full py-3 bg-gray-50 text-gray-400 font-medium rounded-xl border border-gray-200 border-dashed cursor-not-allowed">
              Next: Quiz coming soon
            </button>
          </div>
          
          {/* Brainstorm Game Placeholder */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-fuchsia-400 relative overflow-hidden group hover:shadow-md transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2 relative z-10">Brainstorm Game</h3>
            <p className="text-sm text-gray-500 mb-6 relative z-10">
              Play an interactive AI-generated mini-game to solidify your concepts.
            </p>
            <button disabled className="w-full py-3 bg-gray-50 text-gray-400 font-medium rounded-xl border border-gray-200 border-dashed cursor-not-allowed flex items-center justify-center gap-2">
               <Sparkles className="w-4 h-4" /> Game generating...
            </button>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

// Ensure Video icon is imported at the top
import { Video } from "lucide-react";
