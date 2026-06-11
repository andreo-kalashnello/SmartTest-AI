import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding full demo dataset...');

  const password = 'password123';
  const passwordHash = await argon2.hash(password);

  // teacher
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

  // create several students
  const studentsData = [
    { email: 'student1@example.com', name: 'student1' },
    { email: 'student2@example.com', name: 'student2' },
    { email: 'student3@example.com', name: 'student3' },
  ];

  const students = [] as any[];
  for (const s of studentsData) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name },
      create: {
        email: s.email,
        name: s.name,
        passwordHash,
        role: 'STUDENT',
        grade: '10',
        schoolName: 'Demo School',
      },
    });
    students.push(u);
  }

  // create subjects for teacher
  const subjectNames = ['Mathematics', 'Physics', 'History'];
  const subjects = [] as any[];
  for (const name of subjectNames) {
    let s = await prisma.subject.findFirst({ where: { teacherId: teacher.id, name } });
    if (!s) {
      s = await prisma.subject.create({ data: { teacherId: teacher.id, name } });
    }
    subjects.push(s);
  }

  // create a class and enroll students
  const klass = await prisma.class.upsert({
    where: { inviteCode: 'DEMO-CLASS-1' },
    update: { name: 'Demo Class' },
    create: { name: 'Demo Class', inviteCode: 'DEMO-CLASS-1', teacherId: teacher.id },
  });

  for (const student of students) {
    await prisma.classMember.upsert({
      where: { classId_userId: { classId: klass.id, userId: student.id } },
      update: {},
      create: { classId: klass.id, userId: student.id, role: 'STUDENT' },
    });
  }

  // link subjects to the class
  for (const subject of subjects) {
    await prisma.subjectClass.upsert({
      where: { subjectId_classId: { subjectId: subject.id, classId: klass.id } },
      update: {},
      create: { subjectId: subject.id, classId: klass.id },
    });
  }

  // create tests with questions
  const tests = [] as any[];
  for (const subject of subjects) {
    const t = await prisma.test.create({
      data: {
        title: `${subject.name} Demo Test`,
        pin: Math.random().toString(36).slice(2, 8).toUpperCase(),
        teacherId: teacher.id,
        subjectId: subject.id,
      },
    });
    tests.push(t);

    // create simple questions
    for (let i = 1; i <= 5; i++) {
      const q = await prisma.question.create({
        data: { prompt: `${subject.name} question ${i}`, order: i, testId: t.id },
      });
      // options
      await prisma.questionOption.createMany({
        data: [
          { text: 'Option A', isCorrect: i % 4 === 1, order: 1, questionId: q.id },
          { text: 'Option B', isCorrect: i % 4 === 2, order: 2, questionId: q.id },
          { text: 'Option C', isCorrect: i % 4 === 3, order: 3, questionId: q.id },
          { text: 'Option D', isCorrect: true, order: 4, questionId: q.id },
        ],
      });
    }
  }

  // create homeworks for each subject
  const homeworks = [] as any[];
  for (const subject of subjects) {
    const hw = await prisma.homework.create({
      data: {
        teacherId: teacher.id,
        subjectId: subject.id,
        title: `${subject.name} Homework 1`,
        description: `Please complete problems for ${subject.name}`,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    homeworks.push(hw);
  }

  // create submissions for some students
  for (const hw of homeworks) {
    for (const [i, student] of students.entries()) {
      if (i % 2 === 0) {
        await prisma.homeworkSubmit.create({
          data: {
            homeworkId: hw.id,
            studentId: student.id,
            content: `Here is my submission by ${student.name}`,
          },
        });
      }
    }
  }

  // create some attempts for tests
  for (const test of tests) {
    for (const student of students) {
      const attempt = await prisma.testAttempt.create({
        data: {
          testId: test.id,
          studentId: student.id,
          studentName: student.name,
          status: 'COMPLETED',
          score: Math.floor(Math.random() * 6) + 5,
          total: 10,
        },
      });
    }
  }

  // add a few grades
  for (const student of students) {
    for (const subject of subjects) {
      await prisma.grade.create({
        data: {
          studentId: student.id,
          teacherId: teacher.id,
          subjectId: subject.id,
          value: Math.floor(Math.random() * 5) + 6,
          type: 'TEST',
          workTitle: `${subject.name} Demo Work`,
          date: new Date(),
        },
      });
    }
  }

  console.log('Seed finished.');
  console.log(`Teacher: ${teacher.email}, students: ${students.map((s)=>s.email).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
