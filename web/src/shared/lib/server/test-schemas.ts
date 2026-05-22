import { z } from "zod";

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
  .refine(
    (question) => question.options.filter((option) => option.isCorrect).length === 1,
    {
      message: "Question must have exactly one correct option",
      path: ["options"],
    },
  );

export const testInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  questions: z.array(questionInputSchema).default([]),
});

export const startAttemptSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
  studentName: z.string().trim().min(2).max(120),
});

export const answerInputSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export const saveAnswersSchema = z.object({
  answers: z.array(answerInputSchema).min(1).max(100),
});
