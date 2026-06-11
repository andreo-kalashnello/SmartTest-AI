import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = 'password123';
  const passwordHash = await argon2.hash(password);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: { name: 'Seed Teacher' },
    create: {
      email: 'teacher@example.com',
      name: 'Seed Teacher',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const existingSubject = await prisma.subject.findFirst({ where: { teacherId: teacher.id, name: 'Mathematics' } });
  if (!existingSubject) {
    await prisma.subject.create({ data: { teacherId: teacher.id, name: 'Mathematics' } });
  }

  console.log(`Created teacher ${teacher.email} with password '${password}'`);
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
