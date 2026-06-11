//src/grades/grade.serializer.ts
import { Grade, Subject, User } from '@prisma/client';

type GradeWithRelations = Grade & {
    subject: Pick<Subject, 'id' | 'name' | 'icon'>;
    student: Pick<User, 'id' | 'email' | 'name' | 'grade' | 'schoolName'>;
};

export function serializeGrade(grade: GradeWithRelations) {
    return {
        id: grade.id,
        studentId: grade.studentId,
        teacherId: grade.teacherId,
        subjectId: grade.subjectId,
        subject: grade.subject,
        student: grade.student,
        value: grade.value,
        type: grade.type,
        workTitle: grade.workTitle,
        date: grade.date.toISOString(),
        createdAt: grade.createdAt.toISOString(),
        updatedAt: grade.updatedAt.toISOString(),
    };
}
