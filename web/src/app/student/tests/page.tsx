"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, BarChart3, AlertCircle } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { fadeIn, stagger } from "@/shared/ui/motion";

type StudentAttempt = {
  id: string;
  testId: string;
  test: { id: string; title: string; pin: string };
  studentName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  score: number;
  total: number;
  startedAt: string;
  completedAt: string | null;
};

export default function StudentTestsPage() {
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ attempts: StudentAttempt[] }>("/student/attempts")
      .then((body) => setAttempts(body.attempts.filter((a) => a.status === "COMPLETED")))
      .catch((e) => setError(e instanceof Error ? e.message : "Помилка завантаження"))
      .finally(() => setLoading(false));
  }, []);

  const completed = attempts.filter((a) => a.status === "COMPLETED");
  const avgPct =
    completed.length > 0
      ? Math.round(completed.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / completed.length)
      : 0;

  function gradeLabel(pct: number) {
    if (pct >= 92) return { label: "Відмінно", color: "text-emerald-700 bg-emerald-100" };
    if (pct >= 75) return { label: "Добре", color: "text-blue-700 bg-blue-100" };
    if (pct >= 50) return { label: "Задовільно", color: "text-amber-700 bg-amber-100" };
    return { label: "Незадовільно", color: "text-rose-700 bg-rose-100" };
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Мої тести</h1>
        <p className="text-sm text-gray-500">Результати завершених тестів</p>
      </motion.div>

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <motion.div
            className="flex gap-4 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
              <Trophy className="size-5 text-amber-500" />
              <span className="text-sm font-bold text-gray-900">
                {completed.length} тестів пройдено
              </span>
            </div>
            {completed.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm">
                <BarChart3 className="size-5 text-violet-500" />
                <span className="text-sm font-bold text-gray-900">
                  Середній результат: {avgPct}%
                </span>
              </div>
            )}
          </motion.div>

          {completed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-gray-400">
              <Trophy className="mx-auto mb-3 size-10 opacity-40" />
              <p className="font-medium">Ще немає завершених тестів</p>
              <p className="text-sm mt-1">
                Пройдіть тест за PIN на{" "}
                <Link href="/join" className="text-emerald-600 hover:underline">
                  /join
                </Link>
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {completed.map((attempt, i) => {
                const pct = Math.round((attempt.score / attempt.total) * 100);
                const grade = gradeLabel(pct);
                const date = new Date(attempt.completedAt ?? attempt.startedAt).toLocaleDateString(
                  "uk-UA",
                  { day: "numeric", month: "short", year: "numeric" },
                );
                return (
                  <motion.div
                    key={attempt.id}
                    variants={fadeIn}
                    custom={i}
                    className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 card-hover"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{attempt.test.title}</h3>
                        <p className="text-xs text-gray-400">PIN {attempt.test.pin} · {date}</p>
                      </div>
                      <span className={`shrink-0 text-sm font-extrabold rounded-xl px-3 py-1 ${grade.color}`}>
                        {grade.label}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Результат</span>
                        <span className="font-bold text-gray-900">
                          {attempt.score}/{attempt.total} ({pct}%)
                        </span>
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

                    <div className="flex items-center justify-end">
                      <Link
                        href={`/test/${attempt.test.pin}/results`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Деталі <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
