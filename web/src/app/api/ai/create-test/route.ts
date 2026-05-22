//src/app/api/ai/create-test/route.ts
import { NextRequest, NextResponse } from 'next/server';

import {
    unauthorized,
    validationError,
} from '@/shared/lib/server/api-response';
import { createAiTestSchema } from '@/shared/lib/server/ai-schemas';
import { getCurrentTeacher } from '@/shared/lib/server/current-user';
import { generateQuestionsWithOpenRouter } from '@/shared/lib/server/openrouter';
import { generateUniquePin } from '@/shared/lib/server/pin';
import { prisma } from '@/shared/lib/server/prisma';
import {
    serializeTeacherTest,
    testInclude,
} from '@/shared/lib/server/test-serializer';

export async function POST(request: NextRequest) {
    const teacher = await getCurrentTeacher();

    if (!teacher) {
        return unauthorized();
    }

    const body = await request.json();
    const parsed = createAiTestSchema.safeParse(body);

    if (!parsed.success) {
        return validationError(parsed.error);
    }

    const result = await generateQuestionsWithOpenRouter(parsed.data);

    if (!result.ok) {
        return NextResponse.json(
            {
                message: result.message,
                details: result.details,
            },
            { status: result.status },
        );
    }

    const test = await prisma.test.create({
        data: {
            title: parsed.data.title ?? parsed.data.topic,
            pin: await generateUniquePin(),
            teacherId: teacher.id,
            questions: {
                create: result.questions.map((question, questionIndex) => ({
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
            },
        },
        include: testInclude,
    });

    return NextResponse.json(
        {
            test: serializeTeacherTest(test),
            model: result.model,
            usage: result.usage,
        },
        { status: 201 },
    );
}
