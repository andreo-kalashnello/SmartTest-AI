"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";

import { useAppSelector } from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

const MOCK_REPLIES = [
  "Я допоможу з поясненням теми, підготовкою до тесту чи навігацією по платформі. Що саме потрібно?",
  "Для проходження тесту без реєстрації відкрийте /join і введіть PIN від викладача.",
  "Учням: зареєструйтесь з роллю «Учень», щоб бачити оцінки та ДЗ в кабінеті /student.",
  "Викладачам: створіть тест через «Новий тест» → ШІ згенерує питання з вашого матеріалу.",
];

function pickReply(): string {
  return MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]!;
}

export function AiChatWidget() {
  const user = useAppSelector((s) => s.authSession.user);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Привіт! Я SmartTest AI — помічник для учнів і викладачів. Поки це демо-чат (візуал); повна відповідь через API зʼявиться пізніше.",
    },
  ]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: pickReply(),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const greeting = user
    ? user.role === "student"
      ? `Учень: ${user.name}`
      : `Викладач: ${user.name}`
    : "Гість";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-4 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <div>
                  <p className="text-sm font-semibold">AI-помічник</p>
                  <p className="text-xs text-violet-200">{greeting}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-white/20"
                aria-label="Закрити чат"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex max-h-72 flex-1 flex-col gap-2 overflow-y-auto p-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-gray-100 p-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Запитайте про тест, ДЗ, клас..."
                className="text-sm"
              />
              <Button
                type="button"
                size="icon"
                onClick={send}
                className="shrink-0 bg-violet-600 hover:bg-violet-700"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="px-3 pb-2 text-center text-[10px] text-gray-400">
              Демо UI · API: POST /api/ai/chat (див. BACKEND-TZ)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Відкрити AI-чат"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </motion.button>
    </>
  );
}
