import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthSession } from "@/entities/auth";
import { localDb } from "@/shared/lib/storage";

const SESSION_KEY = "smarttest_session";

type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthSessionState {
  user: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  hydrated: boolean;
}

const initialState: AuthSessionState = {
  user: null,
  status: "idle",
  error: null,
  hydrated: false,
};

function persistSession(user: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_KEY);
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export const hydrateAuth = createAsyncThunk("authSession/hydrate", async () => {
  return readSession();
});

export const registerTeacher = createAsyncThunk(
  "authSession/register",
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      const user = localDb.auth.register(data);
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
      persistSession(session);
      return session;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Помилка реєстрації");
    }
  },
);

export const loginTeacher = createAsyncThunk(
  "authSession/login",
  async (
    data: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const user = localDb.auth.login(data.email, data.password);
      const session: AuthSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
      persistSession(session);
      return session;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Помилка входу");
    }
  },
);

export const authSessionSlice = createSlice({
  name: "authSession",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      persistSession(null);
    },
    clearAuthError(state) {
      state.error = null;
      state.status = "idle";
    },
    setSession(state, action: PayloadAction<AuthSession | null>) {
      state.user = action.payload;
      persistSession(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.hydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      })
      .addCase(registerTeacher.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerTeacher.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(registerTeacher.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Помилка";
      })
      .addCase(loginTeacher.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginTeacher.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginTeacher.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Помилка";
      });
  },
});

export const { logout, clearAuthError, setSession } = authSessionSlice.actions;
