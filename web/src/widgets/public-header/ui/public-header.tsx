"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface PublicHeaderProps {
  showAuth?: boolean;
}

export function PublicHeader({ showAuth = true }: PublicHeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-indigo-600"
        >
          <Brain className="size-5" aria-hidden />
          SmartTest AI
        </Link>
        {showAuth && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/join">Увійти за PIN</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Викладач</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
