import { Injectable } from '@nestjs/common';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { answersRecord } from '../tests/test.serializer';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classes: ClassesService,
  ) {}

  classesFor(user: CurrentUserPayload) {
    return this.classes.listStudentClasses(user);
  }

  async attempts(user: CurrentUserPayload) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        answers: true,
        test: { select: { id: true, title: true, pin: true } },
      },
    });

    return {
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        testId: attempt.testId,
        test: attempt.test,
        studentName: attempt.studentName,
        status: attempt.status,
        answers: answersRecord(attempt.answers),
        score: attempt.score,
        total: attempt.total,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() ?? null,
      })),
    };
  }
}
