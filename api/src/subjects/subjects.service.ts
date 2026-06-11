//src/subjects/subjects.service.ts
import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import {
    serializeSubject,
    serializeSubjectStudent,
} from './subject.serializer';
import { SubjectInputDto } from './dto/subject.dto';

const subjectInclude = {
    _count: { select: { enrollments: true, homework: true, tests: true } },
};

@Injectable()
export class SubjectsService {
    constructor(private readonly prisma: PrismaService) {}

    async list(user: CurrentUserPayload) {
        if (user.role === Role.STUDENT) {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { studentId: user.id },
                orderBy: { createdAt: 'desc' },
                include: { subject: { include: subjectInclude } },
            });
            return {
                subjects: enrollments.map((item) =>
                    serializeSubject(item.subject),
                ),
            };
        }

        const subjects = await this.prisma.subject.findMany({
            where: { teacherId: user.id },
            orderBy: { updatedAt: 'desc' },
            include: subjectInclude,
        });
        return { subjects: subjects.map(serializeSubject) };
    }

    async create(user: CurrentUserPayload, dto: SubjectInputDto) {
        const subject = await this.prisma.subject.create({
            data: {
                teacherId: user.id,
                name: dto.name,
                icon: dto.icon ?? null,
            },
            include: subjectInclude,
        });
        return { subject: serializeSubject(subject) };
    }

    async update(user: CurrentUserPayload, id: string, dto: SubjectInputDto) {
        await this.ensureTeacherOwnsSubject(user.id, id);
        const subject = await this.prisma.subject.update({
            where: { id },
            data: {
                name: dto.name,
                icon: dto.icon ?? null,
            },
            include: subjectInclude,
        });
        return { subject: serializeSubject(subject) };
    }

    async remove(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsSubject(user.id, id);
        await this.prisma.subject.delete({ where: { id } });
    }

    async enroll(user: CurrentUserPayload, id: string) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: subjectInclude,
        });
        if (!subject)
            throw new NotFoundException({ message: 'Subject not found' });

        try {
            await this.prisma.enrollment.create({
                data: {
                    subjectId: id,
                    studentId: user.id,
                },
            });
        } catch (error) {
            if (this.isEnrollmentConflict(error)) {
                throw new ConflictException({
                    message: 'Student is already enrolled in this subject',
                });
            }
            throw error;
        }

        return { subject: serializeSubject(subject) };
    }

    async unenroll(user: CurrentUserPayload, id: string) {
        const result = await this.prisma.enrollment.deleteMany({
            where: {
                subjectId: id,
                studentId: user.id,
            },
        });
        if (result.count === 0)
            throw new NotFoundException({ message: 'Enrollment not found' });
    }

    async students(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsSubject(user.id, id);
        const enrollments = await this.prisma.enrollment.findMany({
            where: { subjectId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        grade: true,
                        schoolName: true,
                    },
                },
            },
        });
        return { students: enrollments.map(serializeSubjectStudent) };
    }

    async ensureTeacherOwnsSubject(teacherId: string, id: string) {
        const subject = await this.prisma.subject.findFirst({
            where: { id, teacherId },
            select: { id: true },
        });
        if (!subject)
            throw new NotFoundException({ message: 'Subject not found' });
    }

    async ensureStudentEnrolled(studentId: string, subjectId: string) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { subjectId_studentId: { subjectId, studentId } },
            select: { id: true },
        });
        if (!enrollment)
            throw new NotFoundException({
                message: 'Subject enrollment not found',
            });
    }

    private isEnrollmentConflict(error: unknown) {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' &&
            Array.isArray(error.meta?.target) &&
            error.meta.target.includes('subjectId') &&
            error.meta.target.includes('studentId')
        );
    }
}
