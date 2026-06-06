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
  return request<T>(path, options, true);
}

async function request<T>(
  path: string,
  options: ApiFetchOptions,
  canRefresh: boolean,
): Promise<T> {
  const base = (publicConfig.apiBaseUrl || "http://localhost:4000/api").replace(/\/$/, "");

  const { token, onUnauthorized, method, ...init } = options;
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const isFormData = init.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, method, headers, credentials: "include" });

  if (res.status === 401 && canRefresh && path !== "/auth/refresh") {
    const refreshed = await refreshSession(base);
    if (refreshed) return request<T>(path, options, false);
  }

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

async function refreshSession(base: string) {
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.ok;
}
