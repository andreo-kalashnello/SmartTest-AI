import { TestResultsView } from "@/features/test-results";
import { PublicHeader } from "@/widgets/public-header";

export function TestResultsPage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PublicHeader showAuth={false} />
      <main className="mx-auto flex max-w-3xl justify-center px-4 py-10">
        <TestResultsView />
      </main>
    </div>
  );
}
