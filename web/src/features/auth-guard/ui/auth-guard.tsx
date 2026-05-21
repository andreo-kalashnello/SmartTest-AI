"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { publicConfig } from "@/shared/config";
import { useAppSelector } from "@/shared/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.authSession);
  const skip = publicConfig.skipAuthGuard;

  useEffect(() => {
    if (skip) return;
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router, skip]);

  if (skip) {
    return children;
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  if (!user) return null;

  return children;
}
