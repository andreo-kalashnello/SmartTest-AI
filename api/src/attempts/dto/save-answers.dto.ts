import { z } from 'zod';

export const saveAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        optionId: z.string().min(1),
      }),
    )
    .min(1)
    .max(100),
});

export type SaveAnswersDto = z.infer<typeof saveAnswersSchema>;
