import { z } from "zod";

export const registerTeacherSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
});

export const loginTeacherSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
});
