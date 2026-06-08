//src/subjects/subject.serializer.ts
import { Enrollment, Subject, User } from '@prisma/client';

type SubjectWithCounts = Subject & {
    _count?: {
        enrollments: number;
        homework: number;
        tests: number;
    };
};

type EnrollmentWithStudent = Enrollment & {
    student: Pick<
        User,
        'id' | 'email' | 'name' | 'role' | 'grade' | 'schoolName'
    >;
};

export function serializeSubject(subject: SubjectWithCounts) {
    return {
        id: subject.id,
        teacherId: subject.teacherId,
        name: subject.name,
        icon: subject.icon,
        studentCount: subject._count?.enrollments ?? 0,
        homeworkCount: subject._count?.homework ?? 0,
        testCount: subject._count?.tests ?? 0,
        createdAt: subject.createdAt.toISOString(),
        updatedAt: subject.updatedAt.toISOString(),
    };
}

export function serializeSubjectStudent(enrollment: EnrollmentWithStudent) {
    return {
        id: enrollment.student.id,
        email: enrollment.student.email,
        name: enrollment.student.name,
        role: enrollment.student.role,
        grade: enrollment.student.grade,
        schoolName: enrollment.student.schoolName,
        enrolledAt: enrollment.createdAt.toISOString(),
    };
}
