"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";

import { Button } from "@/shared/ui/button";

const NAV_LINKS = [
  { label: "Можливості", href: "#features" },
  { label: "Як це працює", href: "#how-it-works" },
  { label: "Для кого", href: "#for-who" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-indigo-600"
        >
          <Brain className="size-6" />
          SmartTest AI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Увійти</Link>
          </Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            asChild
          >
            <Link href="/register">Реєстрація</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Відкрити меню"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/login">Увійти</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              asChild
            >
              <Link href="/register">Реєстрація</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
