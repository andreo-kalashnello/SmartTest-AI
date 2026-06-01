"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, LayoutDashboard, ClipboardList, Star, FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/student", icon: LayoutDashboard, label: "Мій кабінет" },
  { href: "/student/homework", icon: ClipboardList, label: "Завдання" },
  { href: "/student/grades", icon: Star, label: "Оцінки" },
  { href: "/student/tests", icon: FileText, label: "Мої тести" },
];

function StudentSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-emerald-700/30">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white/20">
          <Brain className="size-5 text-white" />
        </div>
        <span className="font-extrabold text-white text-lg">SmartTest AI</span>
      </div>

      <div className="px-4 py-4 border-b border-emerald-700/30">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white text-sm font-bold">АС</div>
          <div>
            <p className="text-sm font-semibold text-white">Анна Сидоренко</p>
            <p className="text-xs text-emerald-300">Учень • 10-А</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.href === "/student"
            ? pathname === "/student"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-white text-emerald-700 shadow-md"
                  : "text-emerald-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-700/30">
        <Link
          href="/join"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-all"
        >
          🔢 Пройти тест за PIN
        </Link>
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 min-h-dvh z-30 shadow-2xl bg-gradient-to-b from-emerald-600 to-teal-700">
        <StudentSidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg">
        <span className="flex items-center gap-2 font-bold text-white"><Brain className="size-5" />SmartTest AI</span>
        <button onClick={() => setOpen(true)} className="text-white"><Menu className="size-5" /></button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-gradient-to-b from-emerald-600 to-teal-700 shadow-2xl"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button className="absolute right-4 top-4 text-white/70 hover:text-white" onClick={() => setOpen(false)}><X className="size-5" /></button>
              <StudentSidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-60">
        <main className="px-4 pt-16 pb-8 sm:px-6 lg:pt-8 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
