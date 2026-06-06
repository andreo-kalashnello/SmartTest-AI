import { Class, ClassMember, School, User } from '@prisma/client';

type ClassWithSchoolAndCount = Class & {
  school: School | null;
  _count?: { members: number };
};

type ClassMemberWithUser = ClassMember & {
  user: Pick<User, 'id' | 'email' | 'name' | 'role' | 'grade' | 'schoolName'>;
};

export function serializeClass(item: ClassWithSchoolAndCount) {
  return {
    id: item.id,
    name: item.name,
    inviteCode: item.inviteCode,
    teacherId: item.teacherId,
    school: item.school ? { id: item.school.id, name: item.school.name } : null,
    memberCount: item._count?.members ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeStudentClass(item: ClassWithSchoolAndCount) {
  return {
    id: item.id,
    name: item.name,
    teacherId: item.teacherId,
    school: item.school ? { id: item.school.id, name: item.school.name } : null,
    memberCount: item._count?.members ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeClassMember(member: ClassMemberWithUser) {
  return {
    id: member.id,
    classId: member.classId,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
    user: {
      id: member.user.id,
      email: member.user.email,
      name: member.user.name,
      role: member.user.role,
      grade: member.user.grade,
      schoolName: member.user.schoolName,
    },
  };
}
