"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { pin: "", studentName: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(joinTestByPin(values));
    if (joinTestByPin.fulfilled.match(result)) {
      router.push(`/test/${values.pin}/play`);
    }
  });

  return (
    <Card className="w-full max-w-md border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Увійти в тест</CardTitle>
        <p className="text-sm text-gray-500">
          Введіть PIN від викладача та своє ПІБ. Демо PIN:{" "}
          <code className="rounded bg-gray-100 px-1">123456</code>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN тесту (6 цифр)</Label>
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
  );
}
