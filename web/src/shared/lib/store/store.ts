import { configureStore } from "@reduxjs/toolkit";

import { appShellSlice } from "./slices/app-shell";
import { authSessionSlice } from "./slices/auth-session";
import { studentAttemptSlice } from "./slices/student-attempt";
import { teacherTestDraftSlice } from "./slices/teacher-test-draft";

export const store = configureStore({
  reducer: {
    appShell: appShellSlice.reducer,
    authSession: authSessionSlice.reducer,
    teacherTestDraft: teacherTestDraftSlice.reducer,
    studentAttempt: studentAttemptSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
