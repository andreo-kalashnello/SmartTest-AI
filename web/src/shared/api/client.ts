import { publicConfig } from "@/shared/config";

import { ApiError } from "./errors";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiFetchOptions = RequestInit & {
  method?: HttpMethod;
  token?: string | null;
  onUnauthorized?: () => void;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const base = publicConfig.apiBaseUrl.replace(/\/$/, "");
  if (!base) {
    throw new ApiError(
      "API URL не налаштовано (NEXT_PUBLIC_API_URL). Потрібен бек.",
      503,
      "NO_API_URL",
    );
  }

  const { token, onUnauthorized, method, ...init } = options;
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, method, headers });

  if (res.status === 401 || res.status === 403) {
    onUnauthorized?.();
    throw new ApiError(
      res.status === 401 ? "Потрібна авторизація" : "Доступ заборонено",
      res.status,
    );
  }

  if (!res.ok) {
    let message = `API ${res.status}: ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
