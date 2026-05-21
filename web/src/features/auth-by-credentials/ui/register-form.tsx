"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  clearAuthError,
  registerTeacher,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/shared/lib/validation/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((s) => s.authSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerTeacher(values));
    if (registerTeacher.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  });

  return (
    <Card className="w-full max-w-md border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Реєстрація викладача</CardTitle>
        <p className="text-sm text-gray-500">
          Локальне сховище браузера. Потрібен бек для реальної авторизації
          (Auth.js).
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Ім&apos;я</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600" role="alert">
                {errors.password.message}
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
            loading={status === "loading"}
            loadingText="Реєстрація..."
          >
            Зареєструватися
          </LoadingButton>
          <p className="text-center text-sm text-gray-500">
            Вже є акаунт?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Увійти
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
