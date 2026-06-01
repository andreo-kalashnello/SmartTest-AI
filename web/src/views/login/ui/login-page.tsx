"use client";

import { Suspense } from "react";

import { LoginForm } from "@/features/auth-by-credentials";
import { AuthPageShell } from "@/widgets/auth-shell";

function LoginPageContent() {
  return (
    <AuthPageShell mode="login">
      {({ role }) => <LoginForm role={role} />}
    </AuthPageShell>
  );
}

export function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center gradient-landing text-slate-500">
          Завантаження...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
