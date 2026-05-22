//src/shared/lib/server/openrouter.ts
import { generatedQuestionsResponseSchema } from './ai-schemas';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getNumberEnv(name: string, fallback: number): number {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function extractJson(content: string): unknown {
    const trimmed = content.trim();

    try {
        return JSON.parse(trimmed);
    } catch {
        const match = trimmed.match(/\{[\s\S]*\}/);
        if (!match) {
            throw new Error('AI returned malformed JSON');
        }

        return JSON.parse(match[0]);
    }
}

export async function generateQuestionsWithOpenRouter(input: {
    topic: string;
    count: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    sourceText?: string;
}) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return {
            ok: false as const,
            status: 503,
            message: 'OPENROUTER_API_KEY is not configured',
        };
    }

    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
    const maxTokens = getNumberEnv('OPENROUTER_MAX_TOKENS', 1200);
    const timeoutMs = getNumberEnv('OPENROUTER_TIMEOUT_MS', 30000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const prompt = [
        `Generate ${input.count} educational single-choice test questions.`,
        `Topic: ${input.topic}`,
        `Difficulty: ${input.difficulty ?? 'medium'}`,
        input.sourceText
            ? `Use this source material as context:\n${input.sourceText}`
            : '',
        'Return ONLY valid JSON in this exact shape:',
        '{"questions":[{"prompt":"Question text","options":[{"text":"Correct answer","isCorrect":true},{"text":"Wrong answer","isCorrect":false}]}]}',
        'Rules: 2-6 options per question, exactly one correct option, no markdown, no explanations.',
    ]
        .filter(Boolean)
        .join('\n\n');

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
                            'You create short educational tests. You must answer with JSON only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.4,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            return {
                ok: false as const,
                status: 502,
                message: 'OpenRouter request failed',
                details: text.slice(0, 1000),
            };
        }

        const data = (await response.json()) as {
            model?: string;
            choices?: Array<{ message?: { content?: string } }>;
            usage?: unknown;
        };
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return {
                ok: false as const,
                status: 502,
                message: 'OpenRouter returned an empty response',
            };
        }

        const parsed = generatedQuestionsResponseSchema.safeParse(
            extractJson(content),
        );

        if (!parsed.success) {
            return {
                ok: false as const,
                status: 502,
                message: 'AI response did not match expected question format',
                details: parsed.error.flatten(),
            };
        }

        return {
            ok: true as const,
            questions: parsed.data.questions,
            model: data.model ?? model,
            usage: data.usage,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return {
                ok: false as const,
                status: 504,
                message: 'OpenRouter request timed out',
            };
        }

        return {
            ok: false as const,
            status: 502,
            message:
                error instanceof Error ? error.message : 'AI generation failed',
        };
    } finally {
        clearTimeout(timeout);
    }
}
