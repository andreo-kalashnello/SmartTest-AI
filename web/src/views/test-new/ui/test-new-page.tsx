"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { localDb } from "@/shared/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

const schema = z.object({
  title: z.string().min(2, "Мінімум 2 символи"),
});

type FormValues = z.infer<typeof schema>;

export function TestNewPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  const onSubmit = handleSubmit(async ({ title }) => {
    const test = localDb.tests.create(title);
    router.push(`/dashboard/tests/${test.id}/edit`);
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Новий тест</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Назва</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-600" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>
          <LoadingButton
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            loading={isSubmitting}
          >
            Далі до редактора
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}
