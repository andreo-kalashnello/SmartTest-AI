"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/shared/lib/store";

export default function LandingRedirect() {
  const router = useRouter();
  const { user, hydrated } = useAppSelector((s) => s.authSession);

  useEffect(() => {
    if (!hydrated) return; // wait until auth is known
    if (user) {
      // if authenticated, go to dashboard
      void router.replace("/dashboard");
    }
  }, [hydrated, user, router]);

  return null;
}
