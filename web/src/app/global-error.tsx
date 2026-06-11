"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Помилка</h1>
        <p className="text-lg text-gray-600">Щось пішло не так</p>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Спробувати ще
        </button>
      </div>
    </div>
  );
}
