import Link from "next/link";
import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-violet-700 mb-3">
              <div className="flex size-7 items-center justify-center rounded-md gradient-primary">
                <Brain className="size-4 text-white" />
              </div>
              SmartTest AI
            </Link>
            <p className="text-sm text-gray-500">
              AI-платформа для створення та проведення навчальних тестів.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Сервіс</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register" className="hover:text-violet-600">Для вчителів</Link></li>
              <li><Link href="/register?role=student" className="hover:text-violet-600">Для учнів</Link></li>
              <li><Link href="/join" className="hover:text-violet-600">Пройти тест за PIN</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Підтримка</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-violet-600">Увійти</Link></li>
              <li><a href="mailto:support@smarttest.ai" className="hover:text-violet-600">support@smarttest.ai</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} SmartTest AI — навчальний проєкт
        </div>
      </div>
    </footer>
  );
}
