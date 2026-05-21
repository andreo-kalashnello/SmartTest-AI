"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  clearAuthError,
  loginTeacher,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import {
  loginSchema,
  type LoginFormValues,
} from "@/shared/lib/validation/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((s) => s.authSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginTeacher(values));
    if (loginTeacher.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  });

  return (
    <Card className="w-full max-w-md border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Вхід для викладача</CardTitle>
        <p className="text-sm text-gray-500">
          Демо без бекенду: дані зберігаються в браузері (localStorage).
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
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
              autoComplete="current-password"
              aria-invalid={!!errors.password}
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
            loadingText="Вхід..."
          >
            Увійти
          </LoadingButton>
          <p className="text-center text-sm text-gray-500">
            Немає акаунту?{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              Зареєструватися
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
