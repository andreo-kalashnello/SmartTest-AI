"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardPaste,
  FileUp,
  ImageIcon,
  Loader2,
  X,
} from "lucide-react";

import type { ScannedSource, ScannedSourceDraft } from "../model/types";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

interface MaterialFileUploadProps {
  scannedSources: ScannedSource[];
  onScannedSourcesChange: (sources: ScannedSource[]) => void;
  /** Тільки для явного вставлення тексту в поле «Матеріал» */
  onManualTextAppend?: (text: string) => void;
  disabled?: boolean;
}

async function scanFile(file: File): Promise<{ fileName: string; text: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ai/extract-material", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const body = (await response.json()) as {
    message?: string;
    text?: string;
    fileName?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Не вдалося відсканувати файл");
  }

  const text = body.text?.trim() ?? "";
  if (!text) {
    throw new Error("На файлі не знайдено тексту для розпізнавання");
  }

  return { fileName: body.fileName ?? file.name, text };
}

function newId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MaterialFileUpload({
  scannedSources,
  onScannedSourcesChange,
  onManualTextAppend,
  disabled,
}: MaterialFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<ScannedSourceDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const commitReady = (draft: ScannedSourceDraft, text: string) => {
    const ready: ScannedSource = {
      id: draft.id,
      fileName: draft.fileName,
      charCount: text.length,
      text,
    };
    onScannedSourcesChange([...scannedSources, ready]);
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
  };

  const runScan = async (file: File, label?: string) => {
    const draft: ScannedSourceDraft = {
      id: newId(),
      fileName: label ?? file.name,
      status: "scanning",
    };
    setDrafts((prev) => [...prev, draft]);
    setError(null);

    try {
      const result = await scanFile(file);
      commitReady({ ...draft, fileName: result.fileName }, result.text);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Помилка сканування";
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === draft.id ? { ...d, status: "error", error: message } : d,
        ),
      );
    }
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    for (const file of Array.from(list)) {
      await runScan(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePasteImage = async () => {
    if (!navigator.clipboard?.read) {
      setError("Вставка зображення не підтримується. Завантажте файл.");
      return;
    }

    try {
      const items = await navigator.clipboard.read();
      let imageFile: File | null = null;

      for (const item of items) {
        for (const type of item.types) {
          if (!type.startsWith("image/")) continue;
          const blob = await item.getType(type);
          const ext = type.split("/")[1] === "jpeg" ? "jpg" : type.split("/")[1];
          imageFile = new File([blob], `clipboard.${ext}`, { type });
          break;
        }
        if (imageFile) break;
      }

      if (!imageFile) {
        setError("У буфері немає зображення");
        return;
      }

      await runScan(imageFile, "Зображення з буфера");
    } catch {
      setError("Не вдалося прочитати буфер. Дозвольте доступ або завантажте файл.");
    }
  };

  const handlePasteTextToField = async () => {
    if (!onManualTextAppend) return;
    setError(null);
    if (!navigator.clipboard?.readText) {
      setError("Вставте текст у поле нижче (Ctrl+V).");
      return;
    }
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setError("У буфері немає тексту");
        return;
      }
      onManualTextAppend(text);
    } catch {
      setError("Немає доступу до буфера");
    }
  };

  const removeItem = (id: string) => {
    onScannedSourcesChange(scannedSources.filter((s) => s.id !== id));
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    if (previewId === id) setPreviewId(null);
  };

  return (
    <div className="space-y-2">
      <Label>Сканувати фото / PDF</Label>
     
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <FileUp className="mr-2 size-4" />
          Завантажити файл
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => void handlePasteImage()}
        >
          <ImageIcon className="mr-2 size-4" />
          Сканувати з буфера
        </Button>
        {onManualTextAppend && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => void handlePasteTextToField()}
          >
            <ClipboardPaste className="mr-2 size-4" />
            Текст у поле
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <ul className="space-y-1 text-sm">
        {drafts.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1.5"
          >
            <span className="flex items-center gap-2 truncate text-gray-700">
              {d.status === "scanning" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-indigo-600" />
              )}
              {d.status === "error" && (
                <X className="size-4 shrink-0 text-red-500" />
              )}
              {d.fileName}
              {d.status === "scanning" && (
                <span className="text-xs text-gray-500">Сканування…</span>
              )}
              {d.status === "error" && (
                <span className="text-xs text-red-600">{d.error}</span>
              )}
            </span>
            <button
              type="button"
              className="text-gray-400 hover:text-red-500"
              onClick={() => removeItem(d.id)}
              aria-label="Скасувати"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
        {scannedSources.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-1 rounded border border-emerald-100 bg-emerald-50/50 px-2 py-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 truncate text-gray-800">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                {s.fileName}
                <span className="text-xs text-emerald-700">
                  відскановано ({s.charCount} симв.)
                </span>
              </span>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    setPreviewId(previewId === s.id ? null : s.id)
                  }
                >
                  {previewId === s.id ? "Сховати" : "Перегляд"}
                </Button>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-red-500"
                  onClick={() => removeItem(s.id)}
                  aria-label={`Видалити ${s.fileName}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            {previewId === s.id && (
              <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-white p-2 text-xs text-gray-600">
                {s.text}
              </pre>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
