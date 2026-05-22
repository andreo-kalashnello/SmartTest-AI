"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { Test, TestAttempt } from "@/entities/test";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function TestAttemptsPage() {
  const params = useParams<{ id: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    let alive = true;

    async function loadAttempts() {
      const response = await fetch(`/api/tests/${id}/attempts`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (alive) {
          setTest(null);
          setAttempts([]);
        }
        return;
      }

      const body = (await response.json()) as {
        test: Test;
        attempts: TestAttempt[];
      };

      if (alive) {
        setTest(body.test);
        setAttempts(body.attempts);
      }
    }

    void loadAttempts();

    return () => {
      alive = false;
    };
  }, [params.id]);

  if (!test) {
    return <p className="text-gray-500">Тест не знайдено</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/tests/${test.id}/edit`}>
          <ArrowLeft className="mr-1 size-4" />
          До редактора
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Спроби: {test.title}</CardTitle>
          <p className="text-sm text-gray-500">
            PIN {test.pin}. Потрібен бек для live-оновлення списку.
          </p>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-gray-500">Ще немає завершених спроб.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-2 pr-4 font-medium">ПІБ</th>
                    <th className="py-2 pr-4 font-medium">Бал</th>
                    <th className="py-2 font-medium">Час</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4">{a.studentName}</td>
                      <td className="py-3 pr-4">
                        {a.score} / {a.total}
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(a.completedAt).toLocaleString("uk-UA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
