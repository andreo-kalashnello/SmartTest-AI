"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  School,
  Star,
  CheckCircle2,
  Hand,
  ClipboardList,
  FlaskConical,
  AlertCircle,
} from "lucide-react";

import { useAppSelector } from "@/shared/lib/store";
import { useStudentDashboard } from "@/shared/lib/hooks/use-student-dashboard";
import { fadeIn, stagger } from "@/shared/ui/motion";

function gradeColor(g: number) {
  if (g >= 10) return "bg-emerald-100 text-emerald-700";
  if (g >= 7) return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}

export default function StudentHomePage() {
  const user = useAppSelector((s) => s.authSession.user);
  const { data, loading, error } = useStudentDashboard();

  const firstName = user?.name?.split(" ")[0] ?? "Учень";
  const classLabel = user?.grade ?? "";

  const stats = data
    ? [
        {
          icon: School,
          val: data.stats.classesCount,
          label: "Моїх класів",
          color: "from-amber-400 to-orange-500",
        },
        {
          icon: Star,
          val: data.stats.testsCompleted > 0 ? data.stats.avgGrade12 : "—",
          label: "Середній бал",
          color: "from-violet-500 to-purple-600",
        },
        {
          icon: CheckCircle2,
          val: loading ? "…" : data.stats.testsCompleted,
          label: "Тестів пройдено",
          color: "from-emerald-500 to-teal-600",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-6 -right-6 size-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-16 size-20 rounded-full bg-white/10" />
        <div className="relative">
          <Hand className="size-8 mb-2 text-white/90" aria-hidden />
          <h1 className="text-2xl font-extrabold mb-1">Привіт, {firstName}!</h1>
          <p className="text-emerald-100 text-sm">
            {classLabel ? `Клас ${classLabel} · ` : ""}
            Сьогодні{" "}
            {new Date().toLocaleDateString("uk-UA", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </motion.div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeIn}
            custom={i}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center card-hover"
          >
            <div
              className={`mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}
            >
              <s.icon className="size-5 text-white" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{s.val}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Homework — no API yet */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList className="size-5 text-emerald-600" aria-hidden />
              Домашні завдання
            </h3>
            <Link
              href="/student/homework"
              className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
            >
              Всі <ArrowRight className="size-3" />
            </Link>
          </div>
          <p className="text-sm text-gray-400 py-4 text-center">
            Завдань поки немає — API домашніх завдань ще не підключений
          </p>
        </motion.div>

        {/* Grades from test attempts */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="size-5 text-amber-500" aria-hidden />
              Результати тестів
            </h3>
            <Link
              href="/student/grades"
              className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
            >
              Журнал <ArrowRight className="size-3" />
            </Link>
          </div>

          {loading && <p className="text-sm text-gray-400">Завантаження...</p>}

          {!loading && data?.gradeByTest.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              Ще немає оцінок — пройдіть тест на{" "}
              <Link href="/join" className="text-emerald-600 hover:underline">
                /join
              </Link>
            </p>
          )}

          {!loading && data && data.gradeByTest.length > 0 && (
            <div className="space-y-3">
              {data.gradeByTest.slice(0, 4).map((sg) => (
                <div key={sg.testId} className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FlaskConical className="size-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sg.testTitle}</p>
                    <div className="flex gap-1 mt-1">
                      {sg.grades.slice(-4).map((g, i) => (
                        <span
                          key={i}
                          className={`flex size-6 items-center justify-center rounded text-xs font-bold ${gradeColor(g)}`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-gray-900">{sg.avg}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent tests */}
      <motion.div
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="size-5 text-violet-600" aria-hidden />
            Останні тести
          </h3>
          <Link
            href="/student/tests"
            className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
          >
            Всі <ArrowRight className="size-3" />
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-400">Завантаження...</p>}

        {!loading && data?.completedAttempts.length === 0 && (
          <p className="text-sm text-gray-400">
            Тестів ще немає. Пройдіть тест за PIN на{" "}
            <Link href="/join" className="text-emerald-600 hover:underline">
              /join
            </Link>
            .
          </p>
        )}

        {!loading && data && data.completedAttempts.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.completedAttempts.slice(0, 3).map((attempt) => {
              const pct = Math.round((attempt.score / attempt.total) * 100);
              const date = new Date(attempt.completedAt!).toLocaleDateString("uk-UA", {
                day: "numeric",
                month: "short",
              });
              return (
                <div key={attempt.id} className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {attempt.test.title}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{date}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {attempt.score}/{attempt.total}
                    </span>
                    <span
                      className={`text-sm font-extrabold rounded-full px-2.5 py-0.5 ${
                        pct >= 83
                          ? "bg-emerald-100 text-emerald-700"
                          : pct >= 58
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
