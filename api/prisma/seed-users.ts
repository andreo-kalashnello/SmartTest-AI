import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users: teacher1 and student1...');

  const password = 'password123';
  const passwordHash = await argon2.hash(password);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher1@example.com' },
    update: { name: 'teacher1' },
    create: {
      email: 'teacher1@example.com',
      name: 'teacher1',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: { name: 'student1' },
    create: {
      email: 'student1@example.com',
      name: 'student1',
      passwordHash,
      role: 'STUDENT',
      grade: '10',
      schoolName: 'Demo School',
    },
  });

  // ensure a demo subject for the teacher exists
  let subject = await prisma.subject.findFirst({ where: { teacherId: teacher.id, name: 'Demo Subject' } });
  if (!subject) {
    subject = await prisma.subject.create({ data: { teacherId: teacher.id, name: 'Demo Subject' } });
  }

  // enroll the student to the demo subject
  const existingEnrollment = await prisma.enrollment.findFirst({ where: { subjectId: subject.id, studentId: student.id } });
  if (!existingEnrollment) {
    await prisma.enrollment.create({ data: { subjectId: subject.id, studentId: student.id } });
  }

  console.log(`Created/updated teacher: ${teacher.email}`);
  console.log(`Created/updated student: ${student.email}`);
  console.log(`Demo subject id: ${subject.id}`);
  console.log(`Password for both accounts: '${password}'`);
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
