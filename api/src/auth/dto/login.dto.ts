import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
});

export type LoginDto = z.infer<typeof loginSchema>;
