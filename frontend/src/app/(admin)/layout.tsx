"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Layers,
  GraduationCap,
  Library,
  FileText,
  Hash,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Video,
  Users,
} from "lucide-react";
import AdminProtectedRoute from "@/components/shared/AdminProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/syllabus", label: "Syllabus Editor", icon: BookOpen },
  { href: "/admin/boards", label: "Boards", icon: Layers },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: Library },
  { href: "/admin/chapters", label: "Chapters", icon: FileText },
  { href: "/admin/topics", label: "Topics", icon: Hash },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-[270px] flex-shrink-0 bg-[#0f172a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5"
            >
              <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white">
                  EduTech
                </span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </Link>
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
            <p className="px-4 mb-3 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Management
            </p>
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] ${
                        isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium flex-1">
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="adminActiveTab"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <ChevronRight className="w-4 h-4 text-indigo-400" />
                      </motion.div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.full_name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center h-14 px-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="ml-3 font-semibold text-gray-900">
              Admin Portal
            </span>
          </div>

          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
