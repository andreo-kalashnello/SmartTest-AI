"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import type { UserRole } from "@/entities/auth";
import {
  clearAuthError,
  loginUser,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import {
  loginSchema,
  type LoginFormValues,
} from "@/shared/lib/validation/auth";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

type LoginFormProps = {
  role: UserRole;
};

export function LoginForm({ role }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((s) => s.authSession);
  const isStudent = role === "student";

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
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      const actualRole = result.payload?.role ?? "teacher";
      router.push(actualRole === "student" ? "/student" : "/dashboard");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <LoadingButton
        type="submit"
        className={cn(
          "h-11 w-full rounded-xl text-white shadow-lg transition-all",
          isStudent
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25"
            : "gradient-primary hover:opacity-95 shadow-violet-500/25",
        )}
        loading={status === "loading"}
        loadingText="Вхід..."
      >
        Увійти
      </LoadingButton>

      <p className="text-center text-sm text-slate-500">
        Немає акаунту?{" "}
        <Link
          href={`/register?role=${role}`}
          className={cn(
            "font-semibold hover:underline",
            isStudent ? "text-emerald-600" : "text-violet-600",
          )}
        >
          Зареєструватися
        </Link>
      </p>
      <p className="text-center text-xs text-slate-400">
        Без реєстрації:{" "}
        <Link href="/join" className="text-slate-600 underline-offset-2 hover:underline">
          пройти тест за PIN
        </Link>
      </p>
    </form>
  );
}
