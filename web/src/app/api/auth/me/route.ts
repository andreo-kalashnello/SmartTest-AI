//src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';

import { unauthorized } from '@/shared/lib/server/api-response';
import {
    getCurrentTeacher,
    toPublicUser,
} from '@/shared/lib/server/current-user';

export async function GET() {
    const user = await getCurrentTeacher();

    if (!user) {
        return unauthorized();
    }

    return NextResponse.json({ user: toPublicUser(user) });
}
