//src/app/api/tests/route.ts
import { NextRequest, NextResponse } from 'next/server';

import {
    unauthorized,
    validationError,
} from '@/shared/lib/server/api-response';
import { getCurrentTeacher } from '@/shared/lib/server/current-user';
import { generateUniquePin } from '@/shared/lib/server/pin';
import { prisma } from '@/shared/lib/server/prisma';
import { testInputSchema } from '@/shared/lib/server/test-schemas';
import {
    serializeTeacherTest,
    testInclude,
} from '@/shared/lib/server/test-serializer';

export async function GET() {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const tests = await prisma.test.findMany({
        where: { teacherId: teacher.id },
        orderBy: { updatedAt: 'desc' },
        include: testInclude,
    });

    return NextResponse.json({
        tests: tests.map(serializeTeacherTest),
    });
}

export async function POST(request: NextRequest) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const body = await request.json();
    const parsed = testInputSchema.safeParse(body);

    if (!parsed.success) {
        return validationError(parsed.error);
    }

    const test = await prisma.test.create({
        data: {
            title: parsed.data.title,
            pin: await generateUniquePin(),
            teacherId: teacher.id,
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

    return NextResponse.json(
        { test: serializeTeacherTest(test) },
        { status: 201 },
    );
}
