"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { MOCK_STUDENT_HOMEWORK } from "@/shared/lib/mock-data";
import { SubjectIcon } from "@/shared/ui/subject-icon";
import { fadeIn, stagger } from "@/shared/ui/motion";

const STATUS = {
  pending: { label: "Очікує здачі", icon: Clock, colors: "bg-amber-50 border-amber-100 text-amber-700" },
  submitted: { label: "Здано", icon: CheckCircle2, colors: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  overdue: { label: "Прострочено", icon: AlertCircle, colors: "bg-rose-50 border-rose-100 text-rose-700" },
};

export default function StudentHomeworkPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
        <p className="text-sm text-gray-500">Ваші поточні та минулі завдання</p>
      </motion.div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {["Всі", "Очікують", "Здано", "Прострочено"].map((f) => (
          <button
            key={f}
            className="rounded-full bg-white border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-emerald-400 hover:text-emerald-700 transition-all"
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="visible">
        {MOCK_STUDENT_HOMEWORK.map((hw, i) => {
          const cfg = STATUS[hw.status as keyof typeof STATUS];
          return (
            <motion.div
              key={hw.id}
              variants={fadeIn}
              custom={i}
              className={`rounded-2xl border p-5 transition-all hover:shadow-sm ${cfg.colors}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/60">
                  <SubjectIcon icon={hw.icon} className="size-6 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{hw.title}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cfg.colors}`}>
                      <cfg.icon className="size-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{hw.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="size-3.5" />
                    Здати до: <strong>{hw.dueDate}</strong>
                  </div>
                </div>
                {hw.status === "pending" && (
                  <button className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm">
                    Здати
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
