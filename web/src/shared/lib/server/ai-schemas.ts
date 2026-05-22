//src/shared/lib/server/ai-schemas.ts
import { z } from 'zod';

const generatedOptionSchema = z.object({
    text: z.string().trim().min(1).max(500),
    isCorrect: z.boolean(),
});

export const generateQuestionsSchema = z.object({
    topic: z.string().trim().min(2).max(200),
    count: z.number().int().min(1).max(10),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    sourceText: z.string().trim().max(8000).optional(),
});

export const createAiTestSchema = generateQuestionsSchema.extend({
    title: z.string().trim().min(1).max(200).optional(),
});

export const generatedQuestionSchema = z
    .object({
        prompt: z.string().trim().min(1).max(2000),
        options: z.array(generatedOptionSchema).min(2).max(6),
    })
    .refine(
        (question) =>
            question.options.filter((option) => option.isCorrect).length === 1,
        {
            message: 'Generated question must have exactly one correct option',
            path: ['options'],
        },
    );

export const generatedQuestionsResponseSchema = z.object({
    questions: z.array(generatedQuestionSchema).min(1).max(10),
});
