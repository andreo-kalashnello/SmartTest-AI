import Link from "next/link";
import { Plus } from "lucide-react";

import { TeacherTestList } from "@/widgets/teacher-test-list";
import { Button } from "@/shared/ui/button";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мої тести</h1>
          <p className="text-sm text-gray-500">
            Створюйте тести та діліться PIN з учнями.
          </p>
        </div>
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
        >
          <Link href="/dashboard/tests/new">
            <Plus className="mr-2 size-4" />
            Створити тест
          </Link>
        </Button>
      </div>
      <TeacherTestList />
    </div>
  );
}
