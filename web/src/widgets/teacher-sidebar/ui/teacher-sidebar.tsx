"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, LayoutDashboard, FileText, Users, BookOpen,
  ClipboardList, BarChart3, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { logout, logoutTeacher, useAppDispatch, useAppSelector } from "@/shared/lib/store";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Огляд" },
  { href: "/dashboard/tests", icon: FileText, label: "Тести" },
  { href: "/dashboard/subjects", icon: BookOpen, label: "Предмети" },
  { href: "/dashboard/students", icon: Users, label: "Учні" },
  { href: "/dashboard/homework", icon: ClipboardList, label: "Завдання" },
  { href: "/dashboard/grades", icon: FileText, label: "Журнал оцінок" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Аналітика" },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.authSession.user);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutTeacher());
    dispatch(logout());
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-violet-700/30">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white/20">
          <Brain className="size-5 text-white" />
        </div>
        <span className="font-extrabold text-white text-lg tracking-tight">SmartTest AI</span>
      </div>

      {/* User */}
      {user && (
        <div className="px-4 py-4 border-b border-violet-700/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white text-sm font-bold">
              {user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-violet-300">Вчитель</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-violet-700 shadow-md"
                  : "text-violet-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className={`size-4.5 ${active ? "text-violet-600" : "opacity-75"}`} />
              {item.label}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto size-1.5 rounded-full bg-violet-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-violet-700/30">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-violet-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="size-4" />
          Вийти з акаунта
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col gradient-primary min-h-dvh fixed left-0 top-0 z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 gradient-primary shadow-lg">
        <div className="flex items-center gap-2 font-bold text-white">
          <Brain className="size-5" />
          SmartTest AI
        </div>
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 w-64 gradient-primary shadow-2xl"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button
                className="absolute right-4 top-4 text-white/70 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
