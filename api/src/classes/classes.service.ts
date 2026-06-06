import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ClassCodeService } from './class-code.service';
import { serializeClass, serializeClassMember, serializeStudentClass } from './class.serializer';
import { CreateClassDto, JoinClassDto } from './dto/class-input.dto';

const MAX_INVITE_CODE_ATTEMPTS = 10;

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly codes: ClassCodeService,
  ) {}

  async listTeacherClasses(user: CurrentUserPayload) {
    const classes = await this.prisma.class.findMany({
      where: { teacherId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { school: true, _count: { select: { members: true } } },
    });
    return { classes: classes.map(serializeClass) };
  }

  async create(user: CurrentUserPayload, dto: CreateClassDto) {
    for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt += 1) {
      try {
        const created = await this.prisma.class.create({
          data: {
            name: dto.name,
            inviteCode: this.codes.generateInviteCode(),
            teacher: { connect: { id: user.id } },
            school: dto.schoolName
              ? {
                  connectOrCreate: {
                    where: { name: dto.schoolName },
                    create: { name: dto.schoolName },
                  },
                }
              : undefined,
          },
          include: { school: true, _count: { select: { members: true } } },
        });
        return { class: serializeClass(created) };
      } catch (error) {
        if (!this.isInviteCodeConflict(error) || attempt === MAX_INVITE_CODE_ATTEMPTS - 1) {
          throw error;
        }
      }
    }
    throw new Error('Unable to allocate a unique class invite code');
  }

  async join(user: CurrentUserPayload, dto: JoinClassDto) {
    const targetClass = await this.prisma.class.findUnique({
      where: { inviteCode: dto.inviteCode },
      include: { school: true, _count: { select: { members: true } } },
    });
    if (!targetClass) throw new NotFoundException({ message: 'Class with this invite code was not found' });

    try {
      await this.prisma.classMember.create({
        data: {
          classId: targetClass.id,
          userId: user.id,
          role: Role.STUDENT,
        },
      });
    } catch (error) {
      if (this.isClassMemberConflict(error)) {
        throw new ConflictException({ message: 'Student is already a member of this class' });
      }
      throw error;
    }

    return { class: serializeStudentClass(targetClass) };
  }

  async members(user: CurrentUserPayload, id: string) {
    await this.ensureTeacherOwnsClass(user.id, id);
    const members = await this.prisma.classMember.findMany({
      where: { classId: id },
      orderBy: { joinedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            grade: true,
            schoolName: true,
          },
        },
      },
    });
    return { members: members.map(serializeClassMember) };
  }

  async regenerateCode(user: CurrentUserPayload, id: string) {
    await this.ensureTeacherOwnsClass(user.id, id);

    for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt += 1) {
      try {
        const updated = await this.prisma.class.update({
          where: { id },
          data: { inviteCode: this.codes.generateInviteCode() },
          include: { school: true, _count: { select: { members: true } } },
        });
        return { class: serializeClass(updated) };
      } catch (error) {
        if (!this.isInviteCodeConflict(error) || attempt === MAX_INVITE_CODE_ATTEMPTS - 1) {
          throw error;
        }
      }
    }
    throw new Error('Unable to allocate a unique class invite code');
  }

  async leave(user: CurrentUserPayload, id: string) {
    const deleted = await this.prisma.classMember.deleteMany({
      where: {
        classId: id,
        userId: user.id,
      },
    });
    if (deleted.count === 0) {
      throw new NotFoundException({ message: 'Class membership not found' });
    }
  }

  async listStudentClasses(user: CurrentUserPayload) {
    const memberships = await this.prisma.classMember.findMany({
      where: { userId: user.id },
      orderBy: { joinedAt: 'desc' },
      include: {
        class: {
          include: { school: true, _count: { select: { members: true } } },
        },
      },
    });
    return {
      classes: memberships.map((membership) => ({
        ...serializeStudentClass(membership.class),
        joinedAt: membership.joinedAt.toISOString(),
      })),
    };
  }

  private async ensureTeacherOwnsClass(teacherId: string, id: string) {
    const existing = await this.prisma.class.findFirst({
      where: { id, teacherId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException({ message: 'Class not found' });
  }

  private isInviteCodeConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('inviteCode')
    );
  }

  private isClassMemberConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('classId') &&
      error.meta.target.includes('userId')
    );
  }
}
