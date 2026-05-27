"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageWrapper } from "@/components/shared/Wrappers";
import { fetchWithAuth } from "@/lib/api";
import { Loader2, ArrowLeft, Video, PlaySquare } from "lucide-react";
import Link from "next/link";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Hierarchy Data
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // Selected IDs
  const [boardId, setBoardId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [chapterId, setChapterId] = useState<number | "">("");
  const [topicId, setTopicId] = useState<number | "">("");

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [videoData, boardsData] = await Promise.all([
          fetchWithAuth(`/videos/admin/${videoId}`),
          fetchWithAuth("/syllabus/boards"),
        ]);

        setBoards(boardsData);
        setTitle(videoData.title);
        setDescription(videoData.description || "");
        setYoutubeUrl(videoData.youtube_url);
        setIsPublished(videoData.is_published);

        // Pre-fill IDs
        setBoardId(videoData.board_id);
        
        // Fetch dependent data sequentially to ensure dropdowns populate
        const classData = await fetchWithAuth(`/syllabus/classes?board_id=${videoData.board_id}`);
        setClasses(classData);
        setClassId(videoData.class_id);

        const subjectData = await fetchWithAuth(`/syllabus/subjects?class_id=${videoData.class_id}`);
        setSubjects(subjectData);
        setSubjectId(videoData.subject_id);

        const chapterData = await fetchWithAuth(`/syllabus/chapters?subject_id=${videoData.subject_id}`);
        setChapters(chapterData);
        setChapterId(videoData.chapter_id);

        const topicData = await fetchWithAuth(`/syllabus/topics?chapter_id=${videoData.chapter_id}`);
        setTopics(topicData);
        setTopicId(videoData.topic_id);

      } catch (e: any) {
        setError("Failed to load video details.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [videoId]);

  // Handle cascaded changes after initial load
  const handleBoardChange = async (newBoardId: number | "") => {
    setBoardId(newBoardId);
    setClassId(""); setSubjectId(""); setChapterId(""); setTopicId("");
    if (newBoardId) {
      const data = await fetchWithAuth(`/syllabus/classes?board_id=${newBoardId}`);
      setClasses(data);
    } else {
      setClasses([]);
    }
  };

  const handleClassChange = async (newClassId: number | "") => {
    setClassId(newClassId);
    setSubjectId(""); setChapterId(""); setTopicId("");
    if (newClassId) {
      const data = await fetchWithAuth(`/syllabus/subjects?class_id=${newClassId}`);
      setSubjects(data);
    } else {
      setSubjects([]);
    }
  };

  const handleSubjectChange = async (newSubjectId: number | "") => {
    setSubjectId(newSubjectId);
    setChapterId(""); setTopicId("");
    if (newSubjectId) {
      const data = await fetchWithAuth(`/syllabus/chapters?subject_id=${newSubjectId}`);
      setChapters(data);
    } else {
      setChapters([]);
    }
  };

  const handleChapterChange = async (newChapterId: number | "") => {
    setChapterId(newChapterId);
    setTopicId("");
    if (newChapterId) {
      const data = await fetchWithAuth(`/syllabus/topics?chapter_id=${newChapterId}`);
      setTopics(data);
    } else {
      setTopics([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicId) {
      setError("You must select a topic to map this video to.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await fetchWithAuth(`/videos/admin/${videoId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description: description || null,
          youtube_url: youtubeUrl,
          board_id: Number(boardId),
          class_id: Number(classId),
          subject_id: Number(subjectId),
          chapter_id: Number(chapterId),
          topic_id: Number(topicId),
          is_published: isPublished
        }),
      });
      router.push("/admin/videos");
    } catch (err: any) {
      setError(err.message || "Failed to update video");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/videos">
          <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Video</h1>
          <p className="text-sm text-gray-500">Update video details and syllabus mapping</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          {/* YouTube Link Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-red-500" />
              Video Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
              <input 
                type="url" 
                required
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Video Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Published Status</label>
                <div className="flex items-center gap-3 h-[46px] px-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <input
                    type="checkbox"
                    id="published"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Visible to students
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Syllabus Mapping Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-500" />
              Topic Mapping
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">1. Board</label>
                <select 
                  value={boardId} onChange={(e) => handleBoardChange(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Board...</option>
                  {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">2. Class</label>
                <select 
                  disabled={!boardId}
                  value={classId} onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select Class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">3. Subject</label>
                <select 
                  disabled={!classId}
                  value={subjectId} onChange={(e) => handleSubjectChange(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select Subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">4. Chapter</label>
                <select 
                  disabled={!subjectId}
                  value={chapterId} onChange={(e) => handleChapterChange(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">Select Chapter...</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">5. Topic (Target)</label>
                <select 
                  required
                  disabled={!chapterId}
                  value={topicId} onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-500 disabled:opacity-50"
                >
                  <option value="">Select final topic...</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
            <Link href="/admin/videos">
              <button type="button" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
                Cancel
              </button>
            </Link>
            <button 
              type="submit" 
              disabled={submitting || !topicId}
              className="flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors min-w-[140px]"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
