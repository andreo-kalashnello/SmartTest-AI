//src/subjects/dto/subject.dto.ts
import { z } from 'zod';

export const subjectInputSchema = z.object({
    name: z.string().trim().min(2).max(120),
    icon: z.string().trim().max(64).optional(),
});

export type SubjectInputDto = z.infer<typeof subjectInputSchema>;
