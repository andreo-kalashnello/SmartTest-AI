import { z } from 'zod';

export const startAttemptSchema = z.object({
  pin: z.string().regex(/^\d{6}$/),
  studentName: z.string().trim().min(2).max(120),
});

export type StartAttemptDto = z.infer<typeof startAttemptSchema>;
