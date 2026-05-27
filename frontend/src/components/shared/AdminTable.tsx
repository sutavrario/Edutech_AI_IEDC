"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Search, Loader2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export default function AdminTable({
  columns,
  data,
  onEdit,
  onDelete,
  isLoading = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  emptyIcon,
}: AdminTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A4BDA]/20 focus:border-[#5A4BDA]/40 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Loading...</p>
        </div>
      ) : data.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          {emptyIcon || (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
          )}
          <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adding new items or adjusting your search
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50"
                  >
                    {col.label}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((row, i) => (
                <motion.tr
                  key={row.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="hover:bg-[#5A4BDA]/[0.02] transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4 text-gray-700">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] || "—"}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 rounded-lg hover:bg-[#5A4BDA]/10 text-gray-400 hover:text-[#5A4BDA] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
