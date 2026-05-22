import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Question, Test, TestId } from "@/entities/test";

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

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export const loadTestDraft = createAsyncThunk(
  "teacherTestDraft/load",
  async (testId: TestId, { rejectWithValue }) => {
    const response = await fetch(`/api/tests/${testId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return rejectWithValue(
        await readErrorMessage(response, "Test not found"),
      );
    }

    const body = (await response.json()) as { test: Test };
    return body.test;
  },
);

export const saveTestDraft = createAsyncThunk(
  "teacherTestDraft/save",
  async (_, { getState, rejectWithValue }) => {
    const { teacherTestDraft } = getState() as {
      teacherTestDraft: TeacherTestDraftState;
    };

    if (!teacherTestDraft.testId) {
      return rejectWithValue("No test to save");
    }

    const response = await fetch(`/api/tests/${teacherTestDraft.testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: teacherTestDraft.title,
        questions: teacherTestDraft.questions,
      }),
    });

    if (!response.ok) {
      return rejectWithValue(await readErrorMessage(response, "Save failed"));
    }

    const body = (await response.json()) as { test: Test };
    return body.test;
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
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      if (question) question.prompt = action.payload.prompt;
    },
    updateOptionText(
      state,
      action: PayloadAction<{
        questionId: string;
        optionId: string;
        text: string;
      }>,
    ) {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      const option = question?.options.find(
        (item) => item.id === action.payload.optionId,
      );
      if (option) option.text = action.payload.text;
    },
    setCorrectOption(
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>,
    ) {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      if (!question) return;
      question.options.forEach((option) => {
        option.isCorrect = option.id === action.payload.optionId;
      });
    },
    addOption(state, action: PayloadAction<string>) {
      const question = state.questions.find((item) => item.id === action.payload);
      if (!question) return;
      question.options.push({
        id: `o-${Date.now()}`,
        text: "",
        isCorrect: false,
      });
    },
    removeOption(
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>,
    ) {
      const question = state.questions.find(
        (item) => item.id === action.payload.questionId,
      );
      if (!question || question.options.length <= 2) return;

      question.options = question.options.filter(
        (option) => option.id !== action.payload.optionId,
      );

      if (!question.options.some((option) => option.isCorrect) && question.options[0]) {
        question.options[0].isCorrect = true;
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
        state.error = (action.payload as string) ?? "Load failed";
      })
      .addCase(saveTestDraft.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveTestDraft.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pin = action.payload.pin;
        state.title = action.payload.title;
        state.questions = action.payload.questions;
      })
      .addCase(saveTestDraft.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Save failed";
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
