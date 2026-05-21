"use client";

import { Plus, Trash2 } from "lucide-react";

import type { Question } from "@/entities/test";
import {
  addOption,
  addQuestion,
  removeOption,
  removeQuestion,
  setCorrectOption,
  setTitle,
  updateOptionText,
  updateQuestionPrompt,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

function QuestionCard({ question, index }: { question: Question; index: number }) {
  const dispatch = useAppDispatch();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-base">Питання {index + 1}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => dispatch(removeQuestion(question.id))}
          aria-label={`Видалити питання ${index + 1}`}
        >
          <Trash2 className="size-4 text-red-500" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`prompt-${question.id}`}>Текст питання</Label>
          <Textarea
            id={`prompt-${question.id}`}
            value={question.prompt}
            onChange={(e) =>
              dispatch(
                updateQuestionPrompt({
                  questionId: question.id,
                  prompt: e.target.value,
                }),
              )
            }
            rows={2}
          />
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            Варіанти (оберіть одну правильну)
          </legend>
          <ul className="space-y-2">
            {question.options.map((opt) => (
              <li key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={opt.isCorrect}
                  onChange={() =>
                    dispatch(
                      setCorrectOption({
                        questionId: question.id,
                        optionId: opt.id,
                      }),
                    )
                  }
                  className="size-4 accent-indigo-600"
                  aria-label={`Правильна відповідь: ${opt.text || "варіант"}`}
                />
                <Input
                  value={opt.text}
                  onChange={(e) =>
                    dispatch(
                      updateOptionText({
                        questionId: question.id,
                        optionId: opt.id,
                        text: e.target.value,
                      }),
                    )
                  }
                  placeholder="Варіант відповіді"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={question.options.length <= 2}
                  onClick={() =>
                    dispatch(
                      removeOption({
                        questionId: question.id,
                        optionId: opt.id,
                      }),
                    )
                  }
                  aria-label="Видалити варіант"
                >
                  <Trash2 className="size-4 text-gray-400" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => dispatch(addOption(question.id))}
          >
            <Plus className="mr-1 size-4" />
            Варіант
          </Button>
        </fieldset>
      </CardContent>
    </Card>
  );
}

export function QuestionEditor() {
  const dispatch = useAppDispatch();
  const { questions, title, pin, status, error } = useAppSelector(
    (s) => s.teacherTestDraft,
  );

  return (
    <div className="space-y-6">
      {pin && (
        <p className="rounded-lg bg-indigo-50 px-4 py-2 text-sm text-indigo-800">
          PIN для учнів: <strong>{pin}</strong> — посилання:{" "}
          <code className="text-xs">/join</code> або{" "}
          <code className="text-xs">/test/{pin}/play</code>
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="test-title">Назва тесту</Label>
        <Input
          id="test-title"
          value={title}
          onChange={(e) => dispatch(setTitle(e.target.value))}
        />
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={q.id} question={q} index={i} />
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => dispatch(addQuestion())}
        className="w-full"
      >
        <Plus className="mr-2 size-4" />
        Додати питання
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <p
        className={cn(
          "text-sm text-gray-500",
          status === "succeeded" && "text-green-600",
        )}
      >
        {status === "saving" && "Збереження..."}
        {status === "succeeded" && "Збережено"}
      </p>
    </div>
  );
}
