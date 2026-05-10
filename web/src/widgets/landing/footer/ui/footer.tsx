import Link from "next/link";
import { Brain } from "lucide-react";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Платформа: [
    { label: "Можливості", href: "#features" },
    { label: "Як це працює", href: "#how-it-works" },
    { label: "Для кого", href: "#for-who" },
  ],
  Аккаунт: [
    { label: "Реєстрація", href: "/register" },
    { label: "Увійти", href: "/login" },
    { label: "Увійти з PIN", href: "/join" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-white"
            >
              <Brain className="size-5 text-indigo-400" />
              SmartTest AI
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Розумна платформа для освітнього тестування з підтримкою
              штучного інтелекту.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
                Next.js
              </span>
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-400">
                AI-генерація
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                Безкоштовно
              </span>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {title}
              </p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 sm:flex-row">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} SmartTest AI. Усі права захищені.
          </p>
          <p className="text-xs text-gray-700">
            Тестова v1 — до повного релізу у червні
          </p>
        </div>
      </div>
    </footer>
  );
}
