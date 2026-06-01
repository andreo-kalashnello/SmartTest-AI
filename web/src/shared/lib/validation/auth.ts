import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Мінімум 6 символів"),
});

export const registerSchema = z
  .object({
    role: z.enum(["teacher", "student"]),
    name: z.string().min(2, "Мінімум 2 символи"),
    email: z.string().email("Введіть коректний email"),
    password: z.string().min(6, "Мінімум 6 символів"),
    grade: z.string().max(20).optional(),
    classCode: z
      .string()
      .max(32, "Код занадто довгий")
      .optional()
      .or(z.literal("")),
    schoolName: z.string().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.grade?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Вкажіть клас (напр. 10-А)",
        path: ["grade"],
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
