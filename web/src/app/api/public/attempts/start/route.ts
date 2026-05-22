//src/app/api/public/attempts/start/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { validationError } from '@/shared/lib/server/api-response';
import { prisma } from '@/shared/lib/server/prisma';
import { startAttemptSchema } from '@/shared/lib/server/test-schemas';
import {
    serializePlayerTest,
    testInclude,
} from '@/shared/lib/server/test-serializer';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const parsed = startAttemptSchema.safeParse(body);

    if (!parsed.success) {
        return validationError(parsed.error);
    }

    const test = await prisma.test.findUnique({
        where: { pin: parsed.data.pin },
        include: testInclude,
    });

    if (!test) {
        return NextResponse.json(
            { message: 'Test with this PIN was not found' },
            { status: 404 },
        );
    }

    if (test.questions.length === 0) {
        return NextResponse.json(
            { message: 'Test has no questions yet' },
            { status: 409 },
        );
    }

    const attempt = await prisma.testAttempt.create({
        data: {
            testId: test.id,
            studentName: parsed.data.studentName,
            total: test.questions.length,
        },
    });

    return NextResponse.json(
        {
            attemptId: attempt.id,
            test: serializePlayerTest(test),
        },
        { status: 201 },
    );
}
