import { BarChart2, PlusCircle, Share2, UserCircle } from "lucide-react";

const STEPS = [
  {
    icon: UserCircle,
    bg: "bg-indigo-500",
    label: "Реєструєтесь",
    desc: "Створюєте акаунт викладача за хвилину — email та пароль.",
  },
  {
    icon: PlusCircle,
    bg: "bg-violet-500",
    label: "Створюєте тест",
    desc: "Вручну або через ШІ з вашого PDF / DOCX / тексту.",
  },
  {
    icon: Share2,
    bg: "bg-pink-500",
    label: "Надаєте доступ",
    desc: "Копіюєте PIN або QR-код — учні входять без реєстрації.",
  },
  {
    icon: BarChart2,
    bg: "bg-emerald-500",
    label: "Аналізуєте",
    desc: "Бачите результати та статистику в реальному часі.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-gray-50 to-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Як це працює
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            4 кроки до готового тесту
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Від реєстрації до результатів — простий і зрозумілий процес.
          </p>
        </div>

        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line — desktop only */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200 lg:block" />

          {STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center text-center">
              <div
                className={`relative flex size-20 items-center justify-center rounded-full ${step.bg} text-white shadow-lg`}
              >
                <step.icon className="size-8" />
                <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-800 ring-2 ring-gray-200">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold text-gray-900">{step.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
