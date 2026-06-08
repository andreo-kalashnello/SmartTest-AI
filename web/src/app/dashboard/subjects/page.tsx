"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, FileText, Target, BarChart3, AlertCircle } from "lucide-react";

import { useTeacherAnalytics } from "@/shared/lib/hooks/use-teacher-analytics";
import { fadeIn, stagger } from "@/shared/ui/motion";

export default function SubjectsPage() {
  const { data, loading, error } = useTeacherAnalytics();

  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Предмети</h1>
          <p className="text-sm text-gray-500">
            Тести та результати з бекенду (окремий API предметів ще не підключений)
          </p>
        </div>
        <Link
          href="/dashboard/tests/new"
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all"
        >
          <Plus className="size-4" />
          Новий тест
        </Link>
      </motion.div>

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {data && data.testSubjects.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <FileText className="mx-auto mb-3 size-10 opacity-40" />
          <p className="font-medium text-gray-600">Ще немає тестів</p>
          <p className="text-sm mt-1">
            Створіть перший тест на{" "}
            <Link href="/dashboard/tests/new" className="text-violet-600 hover:underline">
              /dashboard/tests/new
            </Link>
          </p>
        </div>
      )}

      {data && data.testSubjects.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {data.testSubjects.map((subj, i) => (
            <motion.div
              key={subj.id}
              variants={fadeIn}
              custom={i}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 card-hover"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                    <FileText className="size-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{subj.title}</h3>
                    <p className="text-xs text-gray-400">PIN {subj.pin}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: FileText, val: subj.questions, label: "питань" },
                    { icon: Target, val: subj.attempts, label: "спроб" },
                    { icon: BarChart3, val: subj.attempts > 0 ? `${subj.avgScorePct}%` : "—", label: "сер. бал" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 py-2">
                      <div className="text-lg font-bold text-gray-900">{s.val}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/dashboard/tests/${subj.id}/attempts`}
                  className="mt-4 block text-center text-xs font-medium text-violet-600 hover:underline"
                >
                  Результати спроб →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
