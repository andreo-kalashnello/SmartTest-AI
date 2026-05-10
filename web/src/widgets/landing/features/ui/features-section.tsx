import {
  BarChart3,
  FileText,
  QrCode,
  Shield,
  Timer,
  Wand2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    color: "bg-violet-100 text-violet-600",
    accent: "group-hover:bg-violet-200",
    title: "AI-генерація тестів",
    desc: "Завантажте PDF, DOCX або вставте текст — ШІ сам створить питання зі «smart» дистракторами.",
  },
  {
    icon: FileText,
    color: "bg-amber-100 text-amber-600",
    accent: "group-hover:bg-amber-200",
    title: "Зручний редактор",
    desc: "Повний контроль над контентом: додавайте, редагуйте, видаляйте питання та зберігайте банк.",
  },
  {
    icon: BarChart3,
    color: "bg-emerald-100 text-emerald-600",
    accent: "group-hover:bg-emerald-200",
    title: "Детальна аналітика",
    desc: "Середній бал класу, рейтинг учнів та виявлення «прогалин» у знаннях — у реальному часі.",
  },
  {
    icon: Timer,
    color: "bg-rose-100 text-rose-600",
    accent: "group-hover:bg-rose-200",
    title: "Гнучкі налаштування",
    desc: "Таймер, античит-перемішування, вікна доступності та вибір зворотного зв'язку.",
  },
  {
    icon: QrCode,
    color: "bg-sky-100 text-sky-600",
    accent: "group-hover:bg-sky-200",
    title: "PIN та QR-код",
    desc: "Учень заходить без реєстрації: вводить 6-значний PIN або сканує QR прямо в класі.",
  },
  {
    icon: Shield,
    color: "bg-orange-100 text-orange-600",
    accent: "group-hover:bg-orange-200",
    title: "Офлайн PDF",
    desc: "Одна кнопка — і готовий красивий PDF: бланки для учнів та ключ відповідей для викладача.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Можливості
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Все, що потрібно для тестування
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Від генерації питань до аналізу результатів — платформа бере на
            себе рутину.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-shadow hover:shadow-md"
            >
              <div
                className={`inline-flex rounded-xl p-3 transition-colors ${f.color} ${f.accent}`}
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
