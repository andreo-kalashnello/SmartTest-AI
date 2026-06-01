"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Bot, FileUp, Hash, UserPlus } from "lucide-react";

const STEPS: { num: string; title: string; desc: string; Icon: LucideIcon }[] = [
  { num: "01", title: "Реєструйтесь", desc: "Безкоштовний акаунт вчителя за 30 секунд", Icon: UserPlus },
  { num: "02", title: "Завантажте матеріал", desc: "PDF, фото конспекту або введіть тему вручну", Icon: FileUp },
  { num: "03", title: "AI генерує тест", desc: "30–90 секунд — і готова чернетка питань", Icon: Bot },
  { num: "04", title: "Поділіться PIN", desc: "Учні входять за 6-значним кодом, без реєстрації", Icon: Hash },
  { num: "05", title: "Аналізуйте", desc: "Результати, оцінки й статистика — в реальному часі", Icon: BarChart3 },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 mb-4">
            Як це працює
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Від матеріалу до тесту — <span className="text-gradient">5 кроків</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute top-12 left-8 right-8 h-0.5 bg-gradient-to-r from-violet-200 via-purple-300 to-violet-200 hidden lg:block" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="relative z-10 flex size-24 flex-col items-center justify-center rounded-2xl bg-white shadow-lg border border-violet-100 mb-4">
                  <step.Icon className="size-8 text-violet-600 mb-1" aria-hidden />
                  <span className="text-xs font-bold text-violet-400">{step.num}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
