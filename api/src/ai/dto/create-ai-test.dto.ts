import { z } from 'zod';
import { generateQuestionsSchema } from './generate-questions.dto';

export const createAiTestSchema = generateQuestionsSchema.extend({
  title: z.string().trim().min(1).max(200).optional(),
});

export type CreateAiTestDto = z.infer<typeof createAiTestSchema>;
