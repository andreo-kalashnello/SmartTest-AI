"use client";

import { Suspense } from "react";

import { RegisterForm } from "@/features/auth-by-credentials";
import { AuthPageShell } from "@/widgets/auth-shell";

function RegisterPageContent() {
  return (
    <AuthPageShell mode="register">
      {({ role }) => <RegisterForm role={role} />}
    </AuthPageShell>
  );
}

export function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center gradient-landing text-slate-500">
          Завантаження...
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
