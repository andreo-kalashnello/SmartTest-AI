import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
  role: z.enum(['TEACHER', 'STUDENT']).default('TEACHER'),
  grade: z.string().trim().max(20).optional(),
  classCode: z.string().trim().max(32).optional(),
  schoolName: z.string().trim().max(120).optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
