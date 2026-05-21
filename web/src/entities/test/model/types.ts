export type TestId = string;
export type QuestionId = string;
export type AttemptId = string;

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: QuestionId;
  prompt: string;
  options: QuestionOption[];
}

export interface Test {
  id: TestId;
  title: string;
  pin: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface TestAttempt {
  id: AttemptId;
  testId: TestId;
  studentName: string;
  answers: Record<QuestionId, string>;
  score: number;
  total: number;
  completedAt: string;
}

export interface TestDraft {
  title: string;
  questions: Question[];
}
