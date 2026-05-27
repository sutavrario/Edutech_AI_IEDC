"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/shared/Wrappers";
import AdminModal from "@/components/shared/AdminModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { fetchWithAuth } from "@/lib/api";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  Folder,
  FolderOpen,
  Search,
  Layers,
  GraduationCap,
  Library,
  FileText,
  Hash,
  Sparkles,
} from "lucide-react";

interface SyllabusItem {
  id: number;
  name?: string;
  class_name?: string;
  description?: string;
  [key: string]: any;
}

const columnConfig = [
  { key: "board", title: "Boards", icon: Layers, color: "from-violet-500 to-purple-600", displayKey: "name", endpoint: "/syllabus/boards" },
  { key: "class", title: "Classes", icon: GraduationCap, color: "from-blue-500 to-cyan-500", displayKey: "class_name", endpoint: "/syllabus/classes" },
  { key: "subject", title: "Subjects", icon: Library, color: "from-emerald-500 to-teal-500", displayKey: "name", endpoint: "/syllabus/subjects" },
  { key: "chapter", title: "Chapters", icon: FileText, color: "from-amber-500 to-orange-500", displayKey: "name", endpoint: "/syllabus/chapters" },
  { key: "topic", title: "Topics", icon: Hash, color: "from-pink-500 to-rose-500", displayKey: "name", endpoint: "/syllabus/topics" },
];

