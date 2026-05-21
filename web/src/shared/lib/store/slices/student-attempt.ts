import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { QuestionId, Test, TestAttempt } from "@/entities/test";
import { localDb } from "@/shared/lib/storage";

type AttemptPhase = "idle" | "joining" | "playing" | "submitting" | "done";

interface StudentAttemptState {
  pin: string;
  studentName: string;
  test: Test | null;
  currentIndex: number;
  answers: Record<QuestionId, string>;
  phase: AttemptPhase;
  error: string | null;
  result: TestAttempt | null;
}

const initialState: StudentAttemptState = {
  pin: "",
  studentName: "",
  test: null,
  currentIndex: 0,
  answers: {},
  phase: "idle",
  error: null,
  result: null,
};

export const joinTestByPin = createAsyncThunk(
  "studentAttempt/join",
  async (
    data: { pin: string; studentName: string },
    { rejectWithValue },
  ) => {
    localDb.seedDemoIfEmpty();
    const test = localDb.tests.getByPin(data.pin.trim());
    if (!test) return rejectWithValue("Тест з таким PIN не знайдено");
    if (test.questions.length === 0) {
      return rejectWithValue("У тесті ще немає питань");
    }
    return { test, studentName: data.studentName.trim(), pin: data.pin.trim() };
  },
);

export const submitAttempt = createAsyncThunk(
  "studentAttempt/submit",
  async (_, { getState, rejectWithValue }) => {
    const { studentAttempt } = getState() as {
      studentAttempt: StudentAttemptState;
    };
    const { test, studentName, answers } = studentAttempt;
    if (!test || !studentName) {
      return rejectWithValue("Спроба не ініціалізована");
    }
    let score = 0;
    for (const q of test.questions) {
      const selected = answers[q.id];
      const correct = q.options.find((o) => o.isCorrect);
      if (correct && selected === correct.id) score += 1;
    }
    const attempt = localDb.attempts.save({
      testId: test.id,
      studentName,
      answers,
      score,
      total: test.questions.length,
      completedAt: new Date().toISOString(),
    });
    return attempt;
  },
);

export const studentAttemptSlice = createSlice({
  name: "studentAttempt",
  initialState,
  reducers: {
    resetAttempt(state) {
      Object.assign(state, initialState);
    },
    selectAnswer(
      state,
      action: PayloadAction<{ questionId: QuestionId; optionId: string }>,
    ) {
      state.answers[action.payload.questionId] = action.payload.optionId;
    },
    goNext(state) {
      if (!state.test) return;
      if (state.currentIndex < state.test.questions.length - 1) {
        state.currentIndex += 1;
      }
    },
    goPrev(state) {
      if (state.currentIndex > 0) state.currentIndex -= 1;
    },
    setPhase(state, action: PayloadAction<AttemptPhase>) {
      state.phase = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinTestByPin.pending, (state) => {
        state.phase = "joining";
        state.error = null;
      })
      .addCase(joinTestByPin.fulfilled, (state, action) => {
        state.pin = action.payload.pin;
        state.studentName = action.payload.studentName;
        state.test = action.payload.test;
        state.currentIndex = 0;
        state.answers = {};
        state.phase = "playing";
        state.result = null;
      })
      .addCase(joinTestByPin.rejected, (state, action) => {
        state.phase = "idle";
        state.error = (action.payload as string) ?? "Помилка";
      })
      .addCase(submitAttempt.pending, (state) => {
        state.phase = "submitting";
        state.error = null;
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.phase = "done";
        state.result = action.payload;
      })
      .addCase(submitAttempt.rejected, (state, action) => {
        state.phase = "playing";
        state.error = (action.payload as string) ?? "Помилка відправки";
      });
  },
});

export const { resetAttempt, selectAnswer, goNext, goPrev, setPhase } =
  studentAttemptSlice.actions;
