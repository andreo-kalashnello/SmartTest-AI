import { GraduationCap, Users2, CheckCircle2 } from "lucide-react";

const FOR_TEACHER = [
  "Генерація тестів з PDF, DOCX, тексту",
  "Редактор питань з банком",
  "PIN, QR-код та пряме посилання",
  "Live-моніторинг проходження",
  "Детальна аналітика класу",
  "Генерація PDF-бланків",
];

const FOR_STUDENT = [
  "Вхід без реєстрації — тільки PIN та ім'я",
  "Чистий адаптивний інтерфейс",
  "Лічильник прогресу та таймер",
  "Миттєвий результат після завершення",
  "AI-пояснення помилок (преміум)",
  "Підтримка смартфонів, планшетів, ПК",
];

interface CardProps {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge: string;
  title: string;
  items: readonly string[];
}

function RoleCard({ icon: Icon, gradient, badge, title, items }: CardProps) {
  return (
    <div className={`rounded-3xl p-8 text-white ${gradient}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            {badge}
          </p>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/80" />
            <span className="text-white/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ForWhoSection() {
  return (
    <section id="for-who" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-rose-600">
            Для кого
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Дві ролі — одна платформа
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            Викладачі створюють та аналізують, учні — проходять без зайвої
            реєстрації.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RoleCard
            icon={GraduationCap}
            gradient="bg-gradient-to-br from-indigo-600 to-violet-600"
            badge="Для викладачів"
            title="Викладач"
            items={FOR_TEACHER}
          />
          <RoleCard
            icon={Users2}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            badge="Для учнів"
            title="Учень"
            items={FOR_STUDENT}
          />
        </div>
      </div>
    </section>
  );
}
