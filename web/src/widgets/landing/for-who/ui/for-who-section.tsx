"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, GraduationCap } from "lucide-react";

const TEACHER_ITEMS = [
  "Генерація тестів з PDF/фото за 60 секунд",
  "Журнал оцінок і домашні завдання",
  "Статистика та аналітика по класах",
  "Поділення PIN/QR з учнями",
  "Редагування і банк питань",
];

const STUDENT_ITEMS = [
  "Особистий кабінет з прогресом",
  "Проходження тестів за PIN без реєстрації",
  "Журнал оцінок у зрозумілому форматі",
  "Список домашніх завдань з дедлайнами",
  "Історія всіх пройдених тестів",
];

export function ForWhoSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Для кого <span className="text-gradient">SmartTest AI</span>?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Teacher */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 text-white"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10" />
            <div className="relative">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/20 mb-5">
                <BookOpen className="size-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Вчителям</h3>
              <ul className="space-y-3 mb-8">
                {TEACHER_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                    <span className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:shadow-lg"
              >
                Спробувати безкоштовно <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>

          {/* Student */}
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute -top-8 -right-8 size-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-white/10" />
            <div className="relative">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/20 mb-5">
                <GraduationCap className="size-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Учням</h3>
              <ul className="space-y-3 mb-8">
                {STUDENT_ITEMS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                    <span className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?role=student"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:shadow-lg"
              >
                Зареєструватись <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
