"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Hash, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import type { UserRole } from "@/entities/auth";
import { AuthModeTabs } from "./auth-mode-tabs";
import { AuthRoleTabs } from "./auth-role-tabs";

function parseRole(value: string | null): UserRole {
  return value === "student" ? "student" : "teacher";
}

type AuthPageShellProps = {
  mode: "login" | "register";
  children: (props: { role: UserRole }) => ReactNode;
};

export function AuthPageShell({ mode, children }: AuthPageShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(() =>
    parseRole(searchParams.get("role")),
  );

  useEffect(() => {
    setRole(parseRole(searchParams.get("role")));
  }, [searchParams]);

  const onRoleChange = useCallback(
    (next: UserRole) => {
      setRole(next);
      const path = mode === "login" ? "/login" : "/register";
      router.replace(`${path}?role=${next}`, { scroll: false });
    },
    [mode, router],
  );

  const isStudent = role === "student";
  const title =
    mode === "login"
      ? isStudent
        ? "Вхід для учня"
        : "Вхід для викладача"
      : isStudent
        ? "Реєстрація учня"
        : "Реєстрація викладача";

  const subtitle =
    mode === "login"
      ? isStudent
        ? "Після входу — кабінет з оцінками, ДЗ і історією тестів."
        : "Створюйте тести з ШІ, дивіться спроби та аналітику класу."
      : isStudent
        ? "Клас і код від вчителя можна додати зараз або пізніше."
        : "Безкоштовний старт: тести, PIN для учнів, журнал спроб.";

  return (
    <div className="relative min-h-dvh overflow-hidden gradient-landing">
      <div
        className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-violet-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-purple-300/15 blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 border-b border-white/40 bg-white/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900">
            <span className="flex size-9 items-center justify-center rounded-xl gradient-primary shadow-md">
              <Brain className="size-5 text-white" />
            </span>
            SmartTest AI
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-violet-700 shadow-sm transition hover:bg-white"
          >
            <Hash className="size-4" />
            <span className="hidden sm:inline">Тест за PIN</span>
            <span className="sm:hidden">PIN</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr,min(440px,100%)] lg:items-center lg:py-16">
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-100">
            <Sparkles className="size-3.5 text-violet-200" />
            Освітня платформа з ШІ
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            {isStudent ? (
              <>
                Навчайся з{" "}
                <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  розумною
                </span>{" "}
                підтримкою
              </>
            ) : (
              <>
                Тести за{" "}
                <span className="bg-gradient-to-r from-violet-200 via-fuchsia-200 to-indigo-200 bg-clip-text text-transparent">
                  хвилини
                </span>
                , не години
              </>
            )}
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-violet-100/90">
            {isStudent
              ? "Зареєстрований учень бачить оцінки та завдання. Або пройдіть тест без акаунта — лише PIN від вчителя."
              : "Генеруйте питання з конспекту, видавайте PIN учням і переглядайте результати в одному місці."}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-violet-100/85">
            {(isStudent
              ? ["Кабінет /student", "Проходження за PIN", "AI-помічник"]
              : ["AI-генерація тестів", "Журнал спроб", "Класи за кодом"]
            ).map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span
                  className={`size-2 shrink-0 rounded-full shadow-sm ${isStudent ? "bg-emerald-300" : "bg-violet-300"}`}
                />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="w-full"
        >
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl shadow-violet-900/10 backdrop-blur-xl sm:p-8">
            <AuthRoleTabs value={role} onChange={onRoleChange} className="mb-3" />
            <AuthModeTabs role={role} className="mb-6" />

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            {children({ role })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
