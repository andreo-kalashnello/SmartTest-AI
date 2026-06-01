import type { AuthSession, UserRole } from "@/entities/auth";

const STORAGE_KEY = "smarttest_auth_profile";

export type StoredAuthProfile = {
  role: UserRole;
  grade?: string;
  classCode?: string;
  schoolName?: string;
};

function readAll(): Record<string, StoredAuthProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAuthProfile>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StoredAuthProfile>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveAuthProfile(userId: string, profile: StoredAuthProfile) {
  const all = readAll();
  all[userId] = profile;
  writeAll(all);
}

export function loadAuthProfile(userId: string): StoredAuthProfile | null {
  return readAll()[userId] ?? null;
}

/** До появи role в БД — зливаємо профіль з localStorage у сесію */
export function mergeSessionWithProfile(
  user: { id: string; email: string; name: string },
  apiRole?: UserRole,
): AuthSession {
  const stored = loadAuthProfile(user.id);
  const role = apiRole ?? stored?.role ?? "teacher";
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
    grade: stored?.grade,
    classCode: stored?.classCode,
    schoolName: stored?.schoolName,
  };
}
