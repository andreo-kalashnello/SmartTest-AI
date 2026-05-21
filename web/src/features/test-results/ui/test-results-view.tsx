"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { resetAttempt, useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function TestResultsView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { result, test, phase } = useAppSelector((s) => s.studentAttempt);

  useEffect(() => {
    if (phase !== "done" || !result) {
      router.replace("/join");
    }
  }, [phase, result, router]);

  if (!result || !test) return null;

  const wrong = result.total - result.score;
  const percent = Math.round((result.score / result.total) * 100);

  return (
    <Card className="w-full max-w-md border-gray-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Результат</CardTitle>
        <p className="text-gray-500">{test.title}</p>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-4xl font-bold text-indigo-600">{percent}%</p>
        <p className="text-lg text-gray-700">
          {result.score} з {result.total} правильних
        </p>
        <ul className="flex justify-center gap-6 text-sm text-gray-600">
          <li className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-green-600" aria-hidden />
            {result.score} правильно
          </li>
          <li className="flex items-center gap-1">
            <XCircle className="size-4 text-red-500" aria-hidden />
            {wrong} неправильно
          </li>
        </ul>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              dispatch(resetAttempt());
              router.push("/join");
            }}
          >
            Пройти інший тест
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">На головну</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
