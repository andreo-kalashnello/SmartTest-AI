//src/homework/homework.service.ts
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import {
    HomeworkInputDto,
    HomeworkSubmitDto,
    UploadedHomeworkFile,
} from './dto/homework.dto';
import {
    serializeHomework,
    serializeHomeworkSubmission,
    serializeStudentHomework,
} from './homework.serializer';

const HOMEWORK_UPLOAD_MAX_BYTES = Number(
    process.env.HOMEWORK_UPLOAD_MAX_BYTES || 5 * 1024 * 1024,
);
const HOMEWORK_ALLOWED_UPLOAD_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
]);

const homeworkInclude = {
    subject: { select: { id: true, name: true, icon: true } },
    _count: { select: { submissions: true } },
};

@Injectable()
export class HomeworkService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly subjects: SubjectsService,
    ) {}

    async listTeacherHomework(user: CurrentUserPayload) {
        const homework = await this.prisma.homework.findMany({
            where: { teacherId: user.id },
            orderBy: { createdAt: 'desc' },
            include: homeworkInclude,
        });
        return { homework: homework.map(serializeHomework) };
    }

    async create(user: CurrentUserPayload, dto: HomeworkInputDto) {
        await this.subjects.ensureTeacherOwnsSubject(user.id, dto.subjectId);
        const homework = await this.prisma.homework.create({
            data: {
                teacherId: user.id,
                subjectId: dto.subjectId,
                title: dto.title,
                description: dto.description ?? null,
                dueAt: dto.dueAt ?? null,
            },
            include: homeworkInclude,
        });
        return { homework: serializeHomework(homework) };
    }

    async update(user: CurrentUserPayload, id: string, dto: HomeworkInputDto) {
        await this.ensureTeacherOwnsHomework(user.id, id);
        await this.subjects.ensureTeacherOwnsSubject(user.id, dto.subjectId);
        const homework = await this.prisma.homework.update({
            where: { id },
            data: {
                subjectId: dto.subjectId,
                title: dto.title,
                description: dto.description ?? null,
                dueAt: dto.dueAt ?? null,
            },
            include: homeworkInclude,
        });
        return { homework: serializeHomework(homework) };
    }

    async remove(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsHomework(user.id, id);
        await this.prisma.homework.delete({ where: { id } });
    }

    async uploadAttachment(
        user: CurrentUserPayload,
        id: string,
        file: UploadedHomeworkFile | undefined,
    ) {
        await this.ensureTeacherOwnsHomework(user.id, id);
        const normalized = this.normalizeFile(file);
        const homework = await this.prisma.homework.update({
            where: { id },
            data: {
                attachmentName: normalized.originalname,
                attachmentMimeType: normalized.mimetype,
                attachmentSize: normalized.size,
                attachmentData: normalized.data,
            },
            include: homeworkInclude,
        });
        return { homework: serializeHomework(homework) };
    }

    async removeAttachment(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsHomework(user.id, id);
        await this.prisma.homework.update({
            where: { id },
            data: {
                attachmentName: null,
                attachmentMimeType: null,
                attachmentSize: null,
                attachmentData: null,
            },
        });
    }

    async downloadAttachment(user: CurrentUserPayload, id: string) {
        const homework = await this.prisma.homework.findUnique({
            where: { id },
            select: {
                teacherId: true,
                subjectId: true,
                attachmentName: true,
                attachmentMimeType: true,
                attachmentData: true,
            },
        });
        if (!homework)
            throw new NotFoundException({ message: 'Homework not found' });
        if (user.role === 'TEACHER') {
            if (homework.teacherId !== user.id)
                throw new NotFoundException({ message: 'Homework not found' });
        } else {
            await this.subjects.ensureStudentEnrolled(
                user.id,
                homework.subjectId,
            );
        }
        if (!homework.attachmentName || !homework.attachmentData) {
            throw new NotFoundException({
                message: 'Homework attachment not found',
            });
        }
        return {
            fileName: homework.attachmentName,
            mimeType: homework.attachmentMimeType ?? 'application/octet-stream',
            data: homework.attachmentData,
        };
    }

    async listStudentHomework(user: CurrentUserPayload) {
        const homework = await this.prisma.homework.findMany({
            where: {
                subject: {
                    enrollments: {
                        some: { studentId: user.id },
                    },
                },
            },
            orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
            include: {
                ...homeworkInclude,
                submissions: {
                    where: { studentId: user.id },
                    take: 1,
                },
            },
        });
        return { homework: homework.map(serializeStudentHomework) };
    }

    async submit(
        user: CurrentUserPayload,
        id: string,
        dto: HomeworkSubmitDto,
        file?: UploadedHomeworkFile,
    ) {
        const homework = await this.prisma.homework.findUnique({
            where: { id },
            select: { id: true, subjectId: true },
        });
        if (!homework)
            throw new NotFoundException({ message: 'Homework not found' });
        await this.subjects.ensureStudentEnrolled(user.id, homework.subjectId);

        const normalized = file ? this.normalizeFile(file) : null;
        const submission = await this.prisma.homeworkSubmit.upsert({
            where: {
                homeworkId_studentId: {
                    homeworkId: id,
                    studentId: user.id,
                },
            },
            create: {
                homeworkId: id,
                studentId: user.id,
                content: dto.content ?? null,
                attachmentName: normalized?.originalname ?? null,
                attachmentMimeType: normalized?.mimetype ?? null,
                attachmentSize: normalized?.size ?? null,
                attachmentData: normalized?.data ?? null,
            },
            update: {
                content: dto.content ?? null,
                ...(normalized
                    ? {
                          attachmentName: normalized.originalname,
                          attachmentMimeType: normalized.mimetype,
                          attachmentSize: normalized.size,
                          attachmentData: normalized.data,
                      }
                    : {}),
                submittedAt: new Date(),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        grade: true,
                        schoolName: true,
                    },
                },
            },
        });
        return { submission: serializeHomeworkSubmission(submission) };
    }

    async submissions(user: CurrentUserPayload, id: string) {
        await this.ensureTeacherOwnsHomework(user.id, id);
        const submissions = await this.prisma.homeworkSubmit.findMany({
            where: { homeworkId: id },
            orderBy: { submittedAt: 'desc' },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        grade: true,
                        schoolName: true,
                    },
                },
            },
        });
        return { submissions: submissions.map(serializeHomeworkSubmission) };
    }

    async downloadSubmissionAttachment(
        user: CurrentUserPayload,
        homeworkId: string,
        submissionId: string,
    ) {
        const submission = await this.prisma.homeworkSubmit.findFirst({
            where: { id: submissionId, homeworkId },
            include: {
                homework: { select: { teacherId: true } },
            },
        });
        if (!submission)
            throw new NotFoundException({
                message: 'Homework submission not found',
            });
        if (user.role === 'TEACHER') {
            if (submission.homework.teacherId !== user.id)
                throw new NotFoundException({
                    message: 'Homework submission not found',
                });
        } else if (submission.studentId !== user.id) {
            throw new NotFoundException({
                message: 'Homework submission not found',
            });
        }
        if (!submission.attachmentName || !submission.attachmentData) {
            throw new NotFoundException({
                message: 'Submission attachment not found',
            });
        }
        return {
            fileName: submission.attachmentName,
            mimeType:
                submission.attachmentMimeType ?? 'application/octet-stream',
            data: submission.attachmentData,
        };
    }

    async ensureTeacherOwnsHomework(teacherId: string, id: string) {
        const homework = await this.prisma.homework.findFirst({
            where: { id, teacherId },
            select: { id: true },
        });
        if (!homework)
            throw new NotFoundException({ message: 'Homework not found' });
    }

    private normalizeFile(file: UploadedHomeworkFile | undefined) {
        if (!file)
            throw new BadRequestException({
                message: 'File is required (field name: file)',
            });
        if (file.size > HOMEWORK_UPLOAD_MAX_BYTES) {
            throw new BadRequestException({
                message: `File is too large (max ${Math.round(HOMEWORK_UPLOAD_MAX_BYTES / 1024 / 1024)} MB)`,
            });
        }
        const mimeType = this.normalizeMime(file.originalname, file.mimetype);
        if (!HOMEWORK_ALLOWED_UPLOAD_TYPES.has(mimeType)) {
            throw new BadRequestException({
                message: 'Allowed formats: PDF, DOC, DOCX, TXT, JPG, PNG, WEBP',
            });
        }
        return {
            originalname: file.originalname,
            mimetype: mimeType,
            size: file.size,
            data: this.toDatabaseBytes(file.buffer),
        };
    }

    private toDatabaseBytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
        const bytes = new Uint8Array(buffer.byteLength);
        bytes.set(buffer);
        return bytes as Uint8Array<ArrayBuffer>;
    }

    private normalizeMime(fileName: string, mimeType: string) {
        if (mimeType) return mimeType;
        const name = fileName.toLowerCase();
        if (name.endsWith('.pdf')) return 'application/pdf';
        if (name.endsWith('.doc')) return 'application/msword';
        if (name.endsWith('.docx'))
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (name.endsWith('.txt')) return 'text/plain';
        if (name.endsWith('.png')) return 'image/png';
        if (name.endsWith('.webp')) return 'image/webp';
        if (name.endsWith('.jpg') || name.endsWith('.jpeg'))
            return 'image/jpeg';
        return 'application/octet-stream';
    }
}
