"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  joinTestByPin,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { joinSchema, type JoinFormValues } from "@/shared/lib/validation/join";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

export function JoinForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { phase, error } = useAppSelector((s) => s.studentAttempt);
  const authUser = useAppSelector((s) => s.authSession.user);
  const isLoggedInStudent = authUser?.role === "student";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { pin: "", studentName: "" },
  });

  useEffect(() => {
    if (isLoggedInStudent && authUser.name) {
      setValue("studentName", authUser.name);
    }
  }, [isLoggedInStudent, authUser?.name, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(joinTestByPin(values));
    if (joinTestByPin.fulfilled.match(result)) {
      router.push(`/test/${values.pin}/play`);
    }
  });

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
        <p className="font-medium">Два способи пройти тест</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-indigo-800/90">
          <li>
            <strong>Гість</strong> — PIN + ПІБ, без реєстрації (нижче).
          </li>
          <li>
            <strong>Зареєстрований учень</strong> —{" "}
            <Link href="/register" className="underline">
              реєстрація
            </Link>{" "}
            або{" "}
            <Link href="/login" className="underline">
              вхід
            </Link>
            , кабінет зі статистикою на{" "}
            <Link href="/student" className="underline">
              /student
            </Link>
            .
          </li>
        </ul>
      </div>

      {isLoggedInStudent && (
        <p className="text-sm text-emerald-700">
          Ви увійшли як <strong>{authUser.name}</strong>
          {authUser.grade ? ` (${authUser.grade})` : ""}. ПІБ підставлено
          автоматично; спроба збережеться під вашим імʼям.
        </p>
      )}

      <Card className="w-full border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Увійти в тест</CardTitle>
          <p className="text-sm text-gray-500">
            PIN від викладача (6 цифр). Демо:{" "}
            <code className="rounded bg-gray-100 px-1">123456</code>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN тесту</Label>
              <Input
                id="pin"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoComplete="off"
                aria-invalid={!!errors.pin}
                {...register("pin")}
              />
              {errors.pin && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.pin.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentName">ПІБ</Label>
              <Input
                id="studentName"
                autoComplete="name"
                placeholder="Іваненко Іван"
                aria-invalid={!!errors.studentName}
                readOnly={isLoggedInStudent}
                className={isLoggedInStudent ? "bg-gray-50" : undefined}
                {...register("studentName")}
              />
              {errors.studentName && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.studentName.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <LoadingButton
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              loading={phase === "joining"}
              loadingText="Перевірка PIN..."
            >
              Почати тест
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
