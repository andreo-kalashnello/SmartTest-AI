import { z } from "zod";

export const joinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{6}$/, "PIN — 6 цифр"),
  studentName: z.string().min(2, "Введіть ПІБ (мінімум 2 символи)"),
});

export type JoinFormValues = z.infer<typeof joinSchema>;
