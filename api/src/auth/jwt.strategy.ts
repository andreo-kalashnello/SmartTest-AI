import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

function cookieExtractor(request: Request): string | null {
  return request.cookies?.[process.env.COOKIE_ACCESS_NAME || process.env.COOKIE_NAME || 'smarttest_access_token'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
    });
  }

  async validate(payload: { sub: string; email: string; name: string; role: 'TEACHER' | 'STUDENT'; sid: string }) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    });

    if (!session) {
      throw new UnauthorizedException({ message: 'Unauthorized' });
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      sessionId: session.id,
    };
  }
}
