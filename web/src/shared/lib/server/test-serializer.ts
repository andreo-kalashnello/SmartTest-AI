import type { Prisma } from "@prisma/client";

export const testInclude = {
  questions: {
    orderBy: { order: "asc" as const },
    include: {
      options: {
        orderBy: { order: "asc" as const },
      },
    },
  },
};

type TestWithQuestions = Prisma.TestGetPayload<{ include: typeof testInclude }>;

export function serializeTeacherTest(test: TestWithQuestions) {
  return {
    id: test.id,
    title: test.title,
    pin: test.pin,
    questions: test.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    })),
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
  };
}

export function serializePlayerTest(test: TestWithQuestions) {
  return {
    id: test.id,
    title: test.title,
    pin: test.pin,
    questions: test.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
      })),
    })),
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
  };
}

export function answersRecord(
  answers: Array<{ questionId: string; selectedOptionId: string }>,
) {
  return Object.fromEntries(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );
}
