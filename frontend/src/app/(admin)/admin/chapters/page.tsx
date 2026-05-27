"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { FileText, Plus, Loader2, Filter } from "lucide-react";

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters
  const [filterClassId, setFilterClassId] = useState<number | "">("");
  const [filterSubjectId, setFilterSubjectId] = useState<number | "">("");

  // Modal State
  const [modal, setModal] = useState<{ type: "add" | "edit"; item?: any } | null>(null);
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  
  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [clsRes, subjRes, chRes] = await Promise.all([
          fetchWithAuth("/syllabus/classes"),
          fetchWithAuth("/syllabus/subjects"),
          fetchWithAuth("/syllabus/chapters")
        ]);
        setClasses(clsRes);
        setSubjects(subjRes);
        setChapters(chRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshChapters = async () => {
    try {
      const chRes = await fetchWithAuth(filterSubjectId ? `/syllabus/chapters?subject_id=${filterSubjectId}` : "/syllabus/chapters");
      setChapters(chRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshChapters();
  }, [filterSubjectId]);

  const getClassNameForSubject = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return "—";
    const cls = classes.find(c => c.id === subject.class_id);
    return cls ? cls.class_name : "—";
  };

  const getSubjectName = (subjectId: number) => {
    return subjects.find((s) => s.id === subjectId)?.name || "—";
  };

  // Filter subjects based on selected class in filters or modal
  const filterSubjectsList = filterClassId 
    ? subjects.filter(s => s.class_id === filterClassId) 
    : subjects;
    
  const modalSubjectsList = selectedClassId 
    ? subjects.filter(s => s.class_id === selectedClassId) 
    : [];

  const filtered = chapters.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (filterClassId && !filterSubjectId) {
      // If a class is selected but NO subject is selected, we need to filter chapters
      // where the chapter's subject belongs to this class.
      const belongsToClass = subjects.some(s => s.id === c.subject_id && s.class_id === filterClassId);
      return matchesSearch && belongsToClass;
    }
    return matchesSearch;
  });

  const handleSubmit = async () => {
    if (!name.trim()) { setModalError("Chapter name cannot be empty"); return; }
    if (modal?.type === "add" && !selectedSubjectId) { setModalError("Please select a subject"); return; }
    
    setModalLoading(true); 
    setModalError("");
    try {
      if (modal?.type === "add") {
        await fetchWithAuth("/syllabus/chapters", { 
          method: "POST", 
          body: JSON.stringify({ name: name.trim(), subject_id: selectedSubjectId }) 
        });
      } else if (modal?.item) {
        await fetchWithAuth(`/syllabus/chapters/${modal.item.id}`, { 
          method: "PUT", 
          body: JSON.stringify({ name: name.trim() }) 
        });
      }
      setModal(null); 
      refreshChapters();
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
      await fetchWithAuth(`/syllabus/chapters/${deleteTarget.id}`, { method: "DELETE" }); 
      setDeleteTarget(null); 
      refreshChapters(); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setDeleteLoading(false); 
    }
  };

  const columns = [
    { key: "name", label: "Chapter Name", render: (v: string) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
          <FileText className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-medium text-gray-900">{v}</span>
      </div>
    )},
    { key: "class", label: "Class", render: (_, row: any) => (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        {getClassNameForSubject(row.subject_id)}
      </span> 
    )},
    { key: "subject_id", label: "Subject", render: (v: number) => (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        {getSubjectName(v)}
      </span> 
    )},
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chapters</h1>
            <p className="text-sm text-gray-500">Manage chapters within subjects</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => { setModal({ type: "add" }); setName(""); setSelectedClassId(""); setSelectedSubjectId(""); setModalError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Chapter
        </motion.button>
      </div>
      
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium px-2">
          <Filter className="w-4 h-4" /> Filter by:
        </div>
        <select 
          value={filterClassId} 
          onChange={(e) => {
            setFilterClassId(e.target.value ? Number(e.target.value) : "");
            setFilterSubjectId(""); // Reset subject filter when class changes
          }}
          className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        
        <select 
          disabled={!filterClassId && filterSubjectsList.length === 0}
          value={filterSubjectId} 
          onChange={(e) => setFilterSubjectId(e.target.value ? Number(e.target.value) : "")}
          className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700 disabled:opacity-50"
        >
          <option value="">All Subjects in Class</option>
          {filterSubjectsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filtered} 
        isLoading={loading} 
        searchQuery={search} 
        onSearchChange={setSearch}
        searchPlaceholder="Search chapters..." 
        emptyMessage="No chapters found matching criteria"
        onEdit={(row) => { setModal({ type: "edit", item: row }); setName(row.name); setModalError(""); }}
        onDelete={(row) => setDeleteTarget(row)} 
      />

      <AdminModal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.type === "add" ? "Add New Chapter" : "Edit Chapter"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {modalError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{modalError}</div>}
          
          {modal?.type === "add" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                <select 
                  value={selectedClassId} 
                  onChange={(e) => {
                    setSelectedClassId(e.target.value ? Number(e.target.value) : "");
                    setSelectedSubjectId("");
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20"
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
                  onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 disabled:opacity-50"
                >
                  <option value="">Select Subject...</option>
                  {modalSubjectsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapter Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Kinematics, Algebra..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              autoFocus 
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : modal?.type === "add" ? "Create Chapter" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
      
      <DeleteConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete}
        title="Delete Chapter?" 
        message={`This will permanently delete "${deleteTarget?.name}" and all its topics.`} 
        isLoading={deleteLoading} 
      />
    </PageWrapper>
  );
}
