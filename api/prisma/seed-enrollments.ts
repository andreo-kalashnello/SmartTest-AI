import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Ensuring enrollments for all students in all subjects...');

  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  const subjects = await prisma.subject.findMany();

  let created = 0;
  for (const subj of subjects) {
    for (const stud of students) {
      const exists = await prisma.enrollment.findFirst({ where: { subjectId: subj.id, studentId: stud.id } });
      if (!exists) {
        await prisma.enrollment.create({ data: { subjectId: subj.id, studentId: stud.id } });
        created++;
        console.log(`Enrolled ${stud.email} -> ${subj.name}`);
      }
    }
  }

  console.log(`Total enrollments created: ${created}`);

  // report how many homeworks each student can now see
  for (const stud of students) {
    const count = await prisma.homework.count({ where: { subject: { enrollments: { some: { studentId: stud.id } } } } });
    console.log(`${stud.email} can see ${count} homework items`);
  }
}

main()
  .catch((e) => {
    console.error('Seed enrollments error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
