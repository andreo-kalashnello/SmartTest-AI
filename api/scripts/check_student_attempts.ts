import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = process.argv[2] ?? 'student1@example.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User not found: ${email}`);
      return;
    }

    console.log(`User: ${user.id} ${user.email} (${user.name})`);

    const attempts = await prisma.testAttempt.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { test: true },
    });

    if (attempts.length === 0) {
      console.log('No attempts found for this user');
      return;
    }

    for (const a of attempts) {
      console.log('---');
      console.log(`id: ${a.id}`);
      console.log(`test: ${a.test?.title ?? a.testId}`);
      console.log(`status: ${a.status}`);
      console.log(`score: ${a.score} / ${a.total}`);
      console.log(`startedAt: ${a.startedAt?.toISOString()}`);
      console.log(`completedAt: ${a.completedAt?.toISOString() ?? 'null'}`);
      console.log(`createdAt: ${a.createdAt.toISOString()}`);
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 2;
  } finally {
    await (await import('@prisma/client')).PrismaClient.prototype.$disconnect.call(undefined as any).catch(() => {});
  }
}

void main();
