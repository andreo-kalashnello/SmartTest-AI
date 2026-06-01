"use client";

import { GraduationCap, UserRound } from "lucide-react";
import { motion } from "framer-motion";

import type { UserRole } from "@/entities/auth";
import { cn } from "@/shared/lib/utils";

const TABS: { id: UserRole; label: string; icon: typeof UserRound }[] = [
  { id: "teacher", label: "Викладач", icon: UserRound },
  { id: "student", label: "Учень", icon: GraduationCap },
];

type AuthRoleTabsProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
};

export function AuthRoleTabs({ value, onChange, className }: AuthRoleTabsProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-2 gap-1 rounded-2xl bg-slate-100/90 p-1.5",
        className,
      )}
      role="tablist"
      aria-label="Роль"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
              active
                ? tab.id === "teacher"
                  ? "text-violet-700"
                  : "text-emerald-700"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {tab.label}
            {active && (
              <motion.span
                layoutId="auth-role-pill"
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl shadow-md ring-1 ring-black/5",
                  tab.id === "teacher" ? "bg-white" : "bg-white",
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
