"use client";

import { motion } from "framer-motion";
import { fadeIn, stagger } from "@/shared/ui/motion";
import { Brain, FileText, BarChart3, Users, Zap, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-генерація питань",
    desc: "Завантажте PDF або фото конспекту — штучний інтелект створить якісний тест за 30–90 секунд.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: Zap,
    title: "PIN-доступ за секунди",
    desc: "Учні входять у тест без реєстрації: просто введіть 6-значний PIN і починайте відповідати.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    title: "Аналітика та статистика",
    desc: "Відслідковуйте прогрес кожного учня, середні бали та рейтинги по класах і предметах.",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
  },
  {
    icon: FileText,
    title: "Домашні завдання",
    desc: "Призначайте ДЗ з дедлайнами, перевіряйте виконання та ставте оцінки в кілька кліків.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Users,
    title: "Кабінет учня",
    desc: "Учні бачать свої оцінки, домашні завдання та результати тестів в особистому кабінеті.",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
  },
  {
    icon: Shield,
    title: "Безпека і надійність",
    desc: "Дані зберігаються на захищеному сервері. Відповідає вимогам GDPR для навчальних закладів.",
    color: "from-gray-600 to-slate-700",
    bg: "bg-gray-50",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700 mb-4">
            Функції
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Все що потрібно для
            <span className="text-gradient"> сучасного навчання</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Повна платформа для вчителів і учнів — від генерації тестів до журналу оцінок
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={fadeIn}
              custom={i}
              className={`group rounded-2xl ${feat.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-transparent hover:border-white`}
            >
              <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} mb-4 shadow-md`}>
                <feat.icon className="size-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
