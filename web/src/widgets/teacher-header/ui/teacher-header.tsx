"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, LogOut } from "lucide-react";

import {
  logout,
  logoutTeacher,
  useAppDispatch,
  useAppSelector,
} from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";

export function TeacherHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.authSession.user);

  const handleLogout = async () => {
    await dispatch(logoutTeacher());
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-indigo-600"
        >
          <Brain className="size-5" aria-hidden />
          SmartTest AI
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="font-medium text-gray-600 hover:text-indigo-600"
          >
            Мої тести
          </Link>
          {user && (
            <span className="hidden text-gray-500 sm:inline">{user.name}</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Вийти"
          >
            <LogOut className="size-4" />
            <span className="ml-1 hidden sm:inline">Вийти</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
