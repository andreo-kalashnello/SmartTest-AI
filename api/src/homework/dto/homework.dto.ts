//src/homework/dto/homework.dto.ts
import { z } from 'zod';

export const homeworkInputSchema = z.object({
    subjectId: z.string().trim().min(1),
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(5000).optional(),
    dueAt: z.coerce.date().optional(),
});

export const homeworkSubmitSchema = z.object({
  content: z.string().trim().max(8000).optional(),
});

export type HomeworkInputDto = z.infer<typeof homeworkInputSchema>;
export type HomeworkSubmitDto = z.infer<typeof homeworkSubmitSchema>;

export type UploadedHomeworkFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
