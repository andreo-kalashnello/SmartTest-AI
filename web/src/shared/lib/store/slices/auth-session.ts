import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthSession } from "@/entities/auth";

type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthSessionState {
  user: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  hydrated: boolean;
}

type AuthApiUser = {
  id: string;
  email: string;
  name: string;
};

const initialState: AuthSessionState = {
  user: null,
  status: "idle",
  error: null,
  hydrated: false,
};

function toSession(user: AuthApiUser): AuthSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
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

export const hydrateAuth = createAsyncThunk("authSession/hydrate", async () => {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Session check failed"));
  }

  const body = (await response.json()) as { user: AuthApiUser };
  return toSession(body.user);
});

export const registerTeacher = createAsyncThunk(
  "authSession/register",
  async (
    data: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return rejectWithValue(
          await readErrorMessage(response, "Registration failed"),
        );
      }

      const body = (await response.json()) as { user: AuthApiUser };
      return toSession(body.user);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registration failed",
      );
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return rejectWithValue(await readErrorMessage(response, "Login failed"));
      }

      const body = (await response.json()) as { user: AuthApiUser };
      return toSession(body.user);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed",
      );
    }
  },
);

export const logoutTeacher = createAsyncThunk("authSession/logout", async () => {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
});

export const authSessionSlice = createSlice({
  name: "authSession",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
      state.status = "idle";
    },
    setSession(state, action: PayloadAction<AuthSession | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.hydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.user = null;
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
        state.error = (action.payload as string) ?? "Registration failed";
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
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(logoutTeacher.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { logout, clearAuthError, setSession } = authSessionSlice.actions;
