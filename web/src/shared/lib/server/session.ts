import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const SESSION_COOKIE = "smarttest_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? "dev-only-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encode(payload: { userId: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(value: string): { userId: string; exp: number } | null {
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: string;
      exp?: number;
    };

    if (!payload.userId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { userId: payload.userId, exp: payload.exp };
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return decode(session)?.userId ?? null;
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: encode({
      userId,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
