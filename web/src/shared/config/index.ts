/**
 * Базовий URL API (наприклад окремий сервіс у `api/` або Next route handlers).
 * Підставте реальну адресу після появи бекенду.
 */
export const publicConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
} as const;
