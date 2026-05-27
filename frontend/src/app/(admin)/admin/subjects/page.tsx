"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { Library, Plus, Loader2, Filter } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClassId, setFilterClassId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ type: "add" | "edit"; item?: any } | null>(null);
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [s, c] = await Promise.all([
        fetchWithAuth(filterClassId ? `/syllabus/subjects?class_id=${filterClassId}` : "/syllabus/subjects"),
        fetchWithAuth("/syllabus/classes"),
      ]);
      setSubjects(s); setClasses(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchAll(); }, [filterClassId]);

  const filtered = subjects.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const getClassName = (id: number) => classes.find((c) => c.id === id)?.class_name || "—";

  const handleSubmit = async () => {
    if (!name.trim()) { setModalError("Subject name cannot be empty"); return; }
    if (modal?.type === "add" && !selectedClassId) { setModalError("Please select a class"); return; }
    setModalLoading(true); setModalError("");
    try {
      if (modal?.type === "add") {
        await fetchWithAuth("/syllabus/subjects", { method: "POST", body: JSON.stringify({ name: name.trim(), class_id: selectedClassId }) });
      } else if (modal?.item) {
        await fetchWithAuth(`/syllabus/subjects/${modal.item.id}`, { method: "PUT", body: JSON.stringify({ name: name.trim() }) });
      }
      setModal(null); fetchAll();
    } catch (e: any) { setModalError(e.message || "Error"); }
    finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { await fetchWithAuth(`/syllabus/subjects/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); fetchAll(); }
    catch (e) { console.error(e); } finally { setDeleteLoading(false); }
  };

  const columns = [
    { key: "name", label: "Subject Name", render: (v: string) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500"><Library className="w-3.5 h-3.5 text-white" /></div>
        <span className="font-medium text-gray-900">{v}</span>
      </div>
    )},
    { key: "class_id", label: "Class", render: (v: number) => <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{getClassName(v)}</span> },
    { key: "chapters", label: "Chapters", render: (v: any[]) => <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">{v?.length || 0} chapters</span> },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500"><Library className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">Subjects</h1><p className="text-sm text-gray-500">Manage subjects within classes</p></div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setModal({ type: "add" }); setName(""); setSelectedClassId(""); setModalError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" />Add Subject
        </motion.button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterClassId || ""} onChange={(e) => setFilterClassId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700">
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
      </div>
      <AdminTable columns={columns} data={filtered} isLoading={loading} searchQuery={search} onSearchChange={setSearch}
        searchPlaceholder="Search subjects..." emptyMessage="No subjects found"
        onEdit={(row) => { setModal({ type: "edit", item: row }); setName(row.name); setModalError(""); }}
        onDelete={(row) => setDeleteTarget(row)} />

      <AdminModal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.type === "add" ? "Add New Subject" : "Edit Subject"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {modalError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{modalError}</div>}
          {modal?.type === "add" && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20">
                <option value="">Select a class...</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select></div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mathematics, Physics..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" autoFocus /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
            <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : modal?.type === "add" ? "Create" : "Save"}</button>
          </div>
        </form>
      </AdminModal>
      <DeleteConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Subject?" message={`This will permanently delete "${deleteTarget?.name}" and all its chapters and topics.`} isLoading={deleteLoading} />
    </PageWrapper>
  );
}
