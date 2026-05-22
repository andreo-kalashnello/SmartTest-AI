"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCopy, Pencil, Users } from "lucide-react";

import type { Test } from "@/entities/test";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function TeacherTestList() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    let alive = true;

    async function loadTests() {
      const response = await fetch("/api/tests", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (alive) setTests([]);
        return;
      }

      const body = (await response.json()) as { tests: Test[] };
      if (alive) setTests(body.tests);
    }

    void loadTests();

    return () => {
      alive = false;
    };
  }, []);

  const copyPin = async (pin: string) => {
    try {
      await navigator.clipboard.writeText(pin);
    } catch {
      /* ignore */
    }
  };

  if (tests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-gray-500">
          Ще немає тестів. Створіть перший.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {tests.map((test) => (
        <li key={test.id}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{test.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">PIN: {test.pin}</Badge>
                <span className="text-xs text-gray-500">
                  {test.questions.length} питань
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyPin(test.pin)}
                aria-label={`Скопіювати PIN ${test.pin}`}
              >
                <ClipboardCopy className="mr-1 size-4" />
                PIN
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tests/${test.id}/edit`}>
                  <Pencil className="mr-1 size-4" />
                  Редагувати
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tests/${test.id}/attempts`}>
                  <Users className="mr-1 size-4" />
                  Спроби
                </Link>
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
