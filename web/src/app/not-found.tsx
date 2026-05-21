import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">Сторінку не знайдено</p>
      <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
        <Link href="/">На головну</Link>
      </Button>
    </main>
  );
}
