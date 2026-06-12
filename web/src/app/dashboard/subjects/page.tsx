"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, Plus } from "lucide-react";

import {
  createTeacherSubject,
  fetchTeacherSubjects,
  type TeacherSubjectItem,
} from "@/shared/api/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";
import { fadeIn, stagger } from "@/shared/ui/motion";
import { SUBJECT_ICON_MAP, SubjectIcon, type SubjectIconKey } from "@/shared/ui/subject-icon";

const ICON_OPTIONS: { value: SubjectIconKey; label: string }[] = [
  { value: "math", label: "Математика" },
  { value: "physics", label: "Фізика" },
  { value: "chemistry", label: "Хімія" },
  { value: "biology", label: "Біологія" },
  { value: "history", label: "Історія" },
  { value: "geography", label: "Географія" },
];

function resolveSubjectIcon(icon: string | null): SubjectIconKey {
  if (icon && icon in SUBJECT_ICON_MAP) return icon as SubjectIconKey;
  return "math";
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<TeacherSubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<SubjectIconKey>("math");

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await fetchTeacherSubjects();
      setSubjects(body.subjects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setCreateError(null);
    try {
      const body = await createTeacherSubject({ name: name.trim(), icon });
      setSubjects((previous) => [body.subject, ...previous]);
      setName("");
      setIcon("math");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Помилка створення");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Предмети</h1>
          <p className="text-sm text-gray-500">Список предметів та створення через API /subjects</p>
        </div>
        <Link
          href="/dashboard/tests/new"
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all"
        >
          <Plus className="size-4" />
          Новий тест
        </Link>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4" /> Новий предмет
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={handleCreate}>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="subject-name">Назва</Label>
              <Input
                id="subject-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Математика"
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="subject-icon">Іконка</Label>
              <select
                id="subject-icon"
                value={icon}
                onChange={(event) => setIcon(event.target.value as SubjectIconKey)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-1 md:self-end">
              <LoadingButton
                type="submit"
                loading={creating}
                loadingText="Створення..."
                className="w-full bg-violet-600 text-white hover:bg-violet-700"
              >
                Створити
              </LoadingButton>
            </div>
          </form>

          {createError && (
            <p className="mt-4 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="size-4" /> {createError}
            </p>
          )}
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-gray-400">Завантаження...</p>}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {!loading && subjects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <BookOpen className="mx-auto mb-3 size-10 opacity-40" />
          <p className="font-medium text-gray-600">Ще немає предметів</p>
          <p className="text-sm mt-1">
            Додайте перший предмет у формі вище, щоб потім привʼязувати до нього домашні завдання
            та оцінки.
          </p>
        </div>
      )}

      {!loading && subjects.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.id}
              variants={fadeIn}
              custom={i}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 card-hover"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600" />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                    <SubjectIcon icon={resolveSubjectIcon(subject.icon)} className="size-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate">{subject.name}</h3>
                    <p className="text-xs text-gray-400">Оновлено {new Date(subject.updatedAt).toLocaleDateString("uk-UA")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { val: subject.studentCount, label: "учнів" },
                    { val: subject.homeworkCount, label: "ДЗ" },
                    { val: subject.testCount, label: "тестів" },
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
        </motion.div>
      )}
    </div>
  );
}