export default function SyllabusEditor() {
  const [data, setData] = useState<Record<string, SyllabusItem[]>>({
    board: [],
    class: [],
    subject: [],
    chapter: [],
    topic: [],
  });

  const [selected, setSelected] = useState<Record<string, number | null>>({
    board: null,
    class: null,
    subject: null,
    chapter: null,
    topic: null,
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  // Modal state
  const [modal, setModal] = useState<{
    type: "add" | "edit";
    entity: string;
    item?: SyllabusItem;
  } | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{
    entity: string;
    item: SyllabusItem;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const parentKeyMap: Record<string, string> = {
    class: "board_id",
    subject: "class_id",
    chapter: "subject_id",
    topic: "chapter_id",
  };

  const parentOf: Record<string, string> = {
    class: "board",
    subject: "class",
    chapter: "subject",
    topic: "chapter",
  };

  const fetchItems = async (entity: string, parentId?: number | null) => {
    setLoading((prev) => ({ ...prev, [entity]: true }));
    try {
      const config = columnConfig.find((c) => c.key === entity)!;
      let url = config.endpoint;
      if (parentId && parentOf[entity]) {
        url += `?${parentKeyMap[entity]}=${parentId}`;
      }
      const items = await fetchWithAuth(url);
      setData((prev) => ({ ...prev, [entity]: items }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading((prev) => ({ ...prev, [entity]: false }));
    }
  };

  // Load boards on mount
  useEffect(() => {
    fetchItems("board");
  }, []);

  // Chain loading when selection changes
  useEffect(() => {
    if (selected.board) {
      fetchItems("class", selected.board);
      setSelected((prev) => ({ ...prev, class: null, subject: null, chapter: null, topic: null }));
      setData((prev) => ({ ...prev, subject: [], chapter: [], topic: [] }));
    }
  }, [selected.board]);

  useEffect(() => {
    if (selected.class) {
      fetchItems("subject", selected.class);
      setSelected((prev) => ({ ...prev, subject: null, chapter: null, topic: null }));
      setData((prev) => ({ ...prev, chapter: [], topic: [] }));
    }
  }, [selected.class]);

  useEffect(() => {
    if (selected.subject) {
      fetchItems("chapter", selected.subject);
      setSelected((prev) => ({ ...prev, chapter: null, topic: null }));
      setData((prev) => ({ ...prev, topic: [] }));
    }
  }, [selected.subject]);

  useEffect(() => {
    if (selected.chapter) {
      fetchItems("topic", selected.chapter);
      setSelected((prev) => ({ ...prev, topic: null }));
    }
  }, [selected.chapter]);

  const getVisibleColumns = () => {
    const cols = ["board"];
    if (selected.board) cols.push("class");
    if (selected.class) cols.push("subject");
    if (selected.subject) cols.push("chapter");
    if (selected.chapter) cols.push("topic");
    return cols;
  };

  const visibleColumns = getVisibleColumns();

  // Breadcrumb
  const getBreadcrumb = () => {
    const crumbs: { label: string; entity: string }[] = [];
    for (const entity of ["board", "class", "subject", "chapter", "topic"]) {
      const id = selected[entity];
      if (!id) break;
      const config = columnConfig.find((c) => c.key === entity)!;
      const item = data[entity]?.find((d) => d.id === id);
      const label = item ? (item[config.displayKey] || item.name || `ID ${id}`) : `${config.title}`;
      crumbs.push({ label: label as string, entity });
    }
    return crumbs;
  };

  const handleOpenAdd = (entity: string) => {
    setModal({ type: "add", entity });
    setModalName("");
    setModalDescription("");
    setModalError("");
  };

  const handleOpenEdit = (entity: string, item: SyllabusItem) => {
    const config = columnConfig.find((c) => c.key === entity)!;
    setModal({ type: "edit", entity, item });
    setModalName((item[config.displayKey] as string) || "");
    setModalDescription(item.description || "");
    setModalError("");
  };

  const handleModalSubmit = async () => {
    if (!modal) return;
    if (!modalName.trim()) {
      setModalError("Name cannot be empty");
      return;
    }
    setModalLoading(true);
    setModalError("");

    const config = columnConfig.find((c) => c.key === modal.entity)!;

    try {
      if (modal.type === "add") {
        const body: any = {};
        if (modal.entity === "class") {
          body.class_name = modalName.trim();
          body.board_id = selected.board;
        } else {
          body.name = modalName.trim();
          if (parentOf[modal.entity]) {
            body[parentKeyMap[modal.entity]] = selected[parentOf[modal.entity]];
          }
        }
        if (modal.entity === "topic") {
          body.description = modalDescription.trim() || null;
        }
        await fetchWithAuth(config.endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
      } else {
        const body: any = {};
        if (modal.entity === "class") {
          body.class_name = modalName.trim();
        } else {
          body.name = modalName.trim();
        }
        if (modal.entity === "topic") {
          body.description = modalDescription.trim() || null;
        }
        await fetchWithAuth(`${config.endpoint}/${modal.item!.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      }

      // Refresh
      if (parentOf[modal.entity]) {
        fetchItems(modal.entity, selected[parentOf[modal.entity]]);
      } else {
        fetchItems(modal.entity);
      }
      setModal(null);
    } catch (e: any) {
      setModalError(e.message || "An error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const config = columnConfig.find((c) => c.key === deleteTarget.entity)!;

    try {
      await fetchWithAuth(`${config.endpoint}/${deleteTarget.item.id}`, {
        method: "DELETE",
      });

      // Clear selection if deleted item was selected
      if (selected[deleteTarget.entity] === deleteTarget.item.id) {
        setSelected((prev) => ({ ...prev, [deleteTarget.entity]: null }));
      }

      // Refresh
      if (parentOf[deleteTarget.entity]) {
        fetchItems(deleteTarget.entity, selected[parentOf[deleteTarget.entity]]);
      } else {
        fetchItems(deleteTarget.entity);
      }
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete item");
    } finally {
      setDeleteLoading(false);
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <PageWrapper className="h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#5A4BDA] to-[#7C6FE4]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Syllabus Editor</h1>
            <p className="text-gray-500 text-sm">
              Navigate and manage boards, classes, subjects, chapters, and topics
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <button
              onClick={() => setSelected({ board: null, class: null, subject: null, chapter: null, topic: null })}
              className="text-xs font-medium text-gray-400 hover:text-[#5A4BDA] transition-colors"
            >
              Home
            </button>
            {breadcrumb.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <button
                  onClick={() => {
                    // Navigate to this level
                    const keys = Object.keys(selected);
                    const idx = keys.indexOf(crumb.entity);
                    const newSelected = { ...selected };
                    for (let j = idx + 1; j < keys.length; j++) {
                      newSelected[keys[j]] = null;
                    }
                    setSelected(newSelected);
                  }}
                  className={`text-xs font-medium transition-colors ${
                    i === breadcrumb.length - 1
                      ? "text-[#5A4BDA]"
                      : "text-gray-500 hover:text-[#5A4BDA]"
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="flex h-[calc(100%-7rem)] border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm bg-white/50 backdrop-blur-sm">
        <AnimatePresence mode="popLayout">
          {visibleColumns.map((entityKey) => {
            const config = columnConfig.find((c) => c.key === entityKey)!;
            const Icon = config.icon;
            const items = data[entityKey] || [];
            const selectedId = selected[entityKey];
            const isColumnLoading = loading[entityKey];
            const search = searchQueries[entityKey] || "";

            const filtered = items.filter((item) => {
              const value = (item[config.displayKey] || item.name || "") as string;
              return value.toLowerCase().includes(search.toLowerCase());
            });

            return (
              <motion.div
                key={entityKey}
                initial={{ opacity: 0, x: 30, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -30, width: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col w-64 min-w-[16rem] border-r border-gray-200/60 flex-shrink-0 bg-white/80"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.color}`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{config.title}</h3>
                    <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* Search */}
                <div className="px-3 py-2 border-b border-gray-50">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${config.title.toLowerCase()}...`}
                      value={search}
                      onChange={(e) =>
                        setSearchQueries((prev) => ({ ...prev, [entityKey]: e.target.value }))
                      }
                      className="w-full pl-7 pr-2 py-1.5 text-xs bg-gray-50/60 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5A4BDA]/20 focus:border-[#5A4BDA]/30 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {isColumnLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Folder className="w-8 h-8 text-gray-200 mb-2" />
                      <p className="text-xs">
                        {search ? "No matches" : `No ${config.title.toLowerCase()} yet`}
                      </p>
                    </div>
                  ) : (
                    filtered.map((item, idx) => {
                      const displayValue = (item[config.displayKey] || item.name || "") as string;
                      const isSelected = selectedId === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() =>
                            setSelected((prev) => ({ ...prev, [entityKey]: item.id }))
                          }
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                            isSelected
                              ? "bg-[#5A4BDA]/10 text-[#5A4BDA] shadow-sm"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden min-w-0">
                            {isSelected ? (
                              <FolderOpen className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <Folder className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            )}
                            <span className="truncate text-sm font-medium">{displayValue}</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(entityKey, item);
                              }}
                              className="p-1 hover:bg-[#5A4BDA]/10 text-gray-400 hover:text-[#5A4BDA] rounded-lg transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({ entity: entityKey, item });
                              }}
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {entityKey !== "topic" && (
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Add Button */}
                <div className="px-3 py-3 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => handleOpenAdd(entityKey)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#5A4BDA] bg-[#5A4BDA]/5 hover:bg-[#5A4BDA]/10 rounded-xl transition-colors border border-[#5A4BDA]/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add {config.title.slice(0, -1)}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {visibleColumns.length === 1 && !selected.board && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50/50 to-white">
            <div className="p-4 rounded-2xl bg-gray-100/50 mb-4">
              <Layers className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Select a board to begin</p>
            <p className="text-xs text-gray-400 mt-1">
              Navigate the syllabus hierarchy step by step
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={
          modal
            ? `${modal.type === "add" ? "Add New" : "Edit"} ${
                columnConfig.find((c) => c.key === modal.entity)?.title.slice(0, -1) || ""
              }`
            : ""
        }
        description={
          modal?.type === "add"
            ? `Create a new ${modal.entity} in the syllabus hierarchy`
            : `Update the ${modal?.entity} details`
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleModalSubmit();
          }}
          className="space-y-4"
        >
          {modalError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {modal?.entity === "class" ? "Class Name" : "Name"}
            </label>
            <input
              type="text"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              placeholder={`Enter ${modal?.entity || ""} name...`}
              className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 focus:border-[#5A4BDA]/40 transition-all placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {modal?.entity === "topic" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                placeholder="Enter topic description..."
                rows={3}
                className="w-full px-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 focus:border-[#5A4BDA]/40 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5A4BDA] hover:bg-[#4A3BCA] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {modalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : modal?.type === "add" ? (
                "Create"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.entity || ""}?`}
        message={`This will permanently delete this ${
          deleteTarget?.entity || ""
        } and all its child elements. This action cannot be undone.`}
        isLoading={deleteLoading}
      />
    </PageWrapper>
  );
}
