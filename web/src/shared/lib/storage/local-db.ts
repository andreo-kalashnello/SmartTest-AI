import type { Test, TestAttempt } from "@/entities/test";
import { STORAGE_KEYS } from "./keys";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const localDb = {
  auth: {
    getUsers(): AuthUser[] {
      return read<AuthUser[]>(STORAGE_KEYS.auth, []);
    },
    register(data: { email: string; password: string; name: string }): AuthUser {
      const users = localDb.auth.getUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error("Користувач з таким email вже існує");
      }
      const user: AuthUser = {
        id: generateId(),
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
      };
      write(STORAGE_KEYS.auth, [...users, user]);
      return user;
    },
    login(email: string, password: string): AuthUser {
      const user = localDb.auth
        .getUsers()
        .find(
          (u) =>
            u.email === email.toLowerCase() && u.password === password,
        );
      if (!user) throw new Error("Невірний email або пароль");
      return user;
    },
  },

  tests: {
    list(): Test[] {
      return read<Test[]>(STORAGE_KEYS.tests, []);
    },
    getById(id: string): Test | undefined {
      return localDb.tests.list().find((t) => t.id === id);
    },
    getByPin(pin: string): Test | undefined {
      return localDb.tests.list().find((t) => t.pin === pin);
    },
    create(title: string): Test {
      const tests = localDb.tests.list();
      let pin = generatePin();
      while (tests.some((t) => t.pin === pin)) pin = generatePin();
      const now = new Date().toISOString();
      const test: Test = {
        id: generateId(),
        title,
        pin,
        questions: [],
        createdAt: now,
        updatedAt: now,
      };
      write(STORAGE_KEYS.tests, [...tests, test]);
      return test;
    },
    update(test: Test): Test {
      const tests = localDb.tests.list();
      const updated = { ...test, updatedAt: new Date().toISOString() };
      write(
        STORAGE_KEYS.tests,
        tests.map((t) => (t.id === test.id ? updated : t)),
      );
      return updated;
    },
    remove(id: string): void {
      write(
        STORAGE_KEYS.tests,
        localDb.tests.list().filter((t) => t.id !== id),
      );
    },
  },

  attempts: {
    list(): TestAttempt[] {
      return read<TestAttempt[]>(STORAGE_KEYS.attempts, []);
    },
    listByTest(testId: string): TestAttempt[] {
      return localDb.attempts.list().filter((a) => a.testId === testId);
    },
    save(attempt: Omit<TestAttempt, "id">): TestAttempt {
      const attempts = localDb.attempts.list();
      const full: TestAttempt = { ...attempt, id: generateId() };
      write(STORAGE_KEYS.attempts, [...attempts, full]);
      return full;
    },
  },

  seedDemoIfEmpty(): void {
    if (localDb.tests.list().length > 0) return;
    const now = new Date().toISOString();
    const demo: Test = {
      id: "demo-test-1",
      title: "Демо: Основи програмування",
      pin: "123456",
      createdAt: now,
      updatedAt: now,
      questions: [
        {
          id: "q1",
          prompt: "Що таке змінна в програмуванні?",
          options: [
            { id: "o1", text: "Іменоване місце для зберігання даних", isCorrect: true },
            { id: "o2", text: "Тип циклу", isCorrect: false },
            { id: "o3", text: "Оператор порівняння", isCorrect: false },
          ],
        },
        {
          id: "q2",
          prompt: "Який тип даних зберігає true/false?",
          options: [
            { id: "o4", text: "boolean", isCorrect: true },
            { id: "o5", text: "string", isCorrect: false },
            { id: "o6", text: "number", isCorrect: false },
          ],
        },
      ],
    };
    write(STORAGE_KEYS.tests, [demo]);
  },
};
