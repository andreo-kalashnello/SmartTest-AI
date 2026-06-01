import { TeacherTestList } from "@/widgets/teacher-test-list";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Мої тести</h1>
          <p className="text-sm text-gray-500">Створюйте тести та діліться PIN з учнями</p>
        </div>
        <Link
          href="/dashboard/tests/new"
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          <Plus className="size-4" />
          Новий тест
        </Link>
      </div>
      <Suspense>
        <TeacherTestList />
      </Suspense>
    </div>
  );
}
