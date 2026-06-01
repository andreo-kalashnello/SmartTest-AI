"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, BarChart3 } from "lucide-react";
import { MOCK_STUDENT_TESTS } from "@/shared/lib/mock-data";
import { fadeIn, stagger } from "@/shared/ui/motion";

export default function StudentTestsPage() {
  const avgPct = Math.round(
    MOCK_STUDENT_TESTS.reduce((a, t) => a + (t.score / t.total) * 100, 0) / MOCK_STUDENT_TESTS.length
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Мої тести</h1>
        <p className="text-sm text-gray-500">Результати всіх пройдених тестів</p>
      </motion.div>

      {/* Summary bar */}
      <motion.div
        className="flex gap-4 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
          <Trophy className="size-5 text-amber-500" />
          <span className="text-sm font-bold text-gray-900">{MOCK_STUDENT_TESTS.length} тестів пройдено</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
          <BarChart3 className="size-5 text-violet-500" />
          <span className="text-sm font-bold text-gray-900">Середній результат: {avgPct}%</span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {MOCK_STUDENT_TESTS.map((test, i) => {
          const pct = Math.round((test.score / test.total) * 100);
          const grade =
            pct >= 92 ? { label: "Відмінно", color: "text-emerald-700 bg-emerald-100" } :
            pct >= 75 ? { label: "Добре", color: "text-blue-700 bg-blue-100" } :
            pct >= 50 ? { label: "Задовільно", color: "text-amber-700 bg-amber-100" } :
            { label: "Незадовільно", color: "text-rose-700 bg-rose-100" };
          return (
            <motion.div
              key={test.id}
              variants={fadeIn}
              custom={i}
              className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 card-hover"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{test.title}</h3>
                  <p className="text-xs text-gray-400">{test.subject} • {test.date}</p>
                </div>
                <span className={`shrink-0 text-sm font-extrabold rounded-xl px-3 py-1 ${grade.color}`}>
                  {grade.label}
                </span>
              </div>

              {/* Score bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Результат</span>
                  <span className="font-bold text-gray-900">{test.score}/{test.total} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">PIN: {test.pin}</span>
                <Link
                  href={`/test/${test.pin}/results`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                >
                  Деталі <ArrowRight className="size-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
