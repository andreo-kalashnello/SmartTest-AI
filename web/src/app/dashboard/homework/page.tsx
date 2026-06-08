"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, AlertCircle } from "lucide-react";

export default function HomeworkPage() {
  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
          <p className="text-sm text-gray-500">Призначення, перевірка та контроль виконання</p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-4 text-sm text-amber-900 flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="size-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">API домашніх завдань ще не підключений на бекенді</p>
          <p className="text-amber-800/80 mt-1">
            Мокові дані прибрано. Після появи ендпоінтів{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">GET /homework</code> сторінка
            автоматично покаже реальні завдання.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ClipboardList className="mx-auto mb-3 size-12 opacity-30" />
        <p className="font-medium text-gray-600">Завдань поки немає</p>
        <p className="text-sm mt-2 max-w-md mx-auto">
          Поки що використовуйте{" "}
          <Link href="/dashboard/tests" className="text-violet-600 hover:underline">
            тести
          </Link>{" "}
          для перевірки знань учнів.
        </p>
      </motion.div>
    </div>
  );
}
