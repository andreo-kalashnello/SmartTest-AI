import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Question, Test, TestId } from "@/entities/test";
import { localDb } from "@/shared/lib/storage";

type DraftStatus = "idle" | "loading" | "saving" | "succeeded" | "failed";

interface TeacherTestDraftState {
  testId: TestId | null;
  title: string;
  pin: string | null;
  questions: Question[];
  status: DraftStatus;
  error: string | null;
}

const initialState: TeacherTestDraftState = {
  testId: null,
  title: "",
  pin: null,
  questions: [],
  status: "idle",
  error: null,
};

export const loadTestDraft = createAsyncThunk(
  "teacherTestDraft/load",
  async (testId: TestId, { rejectWithValue }) => {
    const test = localDb.tests.getById(testId);
    if (!test) return rejectWithValue("Тест не знайдено");
    return test;
  },
);

export const saveTestDraft = createAsyncThunk(
  "teacherTestDraft/save",
  async (_, { getState, rejectWithValue }) => {
    const { teacherTestDraft } = getState() as {
      teacherTestDraft: TeacherTestDraftState;
    };
    if (!teacherTestDraft.testId) {
      return rejectWithValue("Немає тесту для збереження");
    }
    const existing = localDb.tests.getById(teacherTestDraft.testId);
    if (!existing) return rejectWithValue("Тест не знайдено");
    const updated: Test = {
      ...existing,
      title: teacherTestDraft.title,
      questions: teacherTestDraft.questions,
    };
    return localDb.tests.update(updated);
  },
);

export const teacherTestDraftSlice = createSlice({
  name: "teacherTestDraft",
  initialState,
  reducers: {
    resetDraft(state) {
      Object.assign(state, initialState);
    },
    initFromTest(state, action: PayloadAction<Test>) {
      state.testId = action.payload.id;
      state.title = action.payload.title;
      state.pin = action.payload.pin;
      state.questions = action.payload.questions;
      state.status = "idle";
      state.error = null;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    addQuestion(state) {
      const id = `q-${Date.now()}`;
      state.questions.push({
        id,
        prompt: "",
        options: [
          { id: `${id}-o1`, text: "", isCorrect: true },
          { id: `${id}-o2`, text: "", isCorrect: false },
        ],
      });
    },
    removeQuestion(state, action: PayloadAction<string>) {
      state.questions = state.questions.filter((q) => q.id !== action.payload);
    },
    updateQuestionPrompt(
      state,
      action: PayloadAction<{ questionId: string; prompt: string }>,
    ) {
      const q = state.questions.find((x) => x.id === action.payload.questionId);
      if (q) q.prompt = action.payload.prompt;
    },
    updateOptionText(
      state,
      action: PayloadAction<{
        questionId: string;
        optionId: string;
        text: string;
      }>,
    ) {
      const q = state.questions.find((x) => x.id === action.payload.questionId);
      const o = q?.options.find((x) => x.id === action.payload.optionId);
      if (o) o.text = action.payload.text;
    },
    setCorrectOption(
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>,
    ) {
      const q = state.questions.find((x) => x.id === action.payload.questionId);
      if (!q) return;
      q.options.forEach((o) => {
        o.isCorrect = o.id === action.payload.optionId;
      });
    },
    addOption(state, action: PayloadAction<string>) {
      const q = state.questions.find((x) => x.id === action.payload);
      if (!q) return;
      q.options.push({
        id: `o-${Date.now()}`,
        text: "",
        isCorrect: false,
      });
    },
    removeOption(
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>,
    ) {
      const q = state.questions.find((x) => x.id === action.payload.questionId);
      if (!q || q.options.length <= 2) return;
      q.options = q.options.filter((o) => o.id !== action.payload.optionId);
      if (!q.options.some((o) => o.isCorrect) && q.options[0]) {
        q.options[0].isCorrect = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTestDraft.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadTestDraft.fulfilled, (state, action) => {
        state.testId = action.payload.id;
        state.title = action.payload.title;
        state.pin = action.payload.pin;
        state.questions = action.payload.questions;
        state.status = "idle";
      })
      .addCase(loadTestDraft.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Помилка";
      })
      .addCase(saveTestDraft.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveTestDraft.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pin = action.payload.pin;
      })
      .addCase(saveTestDraft.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Помилка збереження";
      });
  },
});

export const {
  resetDraft,
  initFromTest,
  setTitle,
  setQuestions,
  addQuestion,
  removeQuestion,
  updateQuestionPrompt,
  updateOptionText,
  setCorrectOption,
  addOption,
  removeOption,
} = teacherTestDraftSlice.actions;
