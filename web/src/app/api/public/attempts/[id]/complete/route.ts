// src/app/api/public/attempts/[id]/complete/route.ts
import { AttemptStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { validationError } from '@/shared/lib/server/api-response';
import { prisma } from '@/shared/lib/server/prisma';
import { idParamsSchema } from '@/shared/lib/server/test-schemas';
import { answersRecord } from '@/shared/lib/server/test-serializer';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const attempt = await prisma.testAttempt.findUnique({
        where: { id: params.data.id },
        include: {
            answers: true,
            test: {
                include: {
                    questions: {
                        select: { id: true },
                    },
                },
            },
        },
    });

    if (!attempt) {
        return NextResponse.json(
            { message: 'Attempt not found' },
            { status: 404 },
        );
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
        return NextResponse.json(
            { message: 'Attempt is already completed' },
            { status: 409 },
        );
    }

    const total = attempt.test.questions.length;
    const score = attempt.answers.filter((answer) => answer.isCorrect).length;

    const updated = await prisma.testAttempt.update({
        where: { id: params.data.id },
        data: {
            status: AttemptStatus.COMPLETED,
            score,
            total,
            completedAt: new Date(),
        },
        include: { answers: true },
    });

    return NextResponse.json({
        result: {
            id: updated.id,
            testId: updated.testId,
            studentName: updated.studentName,
            answers: answersRecord(updated.answers),
            score: updated.score,
            total: updated.total,
            completedAt: updated.completedAt?.toISOString() ?? null,
        },
    });
}
