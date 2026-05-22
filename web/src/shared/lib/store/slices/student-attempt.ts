import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { QuestionId, Test, TestAttempt } from "@/entities/test";

type AttemptPhase = "idle" | "joining" | "playing" | "submitting" | "done";

interface StudentAttemptState {
  attemptId: string | null;
  pin: string;
  studentName: string;
  test: Test | null;
  currentIndex: number;
  answers: Record<QuestionId, string>;
  phase: AttemptPhase;
  error: string | null;
  result: TestAttempt | null;
}

type PlayerTest = Omit<Test, "questions"> & {
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{
      id: string;
      text: string;
    }>;
  }>;
};

const initialState: StudentAttemptState = {
  attemptId: null,
  pin: "",
  studentName: "",
  test: null,
  currentIndex: 0,
  answers: {},
  phase: "idle",
  error: null,
  result: null,
};

function normalizePlayerTest(test: PlayerTest): Test {
  return {
    ...test,
    questions: test.questions.map((question) => ({
      ...question,
      options: question.options.map((option) => ({
        ...option,
        isCorrect: false,
      })),
    })),
  };
}

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

export const joinTestByPin = createAsyncThunk(
  "studentAttempt/join",
  async (
    data: { pin: string; studentName: string },
    { rejectWithValue },
  ) => {
    const response = await fetch("/api/public/attempts/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: data.pin.trim(),
        studentName: data.studentName.trim(),
      }),
    });

    if (!response.ok) {
      return rejectWithValue(
        await readErrorMessage(response, "Test with this PIN was not found"),
      );
    }

    const body = (await response.json()) as {
      attemptId: string;
      test: PlayerTest;
    };

    return {
      attemptId: body.attemptId,
      test: normalizePlayerTest(body.test),
      studentName: data.studentName.trim(),
      pin: data.pin.trim(),
    };
  },
);

export const submitAttempt = createAsyncThunk(
  "studentAttempt/submit",
  async (_, { getState, rejectWithValue }) => {
    const { studentAttempt } = getState() as {
      studentAttempt: StudentAttemptState;
    };
    const { attemptId, test, answers } = studentAttempt;

    if (!attemptId || !test) {
      return rejectWithValue("Attempt is not initialized");
    }

    const answerItems = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    const saveResponse = await fetch(`/api/public/attempts/${attemptId}/answers`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerItems }),
    });

    if (!saveResponse.ok) {
      return rejectWithValue(
        await readErrorMessage(saveResponse, "Answer save failed"),
      );
    }

    const completeResponse = await fetch(
      `/api/public/attempts/${attemptId}/complete`,
      {
        method: "POST",
      },
    );

    if (!completeResponse.ok) {
      return rejectWithValue(
        await readErrorMessage(completeResponse, "Attempt submit failed"),
      );
    }

    const body = (await completeResponse.json()) as { result: TestAttempt };
    return body.result;
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
        state.attemptId = action.payload.attemptId;
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
        state.error = (action.payload as string) ?? "Join failed";
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
        state.error = (action.payload as string) ?? "Submit failed";
      });
  },
});

export const { resetAttempt, selectAnswer, goNext, goPrev, setPhase } =
  studentAttemptSlice.actions;
