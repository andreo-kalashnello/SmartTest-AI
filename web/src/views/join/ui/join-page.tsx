import { JoinForm } from "@/features/join-test-by-pin";
import { PublicHeader } from "@/widgets/public-header";

export function JoinPage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PublicHeader showAuth={false} />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-10">
        <JoinForm />
      </main>
    </div>
  );
}
