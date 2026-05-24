//src/shared/lib/server/openrouter.ts
import { generatedQuestionsResponseSchema } from "./ai-schemas";
import {
    languageInstruction,
    resolveTestLanguage,
    type LanguageMode,
} from "./detect-language";

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getNumberEnv(name: string, fallback: number): number {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

type OpenRouterChoice = {
    finish_reason?: string;
    message?: {
        content?: string | null;
        reasoning?: string | null;
    };
};

type OpenRouterResponse = {
    model?: string;
    choices?: OpenRouterChoice[];
    usage?: {
        completion_tokens_details?: { reasoning_tokens?: number };
    };
};

function stripMarkdownFences(text: string): string {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
    return fenced?.[1]?.trim() ?? trimmed;
}

function pickMessageText(message: OpenRouterChoice['message']): string {
    const content = message?.content?.trim() ?? '';
    if (content) return stripMarkdownFences(content);

    const reasoning = message?.reasoning?.trim() ?? '';
    if (!reasoning) return '';

    const fenced = reasoning.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();

    const jsonLike = reasoning.match(/\{[\s\S]*\}/);
    return jsonLike?.[0]?.trim() ?? '';
}

function extractJson(content: string): { ok: true; value: unknown } | { ok: false; error: string } {
    const trimmed = stripMarkdownFences(content);

    try {
        return { ok: true, value: JSON.parse(trimmed) };
    } catch {
        const match = trimmed.match(/\{[\s\S]*\}/);
        if (!match) {
            return { ok: false, error: 'AI returned malformed JSON' };
        }

        try {
            return { ok: true, value: JSON.parse(match[0]) };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Invalid JSON from AI';
            return {
                ok: false,
                error:
                    message.includes('JSON')
                        ? 'AI returned truncated or invalid JSON. Try fewer questions (2–3), increase OPENROUTER_MAX_TOKENS, or switch model.'
                        : message,
            };
        }
    }
}

function resolveMaxTokens(questionCount: number): number {
    const configured = getNumberEnv('OPENROUTER_MAX_TOKENS', 3000);
    const scaled = questionCount * 900 + 800;
    return Math.min(8000, Math.max(configured, scaled));
}

function buildPrompt(input: {
    topic: string;
    count: number;
    difficulty?: "easy" | "medium" | "hard";
    sourceText?: string;
    language: LanguageMode;
    title?: string;
}): string {
    const lang = resolveTestLanguage(input.language, [
        input.title,
        input.topic,
        input.sourceText,
    ]);

    return [
        languageInstruction(lang),
        `Generate exactly ${input.count} educational single-choice test questions.`,
        `Topic: ${input.topic}`,
        `Difficulty: ${input.difficulty ?? "medium"}`,
        input.sourceText
            ? `Use this source material as context:\n${input.sourceText}`
            : "",
        "Return ONLY one compact JSON object (no markdown fences, no comments):",
        '{"questions":[{"prompt":"Question text","options":[{"text":"Answer A","isCorrect":true},{"text":"Answer B","isCorrect":false}]}]}',
        "Rules: 2-4 options per question, exactly one isCorrect:true, short prompts, valid JSON only.",
        `Reminder: every "prompt" and every option "text" must be in ${lang === "uk" ? "Ukrainian" : "English"}.`,
    ]
        .filter(Boolean)
        .join("\n\n");
}

async function callOpenRouter(
    apiKey: string,
    model: string,
    prompt: string,
    maxTokens: number,
    timeoutMs: number,
): Promise<
    | { ok: true; data: OpenRouterResponse; content: string; finishReason?: string }
    | { ok: false; status: number; message: string; details?: unknown }
> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer':
                    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-OpenRouter-Title': 'SmartTest AI',
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content:
                            "You create educational tests. Output valid JSON only, no markdown. Follow the user language rule exactly.",
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: maxTokens,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            return {
                ok: false,
                status: 502,
                message: 'OpenRouter request failed',
                details: text.slice(0, 1000),
            };
        }

        const data = (await response.json()) as OpenRouterResponse;
        const choice = data.choices?.[0];
        const content = pickMessageText(choice?.message);

        if (!content) {
            return {
                ok: false,
                status: 502,
                message:
                    'OpenRouter returned an empty response. Try OPENROUTER_MAX_TOKENS=4000+ or a non-reasoning model.',
                details: {
                    model: data.model ?? model,
                    finishReason: choice?.finish_reason ?? null,
                    reasoningTokens:
                        data.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
                    maxTokens,
                },
            };
        }

        return {
            ok: true,
            data,
            content,
            finishReason: choice?.finish_reason,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return {
                ok: false,
                status: 504,
                message: 'OpenRouter request timed out',
            };
        }

        return {
            ok: false,
            status: 502,
            message:
                error instanceof Error ? error.message : 'AI generation failed',
        };
    } finally {
        clearTimeout(timeout);
    }
}

export async function generateQuestionsWithOpenRouter(input: {
    topic: string;
    count: number;
    difficulty?: "easy" | "medium" | "hard";
    sourceText?: string;
    language?: LanguageMode;
    title?: string;
}) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return {
            ok: false as const,
            status: 503,
            message: 'OPENROUTER_API_KEY is not configured',
        };
    }

    const model = process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free';
    const timeoutMs = getNumberEnv('OPENROUTER_TIMEOUT_MS', 90000);
    const maxTokens = resolveMaxTokens(input.count);
    const prompt = buildPrompt({
        ...input,
        language: input.language ?? "auto",
    });
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const tokens =
            attempt === 1 ? maxTokens : Math.min(8000, Math.round(maxTokens * 1.5));

        const result = await callOpenRouter(
            apiKey,
            model,
            prompt,
            tokens,
            timeoutMs,
        );

        if (!result.ok) {
            return result;
        }

        const truncated = result.finishReason === 'length';
        const jsonResult = extractJson(result.content);

        if (!jsonResult.ok) {
            if (truncated && attempt < maxAttempts) continue;
            return {
                ok: false as const,
                status: 502,
                message: jsonResult.error,
                details: {
                    model: result.data.model ?? model,
                    finishReason: result.finishReason ?? null,
                    attempt,
                    maxTokens: tokens,
                    hint: 'Спробуйте 2–3 питання або OPENROUTER_MODEL=google/gemma-2-9b-it:free',
                },
            };
        }

        const parsed = generatedQuestionsResponseSchema.safeParse(jsonResult.value);

        if (!parsed.success) {
            if (attempt < maxAttempts) continue;
            return {
                ok: false as const,
                status: 502,
                message: 'AI response did not match expected question format',
                details: parsed.error.flatten(),
            };
        }

        if (parsed.data.questions.length < input.count && attempt < maxAttempts) {
            continue;
        }

        return {
            ok: true as const,
            questions: parsed.data.questions.slice(0, input.count),
            model: result.data.model ?? model,
            usage: result.data.usage,
        };
    }

    return {
        ok: false as const,
        status: 502,
        message: 'AI generation failed after retries',
    };
}
