import { RegisterForm } from "@/features/auth-by-credentials";
import { PublicHeader } from "@/widgets/public-header";

export function RegisterPage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PublicHeader />
      <main className="mx-auto flex max-w-3xl justify-center px-4 py-10">
        <RegisterForm />
      </main>
    </div>
  );
}
