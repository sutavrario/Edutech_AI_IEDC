"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { Users, Plus, Loader2, User as UserIcon } from "lucide-react";
import { CLASS_OPTIONS, BOARD_OPTIONS } from "@/constants/theme";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [modal, setModal] = useState<{ type: "add" } | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    age: "",
    class_name: "",
    board: "",
    school_name: "",
  });
  
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  
  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth("/users");
      setUsers(res);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      await fetchWithAuth("/users/student", {
        method: "POST",
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? parseInt(formData.age) : null,
          class_name: formData.class_name || null,
          board: formData.board || null,
          school_name: formData.school_name || null,
        }),
      });
      setModal(null);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message || "An error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetchWithAuth(`/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { 
      key: "full_name", 
      label: "Student", 
      render: (v: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {v.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 text-sm">{v}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: "class_name", 
      label: "Class & Board", 
      render: (v: string, row: any) => (
        <div className="flex flex-col gap-1 text-xs">
          {v ? <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium w-fit">Class {v}</span> : <span className="text-gray-400">—</span>}
          {row.board && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium w-fit uppercase">{row.board}</span>}
        </div>
      )
    },
    { 
      key: "school_name", 
      label: "School", 
      render: (v: string) => <span className="text-sm text-gray-600">{v || "—"}</span> 
    },
    { 
      key: "created_at", 
      label: "Joined", 
      render: (v: string) => <span className="text-xs text-gray-500">{new Date(v).toLocaleDateString()}</span> 
    },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500">Manage students across the platform</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => {
            setModal({ type: "add" });
            setFormData({ full_name: "", email: "", password: "", age: "", class_name: "", board: "", school_name: "" });
            setModalError("");
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Student
        </motion.button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filtered} 
        isLoading={loading} 
        searchQuery={search} 
        onSearchChange={setSearch}
        searchPlaceholder="Search students by name or email..." 
        emptyMessage="No students found matching your search."
        onEdit={undefined} // No edit functionality requested yet
        onDelete={(row) => setDeleteTarget(row)} 
      />

      <AdminModal 
        isOpen={!!modal} 
        onClose={() => setModal(null)} 
        title="Add New Student"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {modalError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="full_name">Full Name *</label>
              <input 
                id="full_name"
                type="text" 
                required
                value={formData.full_name} 
                onChange={handleChange} 
                placeholder="Student Name"
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email Address *</label>
              <input 
                id="email"
                type="email" 
                required
                value={formData.email} 
                onChange={handleChange} 
                placeholder="student@example.com"
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Temporary Password *</label>
              <input 
                id="password"
                type="text" 
                required
                minLength={6}
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Set a password for the student"
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="class_name">Class</label>
              <select 
                id="class_name"
                value={formData.class_name} 
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700"
              >
                <option value="">Select Class...</option>
                {CLASS_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="board">Board</label>
              <select 
                id="board"
                value={formData.board} 
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 text-gray-700"
              >
                <option value="">Select Board...</option>
                {BOARD_OPTIONS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="school_name">School Name</label>
              <input 
                id="school_name"
                type="text" 
                value={formData.school_name} 
                onChange={handleChange} 
                placeholder="e.g. St. Xavier's High School"
                className="w-full px-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20" 
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Student"}
            </button>
          </div>
        </form>
      </AdminModal>
      
      <DeleteConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={handleDelete}
        title="Remove Student?" 
        message={`This will permanently delete the account for "${deleteTarget?.full_name}" (${deleteTarget?.email}) and all their associated data. This action cannot be undone.`} 
        isLoading={deleteLoading} 
      />
    </PageWrapper>
  );
}
