"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Test } from "@/entities/test";
import {
  MaterialFileUpload,
  type ScannedSource,
} from "@/features/upload-test-material";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";
import { Textarea } from "@/shared/ui/textarea";

const manualSchema = z.object({
  title: z.string().min(2, "Мінімум 2 символи"),
});

const aiSchema = z.object({
  title: z.string().min(2, "Мінімум 2 символи"),
  topic: z.string().min(2, "Мінімум 2 символи"),
  count: z.coerce.number().int().min(1).max(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  language: z.enum(["auto", "uk", "en"]),
  sourceText: z.string().max(12000).optional(),
});

type ManualFormValues = z.infer<typeof manualSchema>;
type AiFormValues = z.infer<typeof aiSchema>;

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

function buildSourceTextForAi(
  manual: string | undefined,
  scanned: ScannedSource[],
): string | undefined {
  const parts: string[] = [];
  if (manual?.trim()) parts.push(manual.trim());
  for (const item of scanned) {
    parts.push(`[Скановано: ${item.fileName}]\n${item.text}`);
  }
  if (parts.length === 0) return undefined;
  return parts.join("\n\n---\n\n").slice(0, 12000);
}

export function TestNewPage() {
  const router = useRouter();
  const [manualError, setManualError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [scannedSources, setScannedSources] = useState<ScannedSource[]>([]);

  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { title: "" },
  });

  const aiForm = useForm<AiFormValues>({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      title: "",
      topic: "",
      count: 3,
      difficulty: "easy",
      language: "auto",
      sourceText: "",
    },
  });

  const sourceTextField = aiForm.register("sourceText");

  const appendManualText = (chunk: string) => {
    const current = aiForm.getValues("sourceText") ?? "";
    const separator = current.trim() ? "\n\n---\n\n" : "";
    const next = `${current}${separator}${chunk}`.slice(0, 12000);
    aiForm.setValue("sourceText", next, { shouldDirty: true });
  };

  const scannedCount = scannedSources.length;
  const scannedChars = useMemo(
    () => scannedSources.reduce((n, s) => n + s.charCount, 0),
    [scannedSources],
  );

  const onManualSubmit = manualForm.handleSubmit(async ({ title }) => {
    setManualError(null);
    const response = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, questions: [] }),
    });

    if (!response.ok) {
      setManualError(await readErrorMessage(response, "Не вдалося створити тест"));
      return;
    }

    const body = (await response.json()) as { test: Test };
    router.push(`/dashboard/tests/${body.test.id}/edit`);
  });

  const onAiSubmit = aiForm.handleSubmit(async (values) => {
    setAiError(null);

    const sourceText = buildSourceTextForAi(values.sourceText, scannedSources);
    if (!sourceText && !values.topic.trim()) {
      setAiError("Вкажіть тему або додайте матеріал / відскануйте файл");
      return;
    }

    const response = await fetch("/api/ai/create-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: values.title,
        topic: values.topic,
        count: values.count,
        difficulty: values.difficulty,
        language: values.language,
        sourceText,
      }),
    });

    if (!response.ok) {
      setAiError(await readErrorMessage(response, "Не вдалося створити тест з ШІ"));
      return;
    }

    const body = (await response.json()) as { test: Test };
    router.push(`/dashboard/tests/${body.test.id}/edit`);
  });

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Новий тест</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Назва</Label>
              <Input id="title" {...manualForm.register("title")} />
              {manualForm.formState.errors.title && (
                <p className="text-sm text-red-600" role="alert">
                  {manualForm.formState.errors.title.message}
                </p>
              )}
            </div>
            {manualError && (
              <p className="text-sm text-red-600" role="alert">
                {manualError}
              </p>
            )}
            <LoadingButton
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              loading={manualForm.formState.isSubmitting}
            >
              Далі до редактора
            </LoadingButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Створити з ШІ</CardTitle>
          <p className="text-sm text-gray-500">
            Мова питань і відповідей — як у темі/матеріалі (або оберіть нижче).
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAiSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-title">Назва</Label>
              <Input id="ai-title" {...aiForm.register("title")} />
              {aiForm.formState.errors.title && (
                <p className="text-sm text-red-600" role="alert">
                  {aiForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-topic">Тема</Label>
              <Input id="ai-topic" {...aiForm.register("topic")} />
              {aiForm.formState.errors.topic && (
                <p className="text-sm text-red-600" role="alert">
                  {aiForm.formState.errors.topic.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ai-count">Кількість</Label>
                <Input
                  id="ai-count"
                  type="number"
                  min={1}
                  max={10}
                  {...aiForm.register("count", { valueAsNumber: true })}
                />
                {aiForm.formState.errors.count && (
                  <p className="text-sm text-red-600" role="alert">
                    {aiForm.formState.errors.count.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-difficulty">Складність</Label>
                <select
                  id="ai-difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...aiForm.register("difficulty")}
                >
                  <option value="easy">Легка</option>
                  <option value="medium">Середня</option>
                  <option value="hard">Складна</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-language">Мова тесту</Label>
              <select
                id="ai-language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...aiForm.register("language")}
              >
                <option value="auto">Авто (з теми та матеріалу)</option>
                <option value="uk">Українська</option>
                <option value="en">English</option>
              </select>
            </div>

            <MaterialFileUpload
              scannedSources={scannedSources}
              onScannedSourcesChange={setScannedSources}
              onManualTextAppend={appendManualText}
              disabled={aiForm.formState.isSubmitting}
            />

            {scannedCount > 0 && (
              <p className="text-xs text-emerald-700">
                Готово до генерації: {scannedCount} файл(ів), ~{scannedChars}{" "}
                символів розпізнаного тексту (приховано до відправки).
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="ai-source">Додатковий текст (необовʼязково)</Label>
              <p className="text-xs text-gray-500">
                Власні вимоги або конспект. Фото/PDF скануються окремо — не
                дублюються сюди автоматично.
              </p>
              <Textarea
                id="ai-source"
                rows={4}
                placeholder="Наприклад: обовʼязково питання на дискримінант…"
                name={sourceTextField.name}
                ref={sourceTextField.ref}
                onBlur={sourceTextField.onBlur}
                onChange={sourceTextField.onChange}
              />
              {aiForm.formState.errors.sourceText && (
                <p className="text-sm text-red-600" role="alert">
                  {aiForm.formState.errors.sourceText.message}
                </p>
              )}
            </div>

            {aiError && (
              <p className="text-sm text-red-600" role="alert">
                {aiError}
              </p>
            )}

            <LoadingButton
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              loading={aiForm.formState.isSubmitting}
              loadingText="Створення..."
            >
              Створити з ШІ
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
