"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex size-20 items-center justify-center rounded-3xl gradient-primary mb-6 shadow-xl">
            <Zap className="size-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl mb-4">
            Готові створити перший тест?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Безкоштовно для шкіл і університетів. Реєстрація займе менше 1 хвилини.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
            >
              Почати безкоштовно
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-200 bg-white px-8 py-3.5 text-base font-semibold text-violet-700 transition-all hover:border-violet-400"
            >
              Пройти тест за PIN
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
