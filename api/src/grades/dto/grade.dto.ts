//src/grades/dto/grade.dto.ts
import { z } from 'zod';

export const gradeInputSchema = z.object({
    studentId: z.string().trim().min(1),
    subjectId: z.string().trim().min(1),
    value: z.coerce.number().int().min(1).max(12),
    type: z.string().trim().min(1).max(80),
    workTitle: z.string().trim().min(1).max(200),
    date: z.coerce.date().optional(),
});

export type GradeInputDto = z.infer<typeof gradeInputSchema>;
