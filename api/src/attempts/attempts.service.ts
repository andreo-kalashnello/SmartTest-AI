//src/attempts/attempts.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AttemptStatus } from '@prisma/client';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import {
    answersRecord,
    serializePlayerTest,
    testInclude,
} from '../tests/test.serializer';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { StartAttemptDto } from './dto/start-attempt.dto';

@Injectable()
export class AttemptsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly metrics: MetricsService,
    ) {}

    async start(dto: StartAttemptDto, user?: CurrentUserPayload | null) {
        const test = await this.prisma.test.findUnique({
            where: { pin: dto.pin },
            include: testInclude,
        });
        if (!test)
            throw new NotFoundException({
                message: 'Test with this PIN was not found',
            });
        if (test.questions.length === 0) {
            throw new ConflictException({
                message: 'Test has no questions yet',
            });
        }

        const attempt = await this.prisma.testAttempt.create({
            data: {
                testId: test.id,
                studentName: dto.studentName,
                studentId: user?.role === 'STUDENT' ? user.id : null,
                total: test.questions.length,
            },
        });
        this.metrics.recordAttemptStarted();

        return {
            attemptId: attempt.id,
            test: serializePlayerTest(test),
        };
    }

    async saveAnswers(id: string, dto: SaveAnswersDto) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id },
            include: { test: { include: testInclude } },
        });
        if (!attempt)
            throw new NotFoundException({ message: 'Attempt not found' });
        if (attempt.status === AttemptStatus.COMPLETED) {
            throw new ConflictException({
                message: 'Attempt is already completed',
            });
        }

        const questionById = new Map(
            attempt.test.questions.map((question) => [question.id, question]),
        );
        for (const answer of dto.answers) {
            const question = questionById.get(answer.questionId);
            const option = question?.options.find(
                (item) => item.id === answer.optionId,
            );
            if (!question || !option) {
                throw new BadRequestException({
                    message: 'Answer does not match this test',
                });
            }
        }

        await this.prisma.$transaction(
            dto.answers.map((answer) => {
                const question = questionById.get(answer.questionId);
                const option = question?.options.find(
                    (item) => item.id === answer.optionId,
                );
                return this.prisma.answer.upsert({
                    where: {
                        attemptId_questionId: {
                            attemptId: id,
                            questionId: answer.questionId,
                        },
                    },
                    create: {
                        attemptId: id,
                        questionId: answer.questionId,
                        selectedOptionId: answer.optionId,
                        isCorrect: option?.isCorrect ?? false,
                    },
                    update: {
                        selectedOptionId: answer.optionId,
                        isCorrect: option?.isCorrect ?? false,
                    },
                });
            }),
        );

        const updated = await this.prisma.testAttempt.findUniqueOrThrow({
            where: { id },
            include: { answers: true },
        });
        return { answers: answersRecord(updated.answers) };
    }

    async complete(id: string) {
        const attempt = await this.prisma.testAttempt.findUnique({
            where: { id },
            include: {
                answers: true,
                test: { include: { questions: { select: { id: true } } } },
            },
        });
        if (!attempt)
            throw new NotFoundException({ message: 'Attempt not found' });
        if (attempt.status === AttemptStatus.COMPLETED) {
            throw new ConflictException({
                message: 'Attempt is already completed',
            });
        }

        const total = attempt.test.questions.length;
        const score = attempt.answers.filter(
            (answer) => answer.isCorrect,
        ).length;
        const updated = await this.prisma.testAttempt.update({
            where: { id },
            data: {
                status: AttemptStatus.COMPLETED,
                score,
                total,
                completedAt: new Date(),
            },
            include: { answers: true },
        });
        this.metrics.recordAttemptCompleted();

        return {
            result: {
                id: updated.id,
                testId: updated.testId,
                studentName: updated.studentName,
                answers: answersRecord(updated.answers),
                score: updated.score,
                total: updated.total,
                completedAt: updated.completedAt?.toISOString() ?? null,
            },
        };
    }
}
