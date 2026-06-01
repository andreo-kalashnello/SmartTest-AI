import { z } from "zod";

export const registerTeacherSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
});

/** Реєстрація з роллю (role зберігається в відповіді; у БД — після міграції) */
export const registerUserSchema = registerTeacherSchema.extend({
  role: z.enum(["TEACHER", "STUDENT"]).default("TEACHER"),
  grade: z.string().trim().max(20).optional(),
  classCode: z.string().trim().max(32).optional(),
  schoolName: z.string().trim().max(120).optional(),
});

export const loginTeacherSchema = z.object({
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(200),
});
