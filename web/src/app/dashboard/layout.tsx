"use client";

import { AuthGuard } from "@/features/auth-guard";
import { TeacherSidebar } from "@/widgets/teacher-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-dvh bg-slate-50">
        <TeacherSidebar />
        <div className="lg:pl-60">
          <main className="px-4 pt-16 pb-8 sm:px-6 lg:pt-8 max-w-6xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
