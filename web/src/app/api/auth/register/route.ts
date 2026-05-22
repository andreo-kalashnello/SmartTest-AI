//src/app/api/auth/register/route.ts
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { validationError } from '@/shared/lib/server/api-response';
import { hashPassword } from '@/shared/lib/server/password';
import { prisma } from '@/shared/lib/server/prisma';
import { registerTeacherSchema } from '@/shared/lib/server/auth-schemas';
import { setSessionCookie } from '@/shared/lib/server/session';
import { toPublicUser } from '@/shared/lib/server/current-user';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = registerTeacherSchema.safeParse(body);

        if (!parsed.success) {
            return validationError(parsed.error);
        }

        const user = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                passwordHash: hashPassword(parsed.data.password),
            },
            select: { id: true, email: true, name: true },
        });

        const response = NextResponse.json(
            { user: toPublicUser(user) },
            { status: 201 },
        );
        setSessionCookie(response, user.id);
        return response;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 },
            );
        }

        console.error('POST /api/auth/register failed', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 },
        );
    }
}
