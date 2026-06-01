"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, School, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import type { UserRole } from "@/entities/auth";
import {
  clearAuthError,
  registerUser,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/shared/lib/validation/auth";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

type RegisterFormProps = {
  role: UserRole;
};

export function RegisterForm({ role }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((s) => s.authSession);
  const isStudent = role === "student";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "teacher",
      name: "",
      email: "",
      password: "",
      grade: "",
      classCode: "",
      schoolName: "",
    },
  });

  useEffect(() => {
    setValue("role", role);
  }, [role, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerUser({ ...values, role }));
    if (registerUser.fulfilled.match(result)) {
      router.push(role === "student" ? "/student" : "/dashboard");
    }
  });

  const fieldClass =
    "h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:bg-white";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" {...register("role")} />

      <div className="space-y-2">
        <Label htmlFor="name">Ім&apos;я</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input id="name" autoComplete="name" className={fieldClass} {...register("name")} />
        </div>
        {errors.name && (
          <p className="text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
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
            autoComplete="new-password"
            className={fieldClass}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isStudent && (
          <motion.div
            key="student-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="grade">Клас</Label>
              <Input
                id="grade"
                placeholder="10-А"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                {...register("grade")}
              />
              {errors.grade && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.grade.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">Школа (необов&apos;язково)</Label>
              <div className="relative">
                <School className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="schoolName"
                  placeholder="Ліцей №12"
                  className={fieldClass}
                  {...register("schoolName")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classCode">Код класу (необов&apos;язково)</Label>
              <Input
                id="classCode"
                placeholder="CLS-MATH-10A"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-mono text-sm"
                {...register("classCode")}
              />
              <p className="text-xs text-slate-500">
                Код видає викладач у розділі «Класи».
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          "h-11 w-full rounded-xl text-white shadow-lg",
          isStudent
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25"
            : "gradient-primary hover:opacity-95 shadow-violet-500/25",
        )}
        loading={status === "loading"}
        loadingText="Реєстрація..."
      >
        Зареєструватися
      </LoadingButton>

      <p className="text-center text-sm text-slate-500">
        Вже є акаунт?{" "}
        <Link
          href={`/login?role=${role}`}
          className={cn(
            "font-semibold hover:underline",
            isStudent ? "text-emerald-600" : "text-violet-600",
          )}
        >
          Увійти
        </Link>
      </p>
    </form>
  );
}
