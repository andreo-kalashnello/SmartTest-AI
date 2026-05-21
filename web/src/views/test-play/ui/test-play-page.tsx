import { TestPlayer } from "@/features/test-player";
import { PublicHeader } from "@/widgets/public-header";

interface TestPlayPageProps {
  pin: string;
}

export function TestPlayPage({ pin }: TestPlayPageProps) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PublicHeader showAuth={false} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <TestPlayer pin={pin} />
      </main>
    </div>
  );
}
