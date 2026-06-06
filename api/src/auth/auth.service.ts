import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { CurrentUserPayload } from './current-user.decorator';
import { TokenService } from './token.service';

const ACCESS_COOKIE_NAME =
  process.env.COOKIE_ACCESS_NAME || process.env.COOKIE_NAME || 'smarttest_access_token';
const REFRESH_COOKIE_NAME =
  process.env.COOKIE_REFRESH_NAME || 'smarttest_refresh_token';

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
    path: '/',
    maxAge,
  };
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  grade?: string | null;
  schoolName?: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    grade: user.grade ?? null,
    schoolName: user.schoolName ?? null,
  };
}

function tokenHashesEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: RegisterUserDto, request: Request, response: Response) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash: await this.passwords.hash(dto.password),
          role: dto.role,
          grade: dto.grade ?? null,
          schoolName: dto.schoolName ?? null,
        },
        select: userSelect,
      });

      await this.startSession(user, request, response);
      return { user: toPublicUser(user) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException({ message: 'User with this email already exists' });
      }
      throw error;
    }
  }

  async login(dto: LoginDto, request: Request, response: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { ...userSelect, passwordHash: true },
    });

    if (!user || !(await this.passwords.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    await this.startSession(user, request, response);
    return { user: toPublicUser(user) };
  }

  me(user: CurrentUserPayload) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException({ message: 'Refresh token is required' });
    }

    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        refreshTokenHash: true,
        user: { select: userSelect },
      },
    });

    if (!session || !tokenHashesEqual(session.refreshTokenHash, this.tokens.hashRefreshToken(refreshToken))) {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    const nextRefreshToken = this.tokens.generateRefreshToken({
      sub: session.user.id,
      sid: session.id,
      type: 'refresh',
    });
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: this.tokens.hashRefreshToken(nextRefreshToken),
        expiresAt: this.tokens.refreshExpiresAt(),
      },
    });

    this.setAuthCookies(response, session.user, session.id, nextRefreshToken);
    return { user: toPublicUser(session.user) };
  }

  async logout(user: CurrentUserPayload, response: Response) {
    await this.prisma.session.updateMany({
      where: {
        id: user.sessionId,
        userId: user.id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    this.clearAuthCookies(response);
    return { message: 'Logged out' };
  }

  private async startSession(
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      grade?: string | null;
      schoolName?: string | null;
    },
    request: Request,
    response: Response,
  ) {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        expiresAt: this.tokens.refreshExpiresAt(),
      },
      select: { id: true },
    });

    const refreshToken = this.tokens.generateRefreshToken({
      sub: user.id,
      sid: session.id,
      type: 'refresh',
    });

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: this.tokens.hashRefreshToken(refreshToken) },
    });

    this.setAuthCookies(response, user, session.id, refreshToken);
  }

  private setAuthCookies(
    response: Response,
    user: { id: string; email: string; name: string; role: Role },
    sessionId: string,
    refreshToken: string,
  ) {
    const accessToken = this.tokens.generateAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sid: sessionId,
    });

    response.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(this.tokens.accessCookieMaxAgeMs));
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(this.tokens.refreshCookieMaxAgeMs));
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
    response.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
  }
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  grade: true,
  schoolName: true,
} satisfies Prisma.UserSelect;
