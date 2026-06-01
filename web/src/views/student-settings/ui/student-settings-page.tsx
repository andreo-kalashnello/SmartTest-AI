"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  updateStudentProfile,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

const schema = z.object({
  grade: z.string().min(1, "Вкажіть клас"),
  schoolName: z.string().optional(),
  classCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function StudentSettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.authSession.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      grade: user?.grade ?? "",
      schoolName: user?.schoolName ?? "",
      classCode: user?.classCode ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await dispatch(updateStudentProfile(values));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Налаштування</h1>
        <p className="text-gray-500">
          Клас і код від вчителя. Поки зберігається локально; після міграції БД —
          через API класів.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Школа та клас</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Клас</Label>
              <Input id="grade" placeholder="10-А" {...register("grade")} />
              {errors.grade && (
                <p className="text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">Школа</Label>
              <Input id="schoolName" {...register("schoolName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classCode">Код класу</Label>
              <Input
                id="classCode"
                placeholder="MATH-10A-2026"
                {...register("classCode")}
              />
              <p className="text-xs text-gray-500">
                Вчитель генерує код у розділі «Класи» → учні вводять його тут.
              </p>
            </div>
            <LoadingButton
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              loading={isSubmitting}
            >
              Зберегти
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
