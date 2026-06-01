"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { MOCK_SUBJECT_STATS, MOCK_ACTIVITY_CHART, MOCK_SCORE_DISTRIBUTION } from "@/shared/lib/mock-data";
import { TrendingUp, Award, Target, Users } from "lucide-react";

const RADAR_DATA = [
  { subject: "Математика", avg: 8.7, max: 12 },
  { subject: "Фізика", avg: 7.9, max: 12 },
  { subject: "Хімія", avg: 9.1, max: 12 },
  { subject: "Біологія", avg: 8.3, max: 12 },
  { subject: "Історія", avg: 9.4, max: 12 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Аналітика</h1>
        <p className="text-sm text-gray-500">Детальна статистика по класах, предметах та учнях</p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: "🏆", val: "9.4", label: "Кращий предмет: Історія", color: "from-amber-400 to-orange-500" },
          { icon: Award, val: "Олена К.", label: "Найкращий учень", color: "from-violet-500 to-purple-600", isIcon: true },
          { icon: Target, val: "87%", label: "Успішність класу", color: "from-emerald-500 to-teal-600", isIcon: true },
          { icon: Users, val: "155", label: "Активних учнів", color: "from-blue-500 to-cyan-600", isIcon: true },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            {card.isIcon ? (
              <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
                {/* @ts-ignore */}
                <card.icon className="size-5 text-white" />
              </div>
            ) : (
              <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} mb-3 text-xl`}>
                {card.icon}
              </div>
            )}
            <div className="text-xl font-extrabold text-gray-900">{card.val}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity by day */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-violet-600" />
            Активність за тиждень
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_ACTIVITY_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Legend />
              <Line dataKey="tests" name="Тести" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: "#7c3aed" }} />
              <Line dataKey="homework" name="ДЗ" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Avg by subject */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">Середній бал по предметах</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_SUBJECT_STATS} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 12]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={70} />
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
        </motion.div>

        {/* Radar */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">Радар знань класу</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
              <PolarRadiusAxis domain={[0, 12]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickCount={4} />
              <Radar name="Середній бал" dataKey="avg" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribution */}
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-base font-bold text-gray-900 mb-6">Розподіл оцінок</h3>
          <div className="space-y-4">
            {MOCK_SCORE_DISTRIBUTION.map((item) => (
              <div key={item.range}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{item.range} балів</span>
                  <span className="font-bold text-gray-900">{item.count} учнів</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / 115) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
