"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { FlaskConical, AlertCircle } from "lucide-react";

import { initials } from "@/shared/api/teacher-analytics";
import { useTeacherAnalytics } from "@/shared/lib/hooks/use-teacher-analytics";
import { fadeIn, stagger } from "@/shared/ui/motion";

function GradeBadge({ grade }: { grade: number }) {
  const color =
    grade >= 10 ? "bg-emerald-100 text-emerald-700" :
    grade >= 7 ? "bg-blue-100 text-blue-700" :
    grade >= 4 ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex size-10 items-center justify-center rounded-xl text-sm font-extrabold ${color}`}>
      {grade}
    </span>
  );
}

const TYPE_LABELS: Record<string, { label: string; Icon: LucideIcon }> = {
  test: { label: "Тест", Icon: FlaskConical },
};

export default function GradesPage() {
  const { data, loading, error } = useTeacherAnalytics();

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Журнал оцінок</h1>
          <p className="text-sm text-gray-500">
            Оцінки з завершених тестів (12-бальна шкала з результату спроби)
          </p>
        </div>
      </motion.div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { range: "10–12", label: "Відмінно", color: "bg-emerald-100 text-emerald-700" },
          { range: "7–9", label: "Добре", color: "bg-blue-100 text-blue-700" },
          { range: "4–6", label: "Задовільно", color: "bg-amber-100 text-amber-700" },
          { range: "1–3", label: "Незадовільно", color: "bg-rose-100 text-rose-700" },
        ].map((l) => (
          <span key={l.range} className={`rounded-full px-3 py-1 font-medium ${l.color}`}>
            {l.range} — {l.label}
          </span>
        ))}
      </div>

      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Завантаження...</div>
        ) : !data?.gradeJournal.length ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Ще немає оцінок — учні мають завершити хоча б один тест
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Учень</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Категорія</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Робота</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Тип</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Дата</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Оцінка</th>
              </tr>
            </thead>
            <tbody>
              {data.gradeJournal.map((g, i) => (
                <motion.tr
                  key={g.id}
                  variants={fadeIn}
                  custom={i}
                  className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(g.student)}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[120px]">{g.student}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">{g.subject}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 text-xs">{g.work}</td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    {(() => {
                      const t = TYPE_LABELS[g.type];
                      if (!t) return null;
                      return (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <t.Icon className="size-3.5 shrink-0" aria-hidden />
                          {t.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-400">{g.date}</td>
                  <td className="px-4 py-3.5 text-center">
                    <GradeBadge grade={g.grade} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
