"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ClipboardList, FlaskConical, Mic } from "lucide-react";

import {
  createTeacherGrade,
  fetchSubjectStudents,
  fetchTeacherGrades,
  type GradeStudent,
  type TeacherGradeItem,
} from "@/shared/api/grades";
import { fetchTeacherSubjects, type TeacherSubjectItem } from "@/shared/api/subjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";
import { fadeIn, stagger } from "@/shared/ui/motion";
import { SUBJECT_ICON_MAP, SubjectIcon, type SubjectIconKey } from "@/shared/ui/subject-icon";

type GradeTypeValue = "TEST" | "HOMEWORK" | "ORAL";

const GRADE_TYPE_OPTIONS: { value: GradeTypeValue; label: string }[] = [
  { value: "TEST", label: "Тест" },
  { value: "HOMEWORK", label: "Домашнє завдання" },
  { value: "ORAL", label: "Усна відповідь" },
];

function GradeBadge({ grade }: { grade: number }) {
  const color =
    grade >= 10 ? "bg-emerald-100 text-emerald-700" :
    grade >= 7 ? "bg-blue-100 text-blue-700" :
    grade >= 4 ? "bg-amber-100 text-amber-700" :
    "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex size-10 items-center justify-center rounded-xl text-sm font-extrabold ${color}`}>
      {grade}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveSubjectIcon(icon: string | null): SubjectIconKey {
  if (icon && icon in SUBJECT_ICON_MAP) return icon as SubjectIconKey;
  return "math";
}

const TYPE_LABELS: Record<string, { label: string; Icon: LucideIcon }> = {
  test: { label: "Тест", Icon: FlaskConical },
  TEST: { label: "Тест", Icon: FlaskConical },
  homework: { label: "Домашнє завдання", Icon: ClipboardList },
  HOMEWORK: { label: "Домашнє завдання", Icon: ClipboardList },
  oral: { label: "Усна відповідь", Icon: Mic },
  ORAL: { label: "Усна відповідь", Icon: Mic },
};

export default function GradesPage() {
  const [grades, setGrades] = useState<TeacherGradeItem[]>([]);
  const [subjects, setSubjects] = useState<TeacherSubjectItem[]>([]);
  const [students, setStudents] = useState<GradeStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [value, setValue] = useState("12");
  const [type, setType] = useState<GradeTypeValue>("TEST");
  const [workTitle, setWorkTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [gradesResult, subjectsResult] = await Promise.allSettled([
      fetchTeacherGrades(),
      fetchTeacherSubjects(),
    ]);

    if (gradesResult.status === "fulfilled") {
      setGrades(gradesResult.value.grades);
    } else {
      setError(gradesResult.reason instanceof Error ? gradesResult.reason.message : "Помилка завантаження оцінок");
    }

    if (subjectsResult.status === "fulfilled") {
      setSubjects(subjectsResult.value.subjects);
    } else {
      setError(subjectsResult.reason instanceof Error ? subjectsResult.reason.message : "Помилка завантаження предметів");
    }

    setLoading(false);
  }, []);

  const loadStudents = useCallback(async (targetSubjectId: string) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const body = await fetchSubjectStudents(targetSubjectId);
      setStudents(body.students);
    } catch (e) {
      setStudents([]);
      setStudentsError(e instanceof Error ? e.message : "Помилка завантаження учнів");
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!subjects.length) {
      setSubjectId("");
      setStudents([]);
      setStudentId("");
      return;
    }

    setSubjectId((current) =>
      current && subjects.some((subject) => subject.id === current) ? current : subjects[0]!.id,
    );
  }, [subjects]);

  useEffect(() => {
    if (!subjectId) {
      setStudents([]);
      setStudentId("");
      return;
    }

    void loadStudents(subjectId);
  }, [loadStudents, subjectId]);

  useEffect(() => {
    if (!students.length) {
      setStudentId("");
      return;
    }

    setStudentId((current) =>
      current && students.some((student) => student.id === current) ? current : students[0]!.id,
    );
  }, [students]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subjectId || !studentId || !workTitle.trim()) return;

    setCreating(true);
    setStudentsError(null);
    try {
      const body = await createTeacherGrade({
        studentId,
        subjectId,
        value: Number(value),
        type,
        workTitle: workTitle.trim(),
        date,
      });
      setGrades((previous) => [body.grade, ...previous]);
      setWorkTitle("");
      setValue("12");
    } catch (e) {
      setStudentsError(e instanceof Error ? e.message : "Помилка створення оцінки");
    } finally {
      setCreating(false);
    }
  };

  const currentSubject = subjects.find((subject) => subject.id === subjectId) ?? null;

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Журнал оцінок</h1>
          <p className="text-sm text-gray-500">Оцінки з бекенду через GET/POST /grades</p>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-4" /> Нова оцінка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label htmlFor="grade-subject">Предмет</Label>
              <select
                id="grade-subject"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-student">Учень</Label>
              <select
                id="grade-student"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                disabled={!subjectId || studentsLoading || students.length === 0}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!subjectId ? (
                  <option value="">Спочатку виберіть предмет</option>
                ) : studentsLoading ? (
                  <option value="">Завантаження...</option>
                ) : students.length === 0 ? (
                  <option value="">Немає доступних учнів</option>
                ) : (
                  students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.grade ? `(${student.grade})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-value">Оцінка</Label>
              <Input
                id="grade-value"
                type="number"
                min={1}
                max={12}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-type">Тип роботи</Label>
              <select
                id="grade-type"
                value={type}
                onChange={(event) => setType(event.target.value as GradeTypeValue)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {GRADE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="grade-work">Робота</Label>
              <Input
                id="grade-work"
                value={workTitle}
                onChange={(event) => setWorkTitle(event.target.value)}
                placeholder="Контрольна робота з теми"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-date">Дата</Label>
              <Input
                id="grade-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2 md:self-end">
              <LoadingButton
                type="submit"
                loading={creating}
                loadingText="Збереження..."
                className="w-full bg-violet-600 text-white hover:bg-violet-700"
                disabled={!subjectId || !studentId || !workTitle.trim() || studentsLoading || students.length === 0}
              >
                Додати оцінку
              </LoadingButton>
            </div>
          </form>

          {studentsError && (
            <p className="mt-4 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="size-4" /> {studentsError}
            </p>
          )}

          {currentSubject && (
            <p className="mt-3 text-xs text-gray-400">
              Обраний предмет: {currentSubject.name}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { range: "10–12", label: "Відмінно", color: "bg-emerald-100 text-emerald-700" },
          { range: "7–9", label: "Добре", color: "bg-blue-100 text-blue-700" },
          { range: "4–6", label: "Задовільно", color: "bg-amber-100 text-amber-700" },
          { range: "1–3", label: "Незадовільно", color: "bg-rose-100 text-rose-700" },
        ].map((l) => (
          <span key={l.range} className={`rounded-full px-3 py-1 font-medium ${l.color}`}>
            {l.range} — {l.label}
          </span>
        ))}
      </div>

      <motion.div
        className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Завантаження...</div>
        ) : grades.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Ще немає оцінок — додайте першу через форму вище
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Учень</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Предмет</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Робота</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Тип</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Дата</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Оцінка</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => {
                const typeInfo = TYPE_LABELS[grade.type] ?? TYPE_LABELS[grade.type.toUpperCase()];

                return (
                  <motion.tr
                    key={grade.id}
                    variants={fadeIn}
                    custom={index}
                    className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {initials(grade.student.name)}
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[120px]">
                          {grade.student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
                        <SubjectIcon icon={resolveSubjectIcon(grade.subject.icon)} className="size-3.5" />
                        {grade.subject.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-gray-600 text-xs">
                      {grade.workTitle}
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      {typeInfo && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <typeInfo.Icon className="size-3.5 shrink-0" aria-hidden />
                          {typeInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-400">
                      {formatDate(grade.date)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <GradeBadge grade={grade.value} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
