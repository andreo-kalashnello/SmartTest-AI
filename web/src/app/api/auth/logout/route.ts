//src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/shared/lib/server/session';

export async function POST() {
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
}
