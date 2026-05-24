export const AI_UPLOAD_MAX_BYTES = Number(
  process.env.AI_UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024,
);

export const AI_ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const AI_ALLOWED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export function isAllowedUpload(
  mimeType: string,
  fileName: string,
): boolean {
  if (AI_ALLOWED_UPLOAD_TYPES.has(mimeType)) return true;
  const lower = fileName.toLowerCase();
  return AI_ALLOWED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
