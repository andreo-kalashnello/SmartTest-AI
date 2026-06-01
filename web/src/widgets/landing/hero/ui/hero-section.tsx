"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Zap } from "lucide-react";

const FLOATING_CARDS = [
  { icon: "📐", title: "Математика", score: "12/12", color: "from-violet-500 to-purple-600", delay: 0 },
  { icon: "⚛️", title: "Фізика", score: "9/10", color: "from-blue-500 to-cyan-600", delay: 0.4 },
  { icon: "🧪", title: "Хімія", score: "11/12", color: "from-emerald-500 to-teal-600", delay: 0.8 },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-landing py-24 md:py-32">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" />
        {/* Dots grid */}
        <svg className="absolute inset-0 h-full w-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 mb-6 border border-white/20"
            >
              <Sparkles className="size-4 text-yellow-400" />
              AI-генерація тестів за матеріалом
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold text-white leading-tight md:text-5xl lg:text-6xl"
            >
              Розумні тести
              <br />
              <span className="text-yellow-400">за секунди</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-white/75 max-w-lg leading-relaxed"
            >
              SmartTest AI перетворює ваш навчальний матеріал на готові тести. 
              Завантажте PDF або фото конспекту — AI згенерує питання за секунди.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg transition-all hover:shadow-xl hover:bg-yellow-50"
              >
                Почати безкоштовно
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                <Zap className="size-4 text-yellow-400" />
                Пройти тест за PIN
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex items-center gap-6 text-sm text-white/60"
            >
              {[
                { val: "1 200+", label: "вчителів" },
                { val: "45 000+", label: "тестів" },
                { val: "98%", label: "задоволені" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: floating cards */}
          <div className="relative hidden lg:flex items-center justify-center h-96">
            {/* Center brain */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute z-10 flex size-28 items-center justify-center rounded-3xl bg-white/10 border border-white/30 backdrop-blur-sm"
            >
              <Brain className="size-14 text-white" />
            </motion.div>

            {/* Floating cards */}
            {FLOATING_CARDS.map((card, i) => {
              const positions = [
                { top: "0%", left: "55%", rotate: 6 },
                { top: "60%", left: "68%", rotate: -4 },
                { top: "55%", left: "10%", rotate: 8 },
              ];
              const pos = positions[i];
              return (
                <motion.div
                  key={card.title}
                  className={`absolute w-44 rounded-2xl bg-gradient-to-br ${card.color} p-4 shadow-xl text-white`}
                  style={{ top: pos.top, left: pos.left, rotate: `${pos.rotate}deg` }}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: [0, -8, 0],
                    scale: 1,
                  }}
                  transition={{
                    opacity: { delay: card.delay + 0.3, duration: 0.5 },
                    y: { delay: card.delay + 0.3, duration: 3, repeat: Infinity, ease: "easeInOut" },
                    scale: { delay: card.delay + 0.3, duration: 0.5 },
                  }}
                >
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <div className="text-sm font-medium opacity-90">{card.title}</div>
                  <div className="text-xl font-bold mt-1">{card.score}</div>
                </motion.div>
              );
            })}

            {/* Ping circles */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[140, 200, 260].map((size, i) => (
                <motion.div
                  key={size}
                  className="absolute rounded-full border border-white/10"
                  style={{ width: size, height: size }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
