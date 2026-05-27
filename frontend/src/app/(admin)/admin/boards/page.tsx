"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import AdminTable from "@/components/shared/AdminTable";
import { fetchWithAuth } from "@/lib/api";
import { Layers, Plus, Loader2, Sparkles } from "lucide-react";

interface Board {
  id: number;
  name: string;
  created_at: string;
  classes: any[];
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal
  const [modal, setModal] = useState<{ type: "add" | "edit"; board?: Board } | null>(null);
  const [name, setName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Board | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBoards = async () => {
    try {
      const data = await fetchWithAuth("/syllabus/boards");
      setBoards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const filtered = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      setModalError("Board name cannot be empty");
      return;
    }
    setModalLoading(true);
    setModalError("");
    try {
      if (modal?.type === "add") {
        await fetchWithAuth("/syllabus/boards", {
          method: "POST",
          body: JSON.stringify({ name: name.trim() }),
        });
      } else if (modal?.board) {
        await fetchWithAuth(`/syllabus/boards/${modal.board.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: name.trim() }),
        });
      }
      setModal(null);
      fetchBoards();
    } catch (e: any) {
      setModalError(e.message || "An error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetchWithAuth(`/syllabus/boards/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchBoards();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Board Name",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "classes",
      label: "Classes",
      render: (value: any[]) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {value?.length || 0} classes
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => (
        <span className="text-gray-500 text-xs">
          {value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </span>
      ),
    },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
            <p className="text-sm text-gray-500">Manage education boards (CBSE, ICSE, State Boards, etc.)</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setModal({ type: "add" });
            setName("");
            setModalError("");
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Board
        </motion.button>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search boards..."
        emptyMessage="No boards found"
        onEdit={(row) => {
          setModal({ type: "edit", board: row });
          setName(row.name);
          setModalError("");
        }}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.type === "add" ? "Add New Board" : "Edit Board"}
        description={modal?.type === "add" ? "Create a new education board" : "Update board details"}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {modalError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Board Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CBSE, ICSE, State Board..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 focus:border-[#5A4BDA]/40 transition-all"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : modal?.type === "add" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </AdminModal>

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Board?"
        message={`This will permanently delete "${deleteTarget?.name}" and all its classes, subjects, chapters, and topics. This cannot be undone.`}
        isLoading={deleteLoading}
      />
    </PageWrapper>
  );
}
