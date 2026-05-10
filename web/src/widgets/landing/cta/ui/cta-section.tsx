import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { Button } from "@/shared/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 py-20">
      {/* Blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
          <Zap className="size-3.5" />
          Перший тест за 5 хвилин
        </div>

        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Готові спростити тестування?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-indigo-100">
          Почніть безкоштовно сьогодні — без кредитної картки та зобов&apos;язань.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="bg-white text-indigo-700 shadow-xl hover:bg-indigo-50"
            asChild
          >
            <Link href="/register">
              Зареєструватись
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
            asChild
          >
            <Link href="/join">Увійти з PIN</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
