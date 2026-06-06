import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { MAX_PIN_CREATE_ATTEMPTS, assertCanRetryPin, isPinUniqueConflict } from './pin-conflict';
import { PinService } from './pin.service';
import { TestInputDto } from './dto/test-input.dto';
import { answersRecord, serializeTeacherTest, testInclude } from './test.serializer';

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pins: PinService,
  ) {}

  async list(user: CurrentUserPayload) {
    const tests = await this.prisma.test.findMany({
      where: { teacherId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: testInclude,
    });
    return { tests: tests.map(serializeTeacherTest) };
  }

  async create(user: CurrentUserPayload, dto: TestInputDto) {
    for (let attempt = 0; attempt < MAX_PIN_CREATE_ATTEMPTS; attempt += 1) {
      try {
        const test = await this.prisma.test.create({
          data: {
            title: dto.title,
            pin: this.pins.generatePin(),
            teacherId: user.id,
            questions: this.nestedQuestions(dto),
          },
          include: testInclude,
        });
        return { test: serializeTeacherTest(test) };
      } catch (error) {
        if (!isPinUniqueConflict(error)) throw error;
        assertCanRetryPin(attempt);
      }
    }
    throw new Error('Unable to allocate a unique test PIN');
  }

  async get(user: CurrentUserPayload, id: string) {
    const test = await this.getOwnedTest(user.id, id);
    return { test: serializeTeacherTest(test) };
  }

  async update(user: CurrentUserPayload, id: string, dto: TestInputDto) {
    await this.ensureOwned(user.id, id);
    const test = await this.prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { testId: id } });
      return tx.test.update({
        where: { id },
        data: {
          title: dto.title,
          questions: this.nestedQuestions(dto),
        },
        include: testInclude,
      });
    });
    return { test: serializeTeacherTest(test) };
  }

  async remove(user: CurrentUserPayload, id: string) {
    await this.ensureOwned(user.id, id);
    await this.prisma.test.delete({ where: { id } });
  }

  async attempts(user: CurrentUserPayload, id: string) {
    const test = await this.prisma.test.findFirst({
      where: { id, teacherId: user.id },
      select: { id: true, title: true, pin: true, createdAt: true, updatedAt: true },
    });
    if (!test) throw new NotFoundException({ message: 'Test not found' });

    const attempts = await this.prisma.testAttempt.findMany({
      where: { testId: test.id },
      orderBy: { createdAt: 'desc' },
      include: {
        answers: true,
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

    return {
      test: {
        id: test.id,
        title: test.title,
        pin: test.pin,
        questions: [],
        createdAt: test.createdAt.toISOString(),
        updatedAt: test.updatedAt.toISOString(),
      },
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        testId: attempt.testId,
        studentId: attempt.studentId,
        studentName: attempt.studentName,
        student: attempt.student,
        status: attempt.status,
        answers: answersRecord(attempt.answers),
        score: attempt.score,
        total: attempt.total,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() ?? attempt.updatedAt.toISOString(),
      })),
    };
  }

  private async getOwnedTest(teacherId: string, id: string) {
    const test = await this.prisma.test.findFirst({ where: { id, teacherId }, include: testInclude });
    if (!test) throw new NotFoundException({ message: 'Test not found' });
    return test;
  }

  private async ensureOwned(teacherId: string, id: string) {
    const existing = await this.prisma.test.findFirst({ where: { id, teacherId }, select: { id: true } });
    if (!existing) throw new NotFoundException({ message: 'Test not found' });
  }

  private nestedQuestions(dto: TestInputDto) {
    return {
      create: dto.questions.map((question, questionIndex) => ({
        prompt: question.prompt,
        order: questionIndex,
        options: {
          create: question.options.map((option, optionIndex) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: optionIndex,
          })),
        },
      })),
    };
  }
}
