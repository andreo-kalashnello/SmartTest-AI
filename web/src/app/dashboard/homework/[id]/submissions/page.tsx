"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchHomeworkSubmissions, type HomeworkSubmissionItem } from "@/shared/api/homework";
import { createTeacherGrade, fetchTeacherGrades } from "@/shared/api/grades";
import { LoadingButton } from "@/shared/ui/loading-button";
import { publicConfig } from "@/shared/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function SubmissionsPage() {
  const params = useParams() as { id?: string };
  const homeworkId = params?.id;
  const [submissions, setSubmissions] = useState<HomeworkSubmissionItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherGradesMap, setTeacherGradesMap] = useState<Record<string, number>>({});
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!homeworkId) return;
      setLoading(true);
      try {
        const [subsResult, gradesResult] = await Promise.allSettled([
          fetchHomeworkSubmissions(homeworkId),
          fetchTeacherGrades(),
        ]);

        if (subsResult.status === 'fulfilled') {
          if (!mounted) return;
          setSubmissions(subsResult.value.submissions);
        } else {
          throw subsResult.reason;
        }

        if (gradesResult.status === 'fulfilled') {
          // build quick lookup by studentId + workTitle
          const map: Record<string, number> = {};
          for (const g of gradesResult.value.grades) {
            const key = `${g.student.id}__${g.workTitle}`;
            map[key] = g.value;
          }
          setTeacherGradesMap(map);
        } else {
          // non-fatal: just log
          console.warn('Failed to load teacher grades', gradesResult.reason);
        }
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
  }, [homeworkId]);

  async function handleGrade(submissionId: string, studentId: string, subjectId: string, homeworkTitle: string) {
    setGradingLoading((prev) => ({ ...prev, [submissionId]: true }));
    setError(null);
    try {
      const value = Number(gradeInputs[submissionId] ?? '12');
      const body = await createTeacherGrade({
        studentId,
        subjectId,
        value,
        type: 'HOMEWORK',
        workTitle: homeworkTitle,
      });
      const key = `${studentId}__${homeworkTitle}`;
      setTeacherGradesMap((prev) => ({ ...prev, [key]: body.grade.value }));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGradingLoading((prev) => ({ ...prev, [submissionId]: false }));
    }
  }

  if (!homeworkId) return <p className="text-sm text-red-600">Невідоме завдання</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Подання для завдання</h1>
          <p className="text-sm text-gray-500">Перегляньте всі відправки учнів</p>
        </div>
        <div>
          <Link href="/dashboard/homework" className="text-sm text-gray-600 hover:underline">
            Назад
          </Link>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Завантаження...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4">
        {submissions && submissions.length === 0 && (
          <p className="text-sm text-gray-500">Поки немає відправлень</p>
        )}

        {submissions?.map((s) => {
          const key = `${s.student.id}__${s.homeworkTitle}`;
          const existingGrade = teacherGradesMap[key] ?? null;
          return (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>{s.student.name ?? s.student.email}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Відправлено: {new Date(s.submittedAt).toLocaleString()}</p>
                {s.content && <p className="mt-2 whitespace-pre-wrap">{s.content}</p>}
                {s.attachment && (
                  <p className="mt-3">
                    <a
                      className="text-emerald-600 hover:underline"
                      href={`${publicConfig.apiBaseUrl}/homework/${s.homeworkId}/submissions/${s.id}/attachment`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Завантажити вкладення
                    </a>
                  </p>
                )}

                <div className="mt-4 border-t pt-3">
                  {existingGrade !== null ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-emerald-700">Оцінено: {existingGrade}</div>
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:underline"
                        onClick={() => setGradeInputs((prev) => ({ ...prev, [s.id]: String(existingGrade) }))}
                      >
                        Змінити
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleGrade(s.id, s.student.id, s.subjectId, s.homeworkTitle);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={gradeInputs[s.id] ?? '12'}
                          onChange={(e) => setGradeInputs((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-20 rounded-md border p-2"
                        />
                        <LoadingButton loading={!!gradingLoading[s.id]} type="submit" className="bg-indigo-600 text-white">
                          Оцінити
                        </LoadingButton>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
