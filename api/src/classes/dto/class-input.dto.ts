import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().trim().min(2).max(120),
  schoolName: z.string().trim().min(2).max(160).optional(),
});

export const joinClassSchema = z.object({
  inviteCode: z.string().trim().min(4).max(32).transform((code) => code.toUpperCase()),
});

export type CreateClassDto = z.infer<typeof createClassSchema>;
export type JoinClassDto = z.infer<typeof joinClassSchema>;
