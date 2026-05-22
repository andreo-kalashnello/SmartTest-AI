import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, 64).toString("base64url");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;

  const actual = Buffer.from(scryptSync(password, salt, 64).toString("base64url"));
  const expected = Buffer.from(storedKey);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
