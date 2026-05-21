"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  goNext,
  goPrev,
  selectAnswer,
  submitAttempt,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";
import { LoadingButton } from "@/shared/ui/loading-button";
import { cn } from "@/shared/lib/utils";

interface TestPlayerProps {
  pin: string;
}

export function TestPlayer({ pin }: TestPlayerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { test, currentIndex, answers, phase, error, studentName } =
    useAppSelector((s) => s.studentAttempt);

  useEffect(() => {
    if (phase === "idle" || (test && test.pin !== pin)) {
      router.replace("/join");
    }
  }, [phase, test, pin, router]);

  if (!test || test.questions.length === 0) {
    return (
      <p className="text-center text-gray-500">Завантаження тесту...</p>
    );
  }

  const question = test.questions[currentIndex];
  const total = test.questions.length;
  const selected = answers[question.id];
  const isLast = currentIndex === total - 1;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  const handleFinish = async () => {
    const result = await dispatch(submitAttempt());
    if (submitAttempt.fulfilled.match(result)) {
      router.push(`/test/${pin}/results`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <div className="mb-1 flex justify-between text-sm text-gray-500">
          <span>{studentName}</span>
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
      <p className="text-lg text-gray-800">{question.prompt}</p>

      <fieldset>
        <legend className="sr-only">Варіанти відповіді</legend>
        <ul className="space-y-2" role="radiogroup" aria-label="Відповідь">
          {question.options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected === opt.id}
                onClick={() =>
                  dispatch(
                    selectAnswer({
                      questionId: question.id,
                      optionId: opt.id,
                    }),
                  )
                }
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  selected === opt.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                    : "border-gray-200 bg-white hover:border-indigo-300",
                )}
              >
                {opt.text}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => dispatch(goPrev())}
        >
          Назад
        </Button>
        {!isLast ? (
          <Button
            type="button"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!selected}
            onClick={() => dispatch(goNext())}
          >
            Далі
          </Button>
        ) : (
          <LoadingButton
            type="button"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!selected}
            loading={phase === "submitting"}
            loadingText="Завершення..."
            onClick={handleFinish}
          >
            Завершити
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
