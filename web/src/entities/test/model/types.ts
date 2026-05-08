export type TestId = string;
export type QuestionId = string;

export interface Question {
  id: QuestionId;
  prompt: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface Test {
  id: TestId;
  title: string;
  pin: string;
  questions: Question[];
}
