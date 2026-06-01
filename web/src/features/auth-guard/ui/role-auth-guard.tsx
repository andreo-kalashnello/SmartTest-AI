"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/entities/auth";
import { publicConfig } from "@/shared/config";
import { useAppSelector } from "@/shared/lib/store";

function useRoleGuard(requiredRole: UserRole, redirectTo: string) {
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.authSession);
  const skip = publicConfig.skipAuthGuard;

  useEffect(() => {
    if (skip) return;
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== requiredRole) {
      router.replace(redirectTo);
    }
  }, [hydrated, user, router, skip, requiredRole, redirectTo]);

  return { user, hydrated, skip };
}

export function TeacherAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrated, skip } = useRoleGuard("teacher", "/student");

  if (skip) return children;

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  if (!user || user.role !== "teacher") return null;

  return children;
}

export function StudentAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrated, skip } = useRoleGuard("student", "/dashboard");

  if (skip) return children;

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  if (!user || user.role !== "student") return null;

  return children;
}
