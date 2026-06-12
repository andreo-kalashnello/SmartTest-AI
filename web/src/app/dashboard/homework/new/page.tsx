"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTeacherSubjects, type TeacherSubjectItem } from "@/shared/api/subjects";
import { apiFetch } from "@/shared/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { LoadingButton } from "@/shared/ui/loading-button";
import Link from "next/link";
import type { TeacherHomeworkItem } from "@/shared/api/homework";

export default function HomeworkNewPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<TeacherSubjectItem[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingSubjects(true);
      try {
        const body = await fetchTeacherSubjects();
        if (!mounted) return;
        setSubjects(body.subjects);
        if (body.subjects.length) setSubjectId(body.subjects[0].id);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingSubjects(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !subjectId) {
      setError("Вкажіть предмет та назву");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        subjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      };
      const body = await apiFetch<{ homework: TeacherHomeworkItem }>("/homework", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const hw = body.homework;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        // upload attachment
        await apiFetch(`/homework/${hw.id}/attachment`, {
          method: "POST",
          body: form,
        });
      }

      router.push("/dashboard/homework");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Нове домашнє завдання</h1>
          <p className="text-sm text-gray-500">Створіть завдання для одного з предметів</p>
        </div>
        <div>
          <Link
            href="/dashboard/homework"
            className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            Назад
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Параметри завдання</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="subject">Предмет</Label>
                <select
                  id="subject"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={loadingSubjects}
                >
                  <option value="">Виберіть предмет</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="due">Дедлайн</Label>
                <Input id="due" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Назва</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="desc">Опис (необ&apos;язково)</Label>
              <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="file">Прикріпити файл (опціонально)</Label>
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const f = e.dataTransfer?.files?.[0] ?? null;
                  if (f) setFile(f);
                }}
                className={`mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-md border-2 px-3 py-3 text-sm transition-colors ${
                  isDragging ? "border-indigo-400 bg-indigo-50" : "border-dashed border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Перетягніть файл сюди або клікніть, щоб вибрати</div>
                </div>
                <div className="text-xs text-gray-400">PDF, DOC, JPG, PNG</div>
              </div>

              <input
                ref={inputRef}
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              {file && (
                <div className="mt-2 flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="truncate text-sm">
                    {file.name} <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => setFile(null)}
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <LoadingButton type="submit" loading={submitting} className="bg-indigo-600 text-white">
                Створити
              </LoadingButton>
              <Link href="/dashboard/homework" className="text-sm text-gray-600 hover:underline">
                Скасувати
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
