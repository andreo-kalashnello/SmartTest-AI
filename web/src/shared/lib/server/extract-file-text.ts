import {
  AI_ALLOWED_UPLOAD_TYPES,
  AI_UPLOAD_MAX_BYTES,
  isAllowedUpload,
} from "./upload-limits";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function visionModel(): string {
  return (
    process.env.OPENROUTER_VISION_MODEL ||
    "google/gemini-2.0-flash-lite-001"
  );
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractImageText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-OpenRouter-Title": "SmartTest AI",
    },
    body: JSON.stringify({
      model: visionModel(),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all readable text from this educational image (lecture slide, notes, formulas). Return plain text only, preserve line breaks. If no text, reply with EMPTY.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Image text extraction failed (${response.status}): ${details.slice(0, 300)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text || text.toUpperCase() === "EMPTY") {
    return "";
  }
  return text;
}

function normalizeMime(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

export async function extractTextFromUpload(file: File): Promise<{
  fileName: string;
  mimeType: string;
  text: string;
}> {
  if (file.size > AI_UPLOAD_MAX_BYTES) {
    throw new Error(
      `File is too large (max ${Math.round(AI_UPLOAD_MAX_BYTES / 1024 / 1024)} MB)`,
    );
  }

  const mimeType = normalizeMime(file);
  if (!isAllowedUpload(mimeType, file.name)) {
    throw new Error("Allowed formats: PDF, JPG, PNG, WEBP");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (mimeType === "application/pdf") {
    text = await extractPdfText(buffer);
  } else if (AI_ALLOWED_UPLOAD_TYPES.has(mimeType) && mimeType.startsWith("image/")) {
    text = await extractImageText(buffer, mimeType);
  }

  return {
    fileName: file.name,
    mimeType,
    text: text.trim(),
  };
}
