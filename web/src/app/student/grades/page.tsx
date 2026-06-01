"use client";

import { motion } from "framer-motion";
import { MOCK_STUDENT_GRADES } from "@/shared/lib/mock-data";
import { SubjectIcon } from "@/shared/ui/subject-icon";
import { fadeIn, stagger } from "@/shared/ui/motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

function GradeCell({ g }: { g: number }) {
  const color =
    g >= 10 ? "bg-emerald-100 text-emerald-700" :
    g >= 7  ? "bg-blue-100 text-blue-700" :
    g >= 4  ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold ${color}`}>{g}</span>
  );
}

const radarData = MOCK_STUDENT_GRADES.map(s => ({ subject: s.subject, avg: s.avg }));

export default function StudentGradesPage() {
  const overall = (MOCK_STUDENT_GRADES.reduce((a, s) => a + s.avg, 0) / MOCK_STUDENT_GRADES.length).toFixed(1);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Мої оцінки</h1>
        <p className="text-sm text-gray-500">Журнал успішності по предметах</p>
      </motion.div>

      {/* Overall + Radar */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <motion.div
          className="rounded-2xl gradient-primary p-6 text-white shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-violet-200 mb-1">Середній бал</p>
          <p className="text-6xl font-extrabold mb-2">{overall}</p>
          <p className="text-violet-200 text-sm">по {MOCK_STUDENT_GRADES.length} предметах</p>
          <div className="mt-4 text-xs text-violet-200">
            12-бальна шкала • 2025/2026 н.р.
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-sm font-bold text-gray-700 mb-2">Радар знань</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
              <PolarRadiusAxis domain={[0, 12]} tick={false} />
              <Radar dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Per-subject grades */}
      <motion.div
        className="space-y-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {MOCK_STUDENT_GRADES.map((subj, i) => (
          <motion.div
            key={subj.subject}
            variants={fadeIn}
            custom={i}
            className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100">
                  <SubjectIcon icon={subj.icon} className="size-5 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900">{subj.subject}</h3>
              </div>
              <span className={`text-lg font-extrabold rounded-xl px-3 py-1 ${
                subj.avg >= 10 ? "bg-emerald-100 text-emerald-700" :
                subj.avg >= 7  ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              }`}>{subj.avg}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {subj.grades.map((g, j) => <GradeCell key={j} g={g} />)}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
