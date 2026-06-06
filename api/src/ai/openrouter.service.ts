//src/ai/openrouter.service.ts
import { Injectable } from '@nestjs/common';
import {
    generatedQuestionsResponseSchema,
    GenerateQuestionsDto,
    GeneratedQuestion,
} from './dto/generate-questions.dto';
import { languageInstruction, resolveTestLanguage } from './detect-language';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

type OpenRouterResponse = {
    model?: string;
    choices?: Array<{
        finish_reason?: string;
        message?: { content?: string | null; reasoning?: string | null };
    }>;
    usage?: unknown;
};

type OpenRouterResult =
    | {
          ok: true;
          questions: GeneratedQuestion[];
          model: string;
          usage: unknown;
      }
    | { ok: false; status: number; message: string; details?: unknown };

function numberEnv(name: string, fallback: number) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function stripMarkdownFences(text: string): string {
    const trimmed = text.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
    return fenced?.[1]?.trim() ?? trimmed;
}

function pickMessageText(message?: {
    content?: string | null;
    reasoning?: string | null;
}): string {
    const content = message?.content?.trim() ?? '';
    if (content) return stripMarkdownFences(content);
    const reasoning = message?.reasoning?.trim() ?? '';
    const fenced = reasoning.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) return fenced[1].trim();
    return reasoning.match(/\{[\s\S]*\}/)?.[0]?.trim() ?? '';
}

function extractJson(
    content: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
    const trimmed = stripMarkdownFences(content);
    try {
        return { ok: true, value: JSON.parse(trimmed) };
    } catch {
        const match = trimmed.match(/\{[\s\S]*\}/);
        if (!match) return { ok: false, error: 'AI returned malformed JSON' };
        try {
            return { ok: true, value: JSON.parse(match[0]) };
        } catch {
            return {
                ok: false,
                error: 'AI returned truncated or invalid JSON. Try fewer questions or increase OPENROUTER_MAX_TOKENS.',
            };
        }
    }
}

function shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[index],
        ];
    }
    return shuffled;
}

@Injectable()
export class OpenRouterService {
    async generateQuestions(
        input: GenerateQuestionsDto & { title?: string },
    ): Promise<OpenRouterResult> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey)
            return {
                ok: false,
                status: 503,
                message: 'OPENROUTER_API_KEY is not configured',
            };

        const language = resolveTestLanguage(input.language ?? 'auto', [
            input.title,
            input.topic,
            input.sourceText,
        ]);
        const prompt = [
            languageInstruction(language),
            `Generate exactly ${input.count} educational single-choice test questions.`,
            `Topic: ${input.topic}`,
            `Difficulty: ${input.difficulty ?? 'medium'}`,
            input.sourceText
                ? `Use this source material as context:\n${input.sourceText}`
                : '',
            'Return ONLY one compact JSON object (no markdown fences, no comments):',
            '{"questions":[{"prompt":"Question text","options":[{"text":"Answer A","isCorrect":true},{"text":"Answer B","isCorrect":false}]}]}',
            'Rules: 2-4 options per question, exactly one isCorrect:true, short prompts, valid JSON only.',
        ]
            .filter(Boolean)
            .join('\n\n');

        const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
        const timeoutMs = numberEnv('OPENROUTER_TIMEOUT_MS', 90000);
        const maxTokens = Math.min(
            8000,
            Math.max(
                numberEnv('OPENROUTER_MAX_TOKENS', 3000),
                input.count * 900 + 800,
            ),
        );

        const result = await this.callChat(
            apiKey,
            model,
            prompt,
            maxTokens,
            timeoutMs,
        );
        if (!result.ok) return result;

        const json = extractJson(result.content);
        if (!json.ok)
            return {
                ok: false,
                status: 502,
                message: json.error,
                details: { model: result.model },
            };

        const parsed = generatedQuestionsResponseSchema.safeParse(json.value);
        if (!parsed.success) {
            return {
                ok: false,
                status: 502,
                message: 'AI response did not match expected question format',
                details: parsed.error.flatten(),
            };
        }

        return {
            ok: true,
            questions: parsed.data.questions
                .slice(0, input.count)
                .map((question) => ({
                    ...question,
                    options: shuffleArray(question.options),
                })),
            model: result.model,
            usage: result.usage,
        };
    }

    async extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');
        const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: this.headers(apiKey),
            body: JSON.stringify({
                model: process.env.OPENROUTER_VISION_MODEL || 'openrouter/free',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Extract all readable text from this educational image. Return plain text only. If no text, reply with EMPTY.',
                            },
                            { type: 'image_url', image_url: { url: dataUrl } },
                        ],
                    },
                ],
                max_tokens: 2000,
                temperature: 0.1,
            }),
        });
        if (!response.ok)
            throw new Error(
                `Image text extraction failed (${response.status}): ${(await response.text()).slice(0, 300)}`,
            );
        const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content?.trim() ?? '';
        return !text || text.toUpperCase() === 'EMPTY' ? '' : text;
    }

    private async callChat(
        apiKey: string,
        model: string,
        prompt: string,
        maxTokens: number,
        timeoutMs: number,
    ) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: this.headers(apiKey),
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You create educational tests. Output valid JSON only, no markdown.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.3,
                    max_tokens: maxTokens,
                }),
                signal: controller.signal,
            });
            if (!response.ok) {
                return {
                    ok: false as const,
                    status: 502,
                    message: 'OpenRouter request failed',
                    details: (await response.text()).slice(0, 1000),
                };
            }
            const data = (await response.json()) as OpenRouterResponse;
            const choice = data.choices?.[0];
            const content = pickMessageText(choice?.message);
            if (!content)
                return {
                    ok: false as const,
                    status: 502,
                    message: 'OpenRouter returned an empty response',
                    details: { model: data.model ?? model },
                };
            return {
                ok: true as const,
                content,
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
                    error instanceof Error
                        ? error.message
                        : 'AI generation failed',
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    private headers(apiKey: string) {
        return {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-OpenRouter-Title': process.env.APP_NAME || 'SmartTest AI',
        };
    }
}
