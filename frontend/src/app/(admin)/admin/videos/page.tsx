"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { Video, Plus, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [vidRes, topRes] = await Promise.all([
        fetchWithAuth("/videos/admin"),
        fetchWithAuth("/syllabus/topics"),
      ]);
      setVideos(vidRes);
      setTopics(topRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, []);

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  const getTopicName = (id: number) =>
    topics.find((t) => t.id === id)?.name || "—";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetchWithAuth(`/videos/admin/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const togglePublishStatus = async (video: any) => {
    try {
      await fetchWithAuth(`/videos/admin/${video.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_published: !video.is_published }),
      });
      fetchAll();
    } catch (e) {
      console.error("Failed to toggle publish status", e);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Video",
      render: (v: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
            {row.thumbnail_url ? (
              <img src={row.thumbnail_url} alt={v} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Video className="w-4 h-4" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <a href={`https://youtube.com/watch?v=${row.youtube_video_id}`} target="_blank" rel="noreferrer">
                 <Play className="w-4 h-4 text-white fill-white" />
               </a>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 line-clamp-1">{v}</span>
            <span className="text-xs text-gray-500 line-clamp-1">{row.description || "No description"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "topic_id",
      label: "Topic Map",
      render: (v: number) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 max-w-[150px] truncate inline-block">
          {getTopicName(v)}
        </span>
      ),
    },
    {
      key: "is_published",
      label: "Status",
      render: (v: boolean, row: any) => (
        <button 
          onClick={() => togglePublishStatus(row)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
            v ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {v ? "Published" : "Draft"}
        </button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
            <p className="text-sm text-gray-500">
              Map YouTube videos to syllabus topics
            </p>
          </div>
        </div>
        <Link href="/admin/videos/add">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Video
          </motion.button>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search mapped videos..."
        emptyMessage="No videos mapped yet"
        onEdit={(row) => router.push(`/admin/videos/edit/${row.id}`)}
        onDelete={(row) => setDeleteTarget(row)}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Video Mapping?"
        message={`This will unmap "${deleteTarget?.title}" from the platform. The YouTube video itself will not be deleted.`}
        isLoading={deleteLoading}
      />
    </PageWrapper>
  );
}
