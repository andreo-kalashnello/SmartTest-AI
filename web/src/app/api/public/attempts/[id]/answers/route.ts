//src/app/api/public/attempts/[id]/answers/route.ts
import { AttemptStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { validationError } from '@/shared/lib/server/api-response';
import { prisma } from '@/shared/lib/server/prisma';
import {
    idParamsSchema,
    saveAnswersSchema,
} from '@/shared/lib/server/test-schemas';
import {
    answersRecord,
    testInclude,
} from '@/shared/lib/server/test-serializer';

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const body = await request.json();
    const parsed = saveAnswersSchema.safeParse(body);

    if (!parsed.success) {
        return validationError(parsed.error);
    }

    const attempt = await prisma.testAttempt.findUnique({
        where: { id: params.data.id },
        include: {
            test: {
                include: testInclude,
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

    const questionById = new Map(
        attempt.test.questions.map((question) => [question.id, question]),
    );

    for (const answer of parsed.data.answers) {
        const question = questionById.get(answer.questionId);
        const option = question?.options.find(
            (item) => item.id === answer.optionId,
        );

        if (!question || !option) {
            return NextResponse.json(
                { message: 'Answer does not match this test' },
                { status: 400 },
            );
        }
    }

    await prisma.$transaction(
        parsed.data.answers.map((answer) => {
            const question = questionById.get(answer.questionId);
            const option = question?.options.find(
                (item) => item.id === answer.optionId,
            );

            return prisma.answer.upsert({
                where: {
                    attemptId_questionId: {
                        attemptId: params.data.id,
                        questionId: answer.questionId,
                    },
                },
                create: {
                    attemptId: params.data.id,
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

    const updated = await prisma.testAttempt.findUniqueOrThrow({
        where: { id: params.data.id },
        include: { answers: true },
    });

    return NextResponse.json({
        answers: answersRecord(updated.answers),
    });
}
