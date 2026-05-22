"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  initFromTest,
  loadTestDraft,
  resetDraft,
  saveTestDraft,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { QuestionEditor } from "@/widgets/question-editor";
import { Button } from "@/shared/ui/button";
import { LoadingButton } from "@/shared/ui/loading-button";

export function TestEditPage() {
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { status, testId } = useAppSelector((s) => s.teacherTestDraft);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    void dispatch(loadTestDraft(id));
    return () => {
      dispatch(resetDraft());
    };
  }, [params.id, dispatch]);

  const handleSave = () => {
    void dispatch(saveTestDraft());
  };

  if (status === "loading" && !testId) {
    return <p className="text-gray-500">Завантаження...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 size-4" />
            Назад
          </Link>
        </Button>
        <LoadingButton
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          loading={status === "saving"}
          loadingText="Збереження..."
        >
          Зберегти
        </LoadingButton>
        {params.id && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/tests/${params.id}/attempts`}>
              Спроби учнів
            </Link>
          </Button>
        )}
      </div>
      <QuestionEditor />
    </div>
  );
}
