"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import type { UserRole } from "@/entities/auth";
import { cn } from "@/shared/lib/utils";

type AuthMode = "login" | "register";

const MODES: { id: AuthMode; label: string; href: (role: UserRole) => string }[] = [
  { id: "login", label: "Увійти", href: (r) => `/login?role=${r}` },
  { id: "register", label: "Реєстрація", href: (r) => `/register?role=${r}` },
];

type AuthModeTabsProps = {
  role: UserRole;
  className?: string;
};

export function AuthModeTabs({ role, className }: AuthModeTabsProps) {
  const pathname = usePathname();
  const active: AuthMode = pathname ? pathname.startsWith("/register") ? "register" : "login" : "login";

  return (
    <div
      className={cn(
        "relative grid grid-cols-2 gap-1 rounded-2xl border border-slate-200/80 bg-white/60 p-1",
        className,
      )}
      role="tablist"
      aria-label="Режим"
    >
      {MODES.map((mode) => {
        const isActive = active === mode.id;
        return (
          <Link
            key={mode.id}
            href={mode.href(role)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative z-10 flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {mode.label}
            {isActive && (
              <motion.span
                layoutId="auth-mode-pill"
                className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
