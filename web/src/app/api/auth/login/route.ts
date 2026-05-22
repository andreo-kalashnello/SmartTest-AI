//src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { validationError } from '@/shared/lib/server/api-response';
import { loginTeacherSchema } from '@/shared/lib/server/auth-schemas';
import { toPublicUser } from '@/shared/lib/server/current-user';
import { verifyPassword } from '@/shared/lib/server/password';
import { prisma } from '@/shared/lib/server/prisma';
import { setSessionCookie } from '@/shared/lib/server/session';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = loginTeacherSchema.safeParse(body);

        if (!parsed.success) {
            return validationError(parsed.error);
        }

        const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: { id: true, email: true, name: true, passwordHash: true },
        });

        if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 },
            );
        }

        const response = NextResponse.json({ user: toPublicUser(user) });
        setSessionCookie(response, user.id);
        return response;
    } catch (error) {
        console.error('POST /api/auth/login failed', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 },
        );
    }
}
