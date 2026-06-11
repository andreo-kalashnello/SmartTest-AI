"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ClipboardList } from "lucide-react";

import { fetchTeacherHomework, type TeacherHomeworkItem } from "@/shared/api/homework";
import { fadeIn, stagger } from "@/shared/ui/motion";
import { Card, CardContent } from "@/shared/ui/card";
import { SUBJECT_ICON_MAP, SubjectIcon, type SubjectIconKey } from "@/shared/ui/subject-icon";

function resolveSubjectIcon(icon: string | null): SubjectIconKey {
  if (icon && icon in SUBJECT_ICON_MAP) return icon as SubjectIconKey;
  return "math";
}

function formatDate(iso: string | null) {
  if (!iso) return "Без дедлайну";
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeworkPage() {
  const [homework, setHomework] = useState<TeacherHomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomework = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await fetchTeacherHomework();
      setHomework(body.homework);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomework();
  }, [loadHomework]);

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
        <div className="mt-2 sm:mt-0">
          <Link
            href="/dashboard/homework/new"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Нове завдання
          </Link>
        </div>
      </motion.div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <ClipboardList className="mx-auto mb-3 size-12 opacity-30" />
          <p className="font-medium text-gray-600">Завантаження...</p>
        </div>
      ) : homework.length === 0 ? (
        <motion.div
          className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ClipboardList className="mx-auto mb-3 size-12 opacity-30" />
          <p className="font-medium text-gray-600">Завдань поки немає</p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            Створюйте домашні завдання в бекенді, а тут вони підтягнуться через{" "}
            <code className="text-xs bg-amber-100 px-1 rounded">GET /homework</code>.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {homework.map((item, index) => (
            <motion.div key={item.id} variants={fadeIn} custom={index}>
              <Card className="overflow-hidden border-gray-100 shadow-sm">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardContent className="p-5 pt-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                      <SubjectIcon icon={resolveSubjectIcon(item.subject.icon)} className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-gray-900 truncate">{item.title}</h2>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          {item.subject.name}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-3">
                        {item.description ?? "Без опису"}
                      </p>
                    </div>
                  </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Дедлайн: {formatDate(item.dueAt)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Здань: {item.submissionCount}
                    </span>
                    {item.attachment && (
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Файл: {item.attachment.fileName}
                      </span>
                    )}
                  </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Оновлено {formatDate(item.updatedAt)}</p>
                        <Link href={`/dashboard/homework/${item.id}/submissions`} className="text-sm text-indigo-600 hover:underline">
                          Подання ({item.submissionCount})
                        </Link>
                      </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
