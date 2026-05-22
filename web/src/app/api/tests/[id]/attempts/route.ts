//src/app/api/tests/[id]/attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';

import {
    unauthorized,
    validationError,
} from '@/shared/lib/server/api-response';
import { getCurrentTeacher } from '@/shared/lib/server/current-user';
import { prisma } from '@/shared/lib/server/prisma';
import { idParamsSchema } from '@/shared/lib/server/test-schemas';
import { answersRecord } from '@/shared/lib/server/test-serializer';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const test = await prisma.test.findFirst({
        where: {
            id: params.data.id,
            teacherId: teacher.id,
        },
        select: {
            id: true,
            title: true,
            pin: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!test) {
        return NextResponse.json({ message: 'Test not found' }, { status: 404 });
    }

    const attempts = await prisma.testAttempt.findMany({
        where: {
            testId: test.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            answers: true,
        },
    });

    return NextResponse.json({
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
            studentName: attempt.studentName,
            answers: answersRecord(attempt.answers),
            score: attempt.score,
            total: attempt.total,
            completedAt:
                attempt.completedAt?.toISOString() ??
                attempt.updatedAt.toISOString(),
        })),
    });
}
