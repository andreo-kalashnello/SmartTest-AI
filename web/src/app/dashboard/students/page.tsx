"use client";

import { motion } from "framer-motion";
import { Search, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import { MOCK_STUDENTS } from "@/shared/lib/mock-data";
import { useState } from "react";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Учні</h1>
          <p className="text-sm text-gray-500">{MOCK_STUDENTS.length} учнів у ваших класах</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
          <UserPlus className="size-4" />
          Додати учня
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук за ім'ям або класом..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Учень</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Клас</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Тести</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">ДЗ</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Сер. бал</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Тренд</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, i) => {
              const pct = student.avgScore;
              const color = pct >= 90 ? "text-emerald-600 bg-emerald-50" : pct >= 75 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50";
              const trend = pct >= 80;
              return (
                <motion.tr
                  key={student.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-xs font-bold">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{student.grade}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden md:table-cell text-gray-600">{student.tests}</td>
                  <td className="px-4 py-3.5 text-center hidden md:table-cell text-gray-600">{student.homework}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{student.avgScore}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                    {trend
                      ? <TrendingUp className="size-4 text-emerald-500 mx-auto" />
                      : <TrendingDown className="size-4 text-rose-500 mx-auto" />
                    }
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">Нічого не знайдено</div>
        )}
      </motion.div>
    </div>
  );
}
