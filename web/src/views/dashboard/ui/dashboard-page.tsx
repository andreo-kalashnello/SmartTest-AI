"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Plus, TrendingUp, Users, FileText, Target, ArrowRight, Clock,
  Bot, BookOpen, ClipboardList, BarChart3, LineChart, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTeacherAnalytics } from "@/shared/lib/hooks/use-teacher-analytics";
import { fadeIn, stagger } from "@/shared/ui/motion";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 10 ? "text-emerald-600 bg-emerald-50" :
    score >= 7 ? "text-blue-600 bg-blue-50" :
    "text-rose-600 bg-rose-50";
  return <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${color}`}>{score}/12</span>;
}

export function DashboardPage() {
  const { data, loading, error } = useTeacherAnalytics();

  const statCards = data
    ? [
        {
          label: "Всього тестів",
          value: data.stats.totalTests,
          sub: data.stats.testsThisWeek > 0 ? `+${data.stats.testsThisWeek} цього тижня` : "немає нових цього тижня",
          icon: FileText,
          gradient: "from-violet-500 to-purple-600",
        },
        {
          label: "Учнів",
          value: data.stats.totalStudents,
          sub: "у ваших класах",
          icon: Users,
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          label: "Спроб",
          value: data.stats.totalAttempts,
          sub: data.stats.attemptsThisWeek > 0 ? `+${data.stats.attemptsThisWeek} цього тижня` : "немає нових цього тижня",
          icon: Target,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          label: "Середній бал",
          value: data.stats.avgScorePct > 0 ? `${data.stats.avgScorePct}%` : "—",
          sub: "по завершених спробах",
          icon: TrendingUp,
          gradient: "from-amber-500 to-orange-500",
        },
      ]
    : [];

  const maxDistCount = Math.max(1, ...(data?.scoreDistribution.map((d) => d.count) ?? [1]));

  return (
    <div className="space-y-8">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Огляд</h1>
          <p className="text-sm text-gray-500">Вітаємо! Ось що відбувається у вашому кабінеті.</p>
        </div>
        <Link
          href="/dashboard/tests/new"
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
        >
          <Plus className="size-4" />
          Новий тест
        </Link>
      </motion.div>

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {data && (
        <>
          <motion.div
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                variants={fadeIn}
                custom={i}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 card-hover"
              >
                <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} mb-3`}>
                  <card.icon className="size-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{card.value}</div>
                <div className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div
              className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">Спроби за тиждень</h3>
              {data.stats.totalAttempts === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">Ще немає завершених спроб</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.activityChart} barSize={14} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      cursor={{ fill: "#f1f5f9" }}
                    />
                    <Bar dataKey="tests" name="Спроби" fill="#7c3aed" radius={[4, 4, 0, 0]} />
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
              <h3 className="text-base font-bold text-gray-900 mb-4">Розподіл результатів</h3>
              {data.stats.totalAttempts === 0 ? (
                <p className="text-sm text-gray-400">Немає даних</p>
              ) : (
                <div className="space-y-3">
                  {data.scoreDistribution.map((item) => (
                    <div key={item.range}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{item.range}</span>
                        <span>{item.count} спроб</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / maxDistCount) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div
              className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Остання активність</h3>
                <Link href="/dashboard/tests" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                  Всі <ArrowRight className="size-3" />
                </Link>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Ще немає спроб. Поділіться PIN тесту з учнями на{" "}
                  <Link href="/join" className="text-violet-600 hover:underline">/join</Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentActivity.map((a, i) => (
                    <motion.div
                      key={a.id}
                      className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                    >
                      <div className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold shrink-0">
                        {a.student.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.student}</p>
                        <p className="text-xs text-gray-400 truncate">{a.action}: {a.test}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <ScoreBadge score={a.score} />
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="size-3" />{a.time}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">Швидкі дії</h3>
              <div className="space-y-2">
                {([
                  { label: "Новий тест з AI", href: "/dashboard/tests/new", Icon: Bot, color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
                  { label: "Мої тести", href: "/dashboard/tests", Icon: BookOpen, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                  { label: "Класи", href: "/dashboard/classes", Icon: ClipboardList, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                  { label: "Журнал оцінок", href: "/dashboard/grades", Icon: BarChart3, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                  { label: "Аналітика", href: "/dashboard/analytics", Icon: LineChart, color: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
                ] as { label: string; href: string; Icon: LucideIcon; color: string }[]).map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${action.color}`}
                  >
                    <action.Icon className="size-5 shrink-0" aria-hidden />
                    {action.label}
                    <ArrowRight className="size-3.5 ml-auto opacity-50" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
