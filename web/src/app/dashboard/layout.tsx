"use client";

import { AuthGuard } from "@/features/auth-guard";
import { TeacherHeader } from "@/widgets/teacher-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-gray-50">
        <TeacherHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
