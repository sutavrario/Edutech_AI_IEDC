"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/shared/Wrappers";
import { fetchWithAuth } from "@/lib/api";
import { Loader2, BookOpen, FileText, Hash, ChevronRight, ChevronDown, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentLearningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  
  // Data caching
  const [chaptersBySubject, setChaptersBySubject] = useState<Record<number, any[]>>({});
  const [topicsByChapter, setTopicsByChapter] = useState<Record<number, any[]>>({});
  const [videosByTopic, setVideosByTopic] = useState<Record<number, any>>({});

  useEffect(() => {
    fetchWithAuth("/users/dashboard-stats")
      .then((stats) => {
        if (stats.subjects) {
          setSubjects(stats.subjects);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectClick = async (subjectId: number) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
      return;
    }
    
    setExpandedSubject(subjectId);
    setExpandedChapter(null); // Reset chapter when changing subjects

    if (!chaptersBySubject[subjectId]) {
      try {
        const chapters = await fetchWithAuth(`/syllabus/chapters?subject_id=${subjectId}`);
        setChaptersBySubject(prev => ({ ...prev, [subjectId]: chapters }));
      } catch (e) {
        console.error("Failed to load chapters", e);
      }
    }
  };

  const handleChapterClick = async (chapterId: number) => {
    if (expandedChapter === chapterId) {
      setExpandedChapter(null);
      return;
    }
    
    setExpandedChapter(chapterId);

    if (!topicsByChapter[chapterId]) {
      try {
        const topics = await fetchWithAuth(`/syllabus/topics?chapter_id=${chapterId}`);
        setTopicsByChapter(prev => ({ ...prev, [chapterId]: topics }));
        
        // Also pre-fetch video mapping for these topics
        topics.forEach(async (topic: any) => {
          try {
            const videos = await fetchWithAuth(`/videos/student?topic_id=${topic.id}`);
            if (videos && videos.length > 0) {
              setVideosByTopic(prev => ({ ...prev, [topic.id]: videos[0] }));
            }
          } catch (e) {
            // Ignore if no video
          }
        });
      } catch (e) {
        console.error("Failed to load topics", e);
      }
    }
  };

  if (loading) {
    return (
      <PageWrapper className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
        <p className="text-gray-500">
          Explore your syllabus, watch AI-mapped videos, and master your subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => handleSubjectClick(subject.id)}
              className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">{subject.name}</h2>
                  <p className="text-sm text-gray-500">Explore chapters & topics</p>
                </div>
              </div>
              <div className="text-gray-400">
                {expandedSubject === subject.id ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSubject === subject.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 bg-gray-50/50"
                >
                  <div className="p-4 space-y-3">
                    {chaptersBySubject[subject.id]?.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-4">No chapters added yet.</p>
                    ) : (
                      chaptersBySubject[subject.id]?.map((chapter) => (
                        <div key={chapter.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => handleChapterClick(chapter.id)}
                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-500" />
                              <span className="font-semibold text-gray-800">{chapter.name}</span>
                            </div>
                            <div className="text-gray-400">
                              {expandedChapter === chapter.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedChapter === chapter.id && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="bg-gray-50 border-t border-gray-100"
                              >
                                <div className="p-3 pl-12 space-y-2">
                                  {topicsByChapter[chapter.id]?.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-2">No topics added yet.</p>
                                  ) : (
                                    topicsByChapter[chapter.id]?.map((topic) => {
                                      const video = videosByTopic[topic.id];
                                      
                                      return (
                                        <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-primary/30 transition-colors group">
                                          <div className="flex items-center gap-3">
                                            <Hash className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-800">{topic.name}</p>
                                              {video && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5"><PlayCircle className="w-3 h-3" /> Video available</p>}
                                            </div>
                                          </div>
                                          
                                          {video ? (
                                            <Link href={`/student/learning/${topic.id}`}>
                                              <button className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5">
                                                <PlayCircle className="w-3.5 h-3.5" /> Watch Now
                                              </button>
                                            </Link>
                                          ) : (
                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
