"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, Trophy, GraduationCap, Target, Users, AlertCircle } from "lucide-react";

import { useTeacherAnalytics } from "@/shared/lib/hooks/use-teacher-analytics";

export default function AnalyticsPage() {
  const { data, loading, error } = useTeacherAnalytics();

  const topStats: { Icon: LucideIcon; val: string; label: string; color: string }[] = data
    ? [
        {
          Icon: Trophy,
          val: data.analyticsTop.bestTest ? data.analyticsTop.bestTest.slice(0, 12) : "—",
          label: data.analyticsTop.bestTest ? "Кращий тест" : "Кращий тест: немає даних",
          color: "from-amber-400 to-orange-500",
        },
        {
          Icon: GraduationCap,
          val: data.analyticsTop.bestStudent ?? "—",
          label: "Найкращий учень",
          color: "from-violet-500 to-purple-600",
        },
        {
          Icon: Target,
          val: data.stats.totalAttempts > 0 ? `${data.analyticsTop.successRatePct}%` : "—",
          label: "Успішність (≥50%)",
          color: "from-emerald-500 to-teal-600",
        },
        {
          Icon: Users,
          val: String(data.analyticsTop.activeStudents),
          label: "Активних учнів",
          color: "from-blue-500 to-cyan-600",
        },
      ]
    : [];

  const maxDistCount = Math.max(1, ...(data?.scoreDistribution.map((d) => d.count) ?? [1]));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Аналітика</h1>
        <p className="text-sm text-gray-500">Статистика з тестів, класів та спроб бекенду</p>
      </motion.div>

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topStats.map((card, i) => (
              <motion.div
                key={card.label}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                  <card.Icon className="size-5 text-white" aria-hidden />
                </div>
                <div className="text-xl font-extrabold text-gray-900 truncate">{card.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <motion.div
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-violet-600" />
                Спроби за тиждень
              </h3>
              {data.stats.totalAttempts === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center">Ще немає завершених спроб</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.activityChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Legend />
                    <Line dataKey="tests" name="Спроби" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">Середній бал по тестах</h3>
              {data.testAvgChart.length === 0 ? (
                <p className="text-sm text-gray-400 py-12 text-center">Немає даних по тестах</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.testAvgChart} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" domain={[0, 12]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="avg" name="Сер. бал" fill="url(#barGradient)" radius={[0, 6, 6, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">Радар по тестах</h3>
              {data.testAvgChart.length < 3 ? (
                <p className="text-sm text-gray-400 py-12 text-center">
                  Потрібно мінімум 3 тести зі спробами
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={data.testAvgChart}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <PolarRadiusAxis domain={[0, 12]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickCount={4} />
                    <Radar name="Середній бал" dataKey="avg" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-6">Розподіл результатів</h3>
              {data.stats.totalAttempts === 0 ? (
                <p className="text-sm text-gray-400">Немає даних</p>
              ) : (
                <div className="space-y-4">
                  {data.scoreDistribution.map((item) => (
                    <div key={item.range}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-gray-700">{item.range}</span>
                        <span className="font-bold text-gray-900">{item.count} спроб</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / maxDistCount) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
