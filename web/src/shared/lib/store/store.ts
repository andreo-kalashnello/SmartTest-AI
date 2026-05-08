import { configureStore } from "@reduxjs/toolkit";

import { appShellSlice } from "./slices/app-shell";

export const store = configureStore({
  reducer: {
    appShell: appShellSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
