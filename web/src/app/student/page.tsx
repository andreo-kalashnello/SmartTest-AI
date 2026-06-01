"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Star, CheckCircle2 } from "lucide-react";
import { MOCK_STUDENT_GRADES, MOCK_STUDENT_HOMEWORK, MOCK_STUDENT_TESTS } from "@/shared/lib/mock-data";
import { fadeIn, stagger } from "@/shared/ui/motion";

export default function StudentHomePage() {
  const pending = MOCK_STUDENT_HOMEWORK.filter(h => h.status === "pending").length;
  const avgGrade = (MOCK_STUDENT_GRADES.reduce((a, s) => a + s.avg, 0) / MOCK_STUDENT_GRADES.length).toFixed(1);
  const totalTests = MOCK_STUDENT_TESTS.length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg relative overflow-hidden"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-6 -right-6 size-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-16 size-20 rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-3xl mb-2">👋</div>
          <h1 className="text-2xl font-extrabold mb-1">Привіт, Анно!</h1>
          <p className="text-emerald-100 text-sm">Клас 10-А • Сьогодні {new Date().toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: Clock, val: pending, label: "Завдань до здачі", color: "from-amber-400 to-orange-500" },
          { icon: Star, val: avgGrade, label: "Середній бал", color: "from-violet-500 to-purple-600" },
          { icon: CheckCircle2, val: totalTests, label: "Тестів пройдено", color: "from-emerald-500 to-teal-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeIn}
            custom={i}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 text-center card-hover"
          >
            <div className={`mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="size-5 text-white" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{s.val}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending homework */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">📝 Домашні завдання</h3>
            <Link href="/student/homework" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              Всі <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_STUDENT_HOMEWORK.slice(0, 3).map((hw) => (
              <div key={hw.id} className={`flex items-center gap-3 rounded-xl p-3 ${
                hw.status === "overdue" ? "bg-rose-50 border border-rose-100"
                : hw.status === "submitted" ? "bg-emerald-50 border border-emerald-100"
                : "bg-amber-50 border border-amber-100"
              }`}>
                <span className="text-xl">{hw.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{hw.title}</p>
                  <p className="text-xs text-gray-500">до {hw.dueDate}</p>
                </div>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  hw.status === "overdue" ? "bg-rose-100 text-rose-700"
                  : hw.status === "submitted" ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
                }`}>
                  {hw.status === "overdue" ? "Прострочено" : hw.status === "submitted" ? "Здано" : "Очікує"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent grades */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">⭐ Мої оцінки</h3>
            <Link href="/student/grades" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              Журнал <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_STUDENT_GRADES.map((sg) => (
              <div key={sg.subject} className="flex items-center gap-3">
                <span className="text-xl">{sg.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sg.subject}</p>
                  <div className="flex gap-1 mt-1">
                    {sg.grades.slice(-4).map((g, i) => (
                      <span
                        key={i}
                        className={`flex size-6 items-center justify-center rounded text-xs font-bold ${
                          g >= 10 ? "bg-emerald-100 text-emerald-700" : g >= 7 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}
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
          <h3 className="font-bold text-gray-900">🧪 Останні тести</h3>
          <Link href="/student/tests" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
            Всі <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_STUDENT_TESTS.slice(0, 3).map((test) => {
            const pct = Math.round((test.score / test.total) * 100);
            return (
              <div key={test.id} className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{test.title}</p>
                <p className="text-xs text-gray-400 mb-3">{test.date}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{test.score}/{test.total}</span>
                  <span className={`text-sm font-extrabold rounded-full px-2.5 py-0.5 ${
                    pct >= 83 ? "bg-emerald-100 text-emerald-700" : pct >= 58 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  }`}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
