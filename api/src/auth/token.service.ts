import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: 'TEACHER' | 'STUDENT';
  sid: string;
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: 'refresh';
};

function parseDurationMs(value: string | undefined, fallback: string): number {
  const raw = value ?? fallback;
  const match = /^(\d+)(ms|s|m|h|d)?$/.exec(raw.trim());
  if (!match) return parseDurationMs(fallback, '7d');
  const amount = Number(match[1]);
  const unit = match[2] ?? 'ms';
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  generateAccessToken(payload: AccessTokenPayload) {
    return this.jwt.sign(
      {
        email: payload.email,
        name: payload.name,
        role: payload.role,
        sid: payload.sid,
      },
      {
        subject: payload.sub,
        secret: this.accessSecret,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    );
  }

  generateRefreshToken(payload: RefreshTokenPayload) {
    return this.jwt.sign(
      {
        sid: payload.sid,
        type: 'refresh',
      },
      {
        subject: payload.sub,
        secret: this.refreshSecret,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, { secret: this.accessSecret });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = this.jwt.verify<RefreshTokenPayload>(token, { secret: this.refreshSecret });
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }
    return payload;
  }

  hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  get accessCookieMaxAgeMs() {
    return parseDurationMs(process.env.JWT_ACCESS_EXPIRES_IN, '15m');
  }

  get refreshCookieMaxAgeMs() {
    return parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN, '7d');
  }

  refreshExpiresAt() {
    return new Date(Date.now() + this.refreshCookieMaxAgeMs);
  }

  private get accessSecret() {
    return process.env.JWT_ACCESS_SECRET || 'change-me-access-secret';
  }

  private get refreshSecret() {
    return process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret';
  }
}
