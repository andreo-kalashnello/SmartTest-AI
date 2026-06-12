"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchStudentHomework, submitHomework, type StudentHomeworkItem, type HomeworkSubmissionItem } from "@/shared/api/homework";
import { publicConfig } from "@/shared/config";

export default function StudentHomeworkPage() {
  const [items, setItems] = useState<StudentHomeworkItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const body = await fetchStudentHomework();
        if (!mounted) return;
        setItems(body.homework);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
          <p className="text-sm text-gray-500">Ваші поточні та минулі завдання</p>
        </motion.div>

        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <ClipboardList className="mx-auto mb-3 size-12 opacity-30" />
          <p className="font-medium text-gray-600">Завантаження...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
          <p className="text-sm text-gray-500">Ваші поточні та минулі завдання</p>
        </motion.div>

        <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );

  if (!items || items.length === 0)
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
          <p className="text-sm text-gray-500">Ваші поточні та минулі завдання</p>
        </motion.div>

        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <ClipboardList className="mx-auto mb-3 size-12 opacity-30" />
          <p className="font-medium text-gray-600">Завдань поки немає</p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            Поки що пройдіть тести або зачекайте на завдання від вчителя.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900">Домашні завдання</h1>
        <p className="text-sm text-gray-500">Ваші поточні та минулі завдання</p>
      </motion.div>

      <div className="grid gap-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">{it.subject.name}</div>
                <div className="font-semibold">{it.title}</div>
                {it.description && <p className="text-sm text-gray-600 mt-2">{it.description}</p>}
                {it.dueAt && (
                  <div className="text-xs text-gray-500 mt-2">Дедлайн: {new Date(it.dueAt).toLocaleString()}</div>
                )}
                {it.attachment && (
                  <a
                    className="text-sm text-emerald-600 hover:underline"
                    href={`${publicConfig.apiBaseUrl}/homework/${it.id}/attachment`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Завдання — завантажити файл
                  </a>
                )}
              </div>

              <div className="text-right">
                {it.submission ? (
                  <div className="text-sm text-emerald-700">
                    Відправлено: {new Date(it.submission.submittedAt).toLocaleString()}
                    {it.submission.attachment && (
                      <div>
                        <a
                          className="text-sm text-emerald-600 hover:underline"
                          href={`${publicConfig.apiBaseUrl}/homework/${it.id}/submissions/${it.submission.id}/attachment`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Завантажити вкладення
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <button
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      onClick={() => setOpenFor(openFor === it.id ? null : it.id)}
                    >
                      Відправити
                    </button>
                  </div>
                )}
              </div>
            </div>

            {openFor === it.id && !it.submission && (
              <SubmissionForm
                homeworkId={it.id}
                onDone={(submission) => {
                  setItems((cur) => cur?.map((x) => (x.id === it.id ? { ...x, submission } : x)) ?? null);
                  setOpenFor(null);
                }}
                onStart={(id) => setSubmittingFor(id)}
                onFinish={() => setSubmittingFor(null)}
                submitting={submittingFor === it.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionForm({
  homeworkId,
  onDone,
  onStart,
  onFinish,
  submitting,
}: {
  homeworkId: string;
  onDone: (submission: HomeworkSubmissionItem) => void;
  onStart: (id: string) => void;
  onFinish: () => void;
  submitting: boolean;
}) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    onStart(homeworkId);
    try {
      const body = await submitHomework(homeworkId, { content: content || undefined, file: file ?? undefined });
      onDone(body.submission);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      onFinish();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-sm">Коментар</label>
        <textarea className="mt-1 block w-full rounded-md border p-2" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
      </div>

      <div>
        <label className="text-sm">Файл (опціонально)</label>
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
              <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => setFile(null)}>
                Видалити
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white" disabled={submitting}>
          {submitting ? "Відправка..." : "Відправити"}
        </button>
        <Link href="/student/homework" className="text-sm text-gray-600 hover:underline">
          Скасувати
        </Link>
      </div>
    </form>
  );
}
