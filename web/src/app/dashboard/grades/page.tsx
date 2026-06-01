"use client";

import { motion } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import { MOCK_GRADES } from "@/shared/lib/mock-data";
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

const TYPE_LABELS: Record<string, string> = {
  test: "🧪 Тест",
  homework: "📝 ДЗ",
  oral: "🗣 Усне",
};

export default function GradesPage() {
  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Журнал оцінок</h1>
          <p className="text-sm text-gray-500">Виставлення та перегляд оцінок учнів</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter className="size-4" />
            Фільтр
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
            <Plus className="size-4" />
            Виставити оцінку
          </button>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { range: "10–12", label: "Відмінно", color: "bg-emerald-100 text-emerald-700" },
          { range: "7–9", label: "Добре", color: "bg-blue-100 text-blue-700" },
          { range: "4–6", label: "Задовільно", color: "bg-amber-100 text-amber-700" },
          { range: "1–3", label: "Незадовільно", color: "bg-rose-100 text-rose-700" },
        ].map(l => (
          <span key={l.range} className={`rounded-full px-3 py-1 font-medium ${l.color}`}>
            {l.range} — {l.label}
          </span>
        ))}
      </div>

      {/* Grades table */}
      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Учень</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Предмет</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Робота</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Тип</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Дата</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Оцінка</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_GRADES.map((g, i) => (
              <motion.tr
                key={g.id}
                variants={fadeIn}
                custom={i}
                className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {g.student.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium text-gray-900 truncate max-w-[120px]">{g.student}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">{g.subject}</span>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 text-xs">{g.work}</td>
                <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-500">{TYPE_LABELS[g.type]}</td>
                <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-400">{g.date}</td>
                <td className="px-4 py-3.5 text-center">
                  <GradeBadge grade={g.grade} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
