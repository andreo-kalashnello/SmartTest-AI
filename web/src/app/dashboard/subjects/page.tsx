"use client";

import { motion } from "framer-motion";
import { Plus, Users, FileText, ClipboardList } from "lucide-react";
import { MOCK_SUBJECTS } from "@/shared/lib/mock-data";
import { fadeIn, stagger } from "@/shared/ui/motion";

export default function SubjectsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Предмети</h1>
          <p className="text-sm text-gray-500">Управління предметами та класами</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all">
          <Plus className="size-4" />
          Додати предмет
        </button>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {MOCK_SUBJECTS.map((subj, i) => (
          <motion.div
            key={subj.id}
            variants={fadeIn}
            custom={i}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 card-hover cursor-pointer"
          >
            {/* Top gradient bar */}
            <div className={`h-2 bg-gradient-to-r ${subj.color}`} />
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${subj.color} text-2xl`}>
                  {subj.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{subj.name}</h3>
                  <p className="text-xs text-gray-400">10-А, 10-Б, 10-В</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: Users, val: subj.students, label: "учнів" },
                  { icon: FileText, val: subj.tests, label: "тестів" },
                  { icon: ClipboardList, val: subj.homework, label: "ДЗ" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50 py-2">
                    <div className="text-lg font-bold text-gray-900">{s.val}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add card */}
        <motion.div
          variants={fadeIn}
          custom={MOCK_SUBJECTS.length}
          className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 transition-all hover:border-violet-400 hover:bg-violet-50"
        >
          <div className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gray-100">
              <Plus className="size-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Додати предмет</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
