"use client";

import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { MOCK_HOMEWORK } from "@/shared/lib/mock-data";
import { fadeIn, stagger } from "@/shared/ui/motion";

const STATUS_CONFIG = {
  active: { label: "Активне", icon: Clock, color: "text-blue-600 bg-blue-50 border-blue-100" },
  overdue: { label: "Прострочене", icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-100" },
  completed: { label: "Завершено", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

export default function HomeworkPage() {
  const counts = {
    active: MOCK_HOMEWORK.filter(h => h.status === "active").length,
    overdue: MOCK_HOMEWORK.filter(h => h.status === "overdue").length,
    completed: MOCK_HOMEWORK.filter(h => h.status === "completed").length,
  };

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
        <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
          <Plus className="size-4" />
          Нове завдання
        </button>
      </motion.div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([key, count], i) => {
          const cfg = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
          return (
            <motion.div
              key={key}
              className={`rounded-2xl border p-4 text-center ${cfg.color}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <cfg.icon className="size-5 mx-auto mb-1" />
              <div className="text-2xl font-extrabold">{count}</div>
              <div className="text-xs font-medium">{cfg.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Homework list */}
      <motion.div
        className="space-y-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {MOCK_HOMEWORK.map((hw, i) => {
          const cfg = STATUS_CONFIG[hw.status as keyof typeof STATUS_CONFIG];
          const submittedPct = Math.round((hw.submitted / hw.total) * 100);
          return (
            <motion.div
              key={hw.id}
              variants={fadeIn}
              custom={i}
              className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 card-hover"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-gray-900">{hw.title}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                      <cfg.icon className="size-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{hw.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-600">
                      {hw.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      до {hw.dueDate}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="shrink-0 w-full sm:w-36">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="flex items-center gap-1"><Users className="size-3" />Здали</span>
                    <span className="font-bold text-gray-900">{hw.submitted}/{hw.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${submittedPct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">{submittedPct}%</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
