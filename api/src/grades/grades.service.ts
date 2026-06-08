//src/grades/grades.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { GradeInputDto } from './dto/grade.dto';
import { serializeGrade } from './grade.serializer';

const gradeInclude = {
    subject: { select: { id: true, name: true, icon: true } },
    student: {
        select: {
            id: true,
            email: true,
            name: true,
            grade: true,
            schoolName: true,
        },
    },
};

@Injectable()
export class GradesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly subjects: SubjectsService,
    ) {}

    async listTeacherGrades(user: CurrentUserPayload) {
        const grades = await this.prisma.grade.findMany({
            where: { teacherId: user.id },
            orderBy: { date: 'desc' },
            include: gradeInclude,
        });
        return { grades: grades.map(serializeGrade) };
    }

    async create(user: CurrentUserPayload, dto: GradeInputDto) {
        await this.validateTeacherGradeInput(user.id, dto);
        const grade = await this.prisma.grade.create({
            data: {
                teacherId: user.id,
                studentId: dto.studentId,
                subjectId: dto.subjectId,
                value: dto.value,
                type: dto.type,
                workTitle: dto.workTitle,
                date: dto.date ?? new Date(),
            },
            include: gradeInclude,
        });
        return { grade: serializeGrade(grade) };
    }

    async update(user: CurrentUserPayload, id: string, dto: GradeInputDto) {
        await this.ensureTeacherOwnsGrade(user.id, id);
        await this.validateTeacherGradeInput(user.id, dto);
        const grade = await this.prisma.grade.update({
            where: { id },
            data: {
                studentId: dto.studentId,
                subjectId: dto.subjectId,
                value: dto.value,
                type: dto.type,
                workTitle: dto.workTitle,
                date: dto.date ?? new Date(),
            },
            include: gradeInclude,
        });
        return { grade: serializeGrade(grade) };
    }

    async remove(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsGrade(user.id, id);
        await this.prisma.grade.delete({ where: { id } });
    }

    async myGrades(user: CurrentUserPayload) {
        const grades = await this.prisma.grade.findMany({
            where: { studentId: user.id },
            orderBy: { date: 'desc' },
            include: gradeInclude,
        });
        return { grades: grades.map(serializeGrade) };
    }

    private async validateTeacherGradeInput(
        teacherId: string,
        dto: GradeInputDto,
    ) {
        await this.subjects.ensureTeacherOwnsSubject(teacherId, dto.subjectId);
        const student = await this.prisma.user.findFirst({
            where: { id: dto.studentId, role: Role.STUDENT },
            select: { id: true },
        });
        if (!student)
            throw new NotFoundException({ message: 'Student not found' });

        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                subjectId_studentId: {
                    subjectId: dto.subjectId,
                    studentId: dto.studentId,
                },
            },
            select: { id: true },
        });
        if (!enrollment) {
            throw new BadRequestException({
                message: 'Student is not enrolled in this subject',
            });
        }
    }

    private async ensureTeacherOwnsGrade(teacherId: string, id: string) {
        const grade = await this.prisma.grade.findFirst({
            where: { id, teacherId },
            select: { id: true },
        });
        if (!grade) throw new NotFoundException({ message: 'Grade not found' });
    }
}
