//src/app/api/tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import {
    unauthorized,
    validationError,
} from '@/shared/lib/server/api-response';
import { getCurrentTeacher } from '@/shared/lib/server/current-user';
import { prisma } from '@/shared/lib/server/prisma';
import {
    idParamsSchema,
    testInputSchema,
} from '@/shared/lib/server/test-schemas';
import {
    serializeTeacherTest,
    testInclude,
} from '@/shared/lib/server/test-serializer';

type RouteContext = {
    params: Promise<{ id: string }>;
};

async function getTeacherTest(id: string, teacherId: string) {
    return prisma.test.findFirst({
        where: { id, teacherId },
        include: testInclude,
    });
}

export async function GET(_request: NextRequest, context: RouteContext) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const test = await getTeacherTest(params.data.id, teacher.id);

    if (!test) {
        return NextResponse.json(
            { message: 'Test not found' },
            { status: 404 },
        );
    }

    return NextResponse.json({ test: serializeTeacherTest(test) });
}

export async function PUT(request: NextRequest, context: RouteContext) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const body = await request.json();
    const parsed = testInputSchema.safeParse(body);

    if (!parsed.success) {
        return validationError(parsed.error);
    }

    const existing = await prisma.test.findFirst({
        where: { id: params.data.id, teacherId: teacher.id },
        select: { id: true },
    });

    if (!existing) {
        return NextResponse.json(
            { message: 'Test not found' },
            { status: 404 },
        );
    }

    const test = await prisma.$transaction(async (tx) => {
        await tx.question.deleteMany({
            where: { testId: params.data.id },
        });

        return tx.test.update({
            where: { id: params.data.id },
            data: {
                title: parsed.data.title,
                questions: {
                    create: parsed.data.questions.map(
                        (question, questionIndex) => ({
                            prompt: question.prompt,
                            order: questionIndex,
                            options: {
                                create: question.options.map(
                                    (option, optionIndex) => ({
                                        text: option.text,
                                        isCorrect: option.isCorrect,
                                        order: optionIndex,
                                    }),
                                ),
                            },
                        }),
                    ),
                },
            },
            include: testInclude,
        });
    });

    return NextResponse.json({ test: serializeTeacherTest(test) });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const params = idParamsSchema.safeParse(await context.params);

    if (!params.success) {
        return validationError(params.error);
    }

    const existing = await prisma.test.findFirst({
        where: { id: params.data.id, teacherId: teacher.id },
        select: { id: true },
    });

    if (!existing) {
        return NextResponse.json(
            { message: 'Test not found' },
            { status: 404 },
        );
    }

    await prisma.test.delete({
        where: { id: params.data.id },
    });

    return new NextResponse(null, { status: 204 });
}
