"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { Hash, Plus, Loader2, Filter } from "lucide-react";

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [filterClassId, setFilterClassId] = useState<number | "">("");
  const [filterSubjectId, setFilterSubjectId] = useState<number | "">("");
  const [filterChapterId, setFilterChapterId] = useState<number | "">("");

  // Modal State
  const [modal, setModal] = useState<{ type: "add" | "edit"; item?: any } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedChapterId, setSelectedChapterId] = useState<number | "">("");
  
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  
  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [clsRes, subjRes, chRes, topRes] = await Promise.all([
          fetchWithAuth("/syllabus/classes"),
          fetchWithAuth("/syllabus/subjects"),
          fetchWithAuth("/syllabus/chapters"),
          fetchWithAuth("/syllabus/topics")
        ]);
        setClasses(clsRes);
        setSubjects(subjRes);
        setChapters(chRes);
        setTopics(topRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshTopics = async () => {
    try {
      const topRes = await fetchWithAuth(filterChapterId ? `/syllabus/topics?chapter_id=${filterChapterId}` : "/syllabus/topics");
      setTopics(topRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshTopics();
  }, [filterChapterId]);

  // Helpers for displaying table data
  const getChapterData = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return { chapter: "—", subject: "—", class: "—" };
    
    const subject = subjects.find(s => s.id === chapter.subject_id);
    if (!subject) return { chapter: chapter.name, subject: "—", class: "—" };
    
    const cls = classes.find(c => c.id === subject.class_id);
    
    return {
      chapter: chapter.name,
      subject: subject.name,
      class: cls ? cls.class_name : "—"
    };
  };

  // Filter dropdown lists based on selections
  const filterSubjectsList = filterClassId 
    ? subjects.filter(s => s.class_id === filterClassId) 
    : subjects;
    
  const filterChaptersList = filterSubjectId 
    ? chapters.filter(c => c.subject_id === filterSubjectId) 
    : filterClassId 
      ? chapters.filter(c => subjects.some(s => s.id === c.subject_id && s.class_id === filterClassId))
      : chapters;

  // Modal dropdown lists
  const modalSubjectsList = selectedClassId 
    ? subjects.filter(s => s.class_id === selectedClassId) 
    : [];
    
  const modalChaptersList = selectedSubjectId
    ? chapters.filter(c => c.subject_id === selectedSubjectId)
    : [];

  const filtered = topics.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // If chapter filter is selected, the API already filters it, but let's be safe
    if (filterChapterId && t.chapter_id !== filterChapterId) return false;
    
    // If subject filter is selected but no chapter, filter locally
    if (filterSubjectId && !filterChapterId) {
      const belongsToSubject = chapters.some(c => c.id === t.chapter_id && c.subject_id === filterSubjectId);
      if (!belongsToSubject) return false;
    }
    
    // If class filter is selected but no subject/chapter, filter locally
    if (filterClassId && !filterSubjectId && !filterChapterId) {
      const belongsToClass = chapters.some(c => {
        if (c.id !== t.chapter_id) return false;
        return subjects.some(s => s.id === c.subject_id && s.class_id === filterClassId);
      });
      if (!belongsToClass) return false;
    }
    
    return true;
  });

  const handleSubmit = async () => {
    if (!name.trim()) { setModalError("Topic name cannot be empty"); return; }
    if (modal?.type === "add" && !selectedChapterId) { setModalError("Please select a chapter"); return; }
    
    setModalLoading(true); setModalError("");
    try {
      if (modal?.type === "add") {
        await fetchWithAuth("/syllabus/topics", { 
          method: "POST", 
          body: JSON.stringify({ name: name.trim(), description: description.trim() || null, chapter_id: selectedChapterId }) 
        });
      } else if (modal?.item) {
        await fetchWithAuth(`/syllabus/topics/${modal.item.id}`, { 
          method: "PUT", 
          body: JSON.stringify({ name: name.trim(), description: description.trim() || null }) 
        });
      }
      setModal(null); 
      refreshTopics();
    } catch (e: any) { 
      setModalError(e.message || "Error"); 
    } finally { 
      setModalLoading(false); 
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { 
      await fetchWithAuth(`/syllabus/topics/${deleteTarget.id}`, { method: "DELETE" }); 
      setDeleteTarget(null); 
      refreshTopics(); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setDeleteLoading(false); 
    }
  };

  const columns = [
    { key: "name", label: "Topic Name", render: (v: string, row: any) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
            <Hash className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-gray-900">{v}</span>
        </div>
        {row.description && <span className="text-xs text-gray-500 truncate max-w-[250px]">{row.description}</span>}
      </div>
    )},
    { key: "hierarchy", label: "Hierarchy", render: (_, row: any) => {
      const data = getChapterData(row.chapter_id);
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{data.class}</span>
            <span className="text-gray-300">›</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{data.subject}</span>
          </div>
        </div>
      );
    }},
    { key: "chapter_id", label: "Chapter", render: (v: number) => {
      const data = getChapterData(v);
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{data.chapter}</span>;
    }},
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
            <p className="text-sm text-gray-500">Manage topics within chapters</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => { 
            setModal({ type: "add" }); 
            setName(""); 
            setDescription(""); 
            setSelectedClassId("");
            setSelectedSubjectId("");
            setSelectedChapterId(""); 
            setModalError(""); 
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Topic
        </motion.button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium px-2">
          <Filter className="w-4 h-4" /> Filter by:
        </div>
        
        <select 
          value={filterClassId} 
          onChange={(e) => {
            setFilterClassId(e.target.value ? Number(e.target.value) : "");
            setFilterSubjectId("");
            setFilterChapterId("");
          }}
          className="flex-1 min-w-[140px] px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        
        <select 
          disabled={!filterClassId && filterSubjectsList.length === 0}
          value={filterSubjectId} 
          onChange={(e) => {
            setFilterSubjectId(e.target.value ? Number(e.target.value) : "");
            setFilterChapterId("");
          }}
          className="flex-1 min-w-[140px] px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700 disabled:opacity-50"
        >
          <option value="">All Subjects</option>
          {filterSubjectsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select 
          disabled={!filterSubjectId && filterChaptersList.length === 0}
          value={filterChapterId} 
          onChange={(e) => setFilterChapterId(e.target.value ? Number(e.target.value) : "")}
          className="flex-1 min-w-[140px] px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700 disabled:opacity-50"
        >
          <option value="">All Chapters</option>
          {filterChaptersList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filtered} 
        isLoading={loading} 
        searchQuery={search} 
        onSearchChange={setSearch}
        searchPlaceholder="Search topics..." 
        emptyMessage="No topics found matching criteria"
        onEdit={(row) => { 
          setModal({ type: "edit", item: row }); 
          setName(row.name); 
          setDescription(row.description || ""); 
          setModalError(""); 
        }}
        onDelete={(row) => setDeleteTarget(row)} 
      />

      <AdminModal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.type === "add" ? "Add New Topic" : "Edit Topic"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {modalError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{modalError}</div>}
          
          {modal?.type === "add" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                  <select 
                    value={selectedClassId} 
                    onChange={(e) => {
                      setSelectedClassId(e.target.value ? Number(e.target.value) : "");
                      setSelectedSubjectId("");
                      setSelectedChapterId("");
                    }}
                    className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20"
                  >
                    <option value="">Select Class...</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <select 
                    disabled={!selectedClassId}
                    value={selectedSubjectId} 
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value ? Number(e.target.value) : "");
                      setSelectedChapterId("");
                    }}
                    className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 disabled:opacity-50"
                  >
                    <option value="">Select Subject...</option>
                    {modalSubjectsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapter</label>
                <select 
                  disabled={!selectedSubjectId}
                  value={selectedChapterId} 
                  onChange={(e) => setSelectedChapterId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 disabled:opacity-50"
                >
                  <option value="">Select Chapter...</option>
                  {modalChaptersList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Newton's First Law..."
              className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              autoFocus 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter topic description..."
              rows={2} 
              className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 resize-none" 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : modal?.type === "add" ? "Create Topic" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
      
      <DeleteConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete}
        title="Delete Topic?" 
        message={`This will permanently delete "${deleteTarget?.name}". This cannot be undone.`} 
        isLoading={deleteLoading} 
      />
    </PageWrapper>
  );
}
