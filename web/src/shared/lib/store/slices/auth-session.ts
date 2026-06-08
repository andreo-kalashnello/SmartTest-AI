import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthSession, UserRole } from "@/entities/auth";
import { apiFetch } from "@/shared/api/client";

type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthSessionState {
  user: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  hydrated: boolean;
}

// NestJS response shape from /auth/register, /auth/login, /auth/me
type AuthApiUser = {
  id: string;
  email: string;
  name: string;
  role?: "TEACHER" | "STUDENT";
  // register/login return these; me() currently does not (backend note)
  grade?: string | null;
  schoolName?: string | null;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  grade?: string;
  classCode?: string;
  schoolName?: string;
};

const initialState: AuthSessionState = {
  user: null,
  status: "idle",
  error: null,
  hydrated: false,
};

function apiRoleToClient(role?: "TEACHER" | "STUDENT"): UserRole {
  return role === "STUDENT" ? "student" : "teacher";
}

/** Build Redux AuthSession directly from NestJS API response — no localStorage. */
function buildSession(user: AuthApiUser): AuthSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: apiRoleToClient(user.role),
    grade: user.grade ?? undefined,
    schoolName: user.schoolName ?? undefined,
  };
}

export const hydrateAuth = createAsyncThunk("authSession/hydrate", async () => {
  try {
    const body = await apiFetch<{ user: AuthApiUser }>("/auth/me");
    return buildSession(body.user);
  } catch {
    return null;
  }
});

export const registerUser = createAsyncThunk(
  "authSession/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const body = await apiFetch<{ user: AuthApiUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role === "student" ? "STUDENT" : "TEACHER",
          grade: data.grade || undefined,
          classCode: data.classCode || undefined,
          schoolName: data.schoolName || undefined,
        }),
      });
      return buildSession(body.user);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "authSession/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const body = await apiFetch<{ user: AuthApiUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return buildSession(body.user);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("authSession/logout", async () => {
  await apiFetch("/auth/logout", { method: "POST" });
});

/**
 * Update student profile fields in Redux only.
 * grade/schoolName: no PATCH endpoint in backend yet — local state only.
 * classCode join: use POST /classes/join separately (student-settings-page).
 */
export const updateStudentProfile = createAsyncThunk(
  "authSession/updateStudentProfile",
  async (
    data: { grade?: string; schoolName?: string },
    { getState },
  ) => {
    const state = getState() as { authSession: AuthSessionState };
    const user = state.authSession.user;
    if (!user) throw new Error("Not authenticated");
    return { ...user, ...data };
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
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearAuthError, setSession } = authSessionSlice.actions;

/** @deprecated use registerUser */
export const registerTeacher = registerUser;
/** @deprecated use loginUser */
export const loginTeacher = loginUser;
/** @deprecated use logoutUser */
export const logoutTeacher = logoutUser;
