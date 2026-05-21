import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";

import { Button } from "@/shared/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-amber-50 py-20 sm:py-28">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-[500px] rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[500px] rounded-full bg-violet-300/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200">
          <BookOpen className="size-3.5" />
          Платформа для сучасної освіти
        </span>

        {/* Headline */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Тести з{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
            підтримкою ШІ
          </span>{" "}
          для освітнього процесу
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-gray-600">
          SmartTest AI автоматично генерує якісні тести з ваших матеріалів,
          проводить тестування та надає детальну аналітику — все в одному місці.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/60"
            asChild
          >
            <Link href="/register">
              Почати безкоштовно
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/80" asChild>
            <Link href="/join">Увійти за PIN</Link>
          </Button>
        </div>

        {/* Social proof chips */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-emerald-500" />
            <span>Для викладачів та учнів</span>
          </div>
          <div className="hidden h-4 w-px bg-gray-300 sm:block" />
          <span className="font-medium text-emerald-600">
            Вхід учня без реєстрації
          </span>
          <div className="hidden h-4 w-px bg-gray-300 sm:block" />
          <span>Генерація тестів за допомогою ШІ</span>
        </div>
      </div>
    </section>
  );
}
