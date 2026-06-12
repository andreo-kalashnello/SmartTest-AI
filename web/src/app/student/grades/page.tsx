"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertCircle, FlaskConical } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import { useStudentDashboard } from "@/shared/lib/hooks/use-student-dashboard";
import { fetchMyGrades, type TeacherGradeItem } from "@/shared/api/grades";
import { fadeIn, stagger } from "@/shared/ui/motion";

function GradeCell({ g }: { g: number }) {
  const color =
    g >= 10 ? "bg-emerald-100 text-emerald-700" :
    g >= 7 ? "bg-blue-100 text-blue-700" :
    g >= 4 ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold ${color}`}>
      {g}
    </span>
  );
}

export default function StudentGradesPage() {
  const { data, loading, error } = useStudentDashboard();

  const overall = data?.stats.avgGrade12 ?? 0;
  const testCount = data?.gradeByTest.length ?? 0;
  const [myGrades, setMyGrades] = useState<TeacherGradeItem[] | null>(null);
  const [myGradesLoading, setMyGradesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setMyGradesLoading(true);
    void fetchMyGrades()
      .then((res) => {
        if (!mounted) return;
        setMyGrades(res.grades);
      })
      .catch((e) => {
        console.warn('Failed to load my grades', e);
      })
      .finally(() => {
        if (!mounted) return;
        setMyGradesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Мої оцінки</h1>
        <p className="text-sm text-gray-500">
          Оцінки з завершених тестів (12-бальна шкала)
        </p>
      </motion.div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {/* Teacher-assigned grades (from /grades/my) */}
      {!myGradesLoading && myGrades && myGrades.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Оцінки від вчителя</h3>
          <div className="grid gap-3">
            {myGrades.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm text-gray-500">{g.subject.name}</div>
                  <div className="font-semibold">{g.workTitle}</div>
                  <div className="text-xs text-gray-500">{new Date(g.date).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-lg font-bold px-3 py-1">{g.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}

      {!loading && data?.completedAttempts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <FlaskConical className="mx-auto mb-3 size-10 opacity-40" />
          <p className="font-medium text-gray-600">Ще немає оцінок</p>
          <p className="text-sm mt-2">
            Пройдіть тест на{" "}
            <Link href="/join" className="text-emerald-600 hover:underline">
              /join
            </Link>{" "}
            (увійдіть як учень, щоб результат зберегся)
          </p>
        </div>
      )}

      {data && data.completedAttempts.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <motion.div
              className="rounded-2xl gradient-primary p-6 text-white shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-violet-200 mb-1">Середній бал</p>
              <p className="text-6xl font-extrabold mb-2">{overall}</p>
              <p className="text-violet-200 text-sm">по {testCount} тестах</p>
              <p className="mt-4 text-xs text-violet-200">
                Середній результат: {data.stats.avgScorePct}%
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-sm font-bold text-gray-700 mb-2">Радар по тестах</p>
              {data.radarData.length < 3 ? (
                <p className="text-sm text-gray-400 py-12 text-center">
                  Потрібно мінімум 3 різних тести
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={data.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <PolarRadiusAxis domain={[0, 12]} tick={false} />
                    <Radar dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {data.gradeByTest.map((subj, i) => (
              <motion.div
                key={subj.testId}
                variants={fadeIn}
                custom={i}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <FlaskConical className="size-5 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{subj.testTitle}</h3>
                  </div>
                  <span
                    className={`shrink-0 text-lg font-extrabold rounded-xl px-3 py-1 ${
                      subj.avg >= 10 ? "bg-emerald-100 text-emerald-700" :
                      subj.avg >= 7 ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {subj.avg}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {subj.grades.map((g, j) => (
                    <GradeCell key={j} g={g} />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

// (my-grades effect lives inside component)
