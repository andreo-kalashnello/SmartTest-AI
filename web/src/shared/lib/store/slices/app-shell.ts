import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Мінімальний слайс для оболонки застосунку (store вже підключений до чекліста). */
export interface AppShellState {
  headline: string;
}

const initialState: AppShellState = {
  headline: "SmartTest AI",
};

export const appShellSlice = createSlice({
  name: "appShell",
  initialState,
  reducers: {
    setHeadline(state, action: PayloadAction<string>) {
      state.headline = action.payload;
    },
  },
});

export const { setHeadline } = appShellSlice.actions;
