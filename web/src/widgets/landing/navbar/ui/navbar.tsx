"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      className="sticky top-0 z-50 glass border-b border-white/20"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-violet-700 text-lg">
          <div className="flex size-8 items-center justify-center rounded-lg gradient-primary">
            <Brain className="size-5 text-white" />
          </div>
          SmartTest AI
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/#features" className="hidden sm:block hover:text-violet-700 transition-colors">Функції</Link>
          <Link href="/#how" className="hidden sm:block hover:text-violet-700 transition-colors">Як це працює</Link>
          <Link href="/join" className="hover:text-violet-700 transition-colors">Пройти тест</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:text-violet-700 transition-colors"
          >
            Увійти
          </Link>
          <Link
            href="/register"
            className="inline-flex rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          >
            Реєстрація
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
