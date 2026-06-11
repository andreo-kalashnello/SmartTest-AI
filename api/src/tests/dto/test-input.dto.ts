import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const questionOptionInputSchema = z.object({
  text: z.string().trim().min(1).max(500),
  isCorrect: z.boolean(),
});

export const questionInputSchema = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
    options: z.array(questionOptionInputSchema).min(2).max(8),
  })
  .refine((question) => question.options.filter((option) => option.isCorrect).length === 1, {
    message: 'Question must have exactly one correct option',
    path: ['options'],
  });

export const testInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subjectId: z.string().trim().min(1).optional(),
  questions: z.array(questionInputSchema).default([]),
});

export type TestInputDto = z.infer<typeof testInputSchema>;
