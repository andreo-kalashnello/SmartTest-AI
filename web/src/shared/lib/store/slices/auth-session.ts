import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthSession, UserRole } from "@/entities/auth";
import { apiFetch } from "@/shared/api/client";
import {
  loadAuthProfile,
  mergeSessionWithProfile,
  saveAuthProfile,
} from "@/shared/lib/client/auth-profile";

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
  role?: "TEACHER" | "STUDENT";
  grade?: string | null;
  classCode?: string | null;
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

function apiRoleToClient(role?: "TEACHER" | "STUDENT"): UserRole | undefined {
  if (role === "TEACHER") return "teacher";
  if (role === "STUDENT") return "student";
  return undefined;
}

function buildSession(user: AuthApiUser): AuthSession {
  const clientRole = apiRoleToClient(user.role);
  const session = mergeSessionWithProfile(
    { id: user.id, email: user.email, name: user.name },
    clientRole,
  );
  if (user.grade) session.grade = user.grade;
  if (user.classCode) session.classCode = user.classCode;
  if (user.schoolName) session.schoolName = user.schoolName;
  return session;
}

function persistProfile(userId: string, data: RegisterPayload) {
  saveAuthProfile(userId, {
    role: data.role,
    grade: data.grade,
    classCode: data.classCode || undefined,
    schoolName: data.schoolName,
  });
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
          grade: data.grade,
          classCode: data.classCode || undefined,
          schoolName: data.schoolName,
        }),
      });
      persistProfile(body.user.id, data);
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
  async (
    data: { email: string; password: string },
    { rejectWithValue },
  ) => {
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
  await apiFetch("/auth/logout", {
    method: "POST",
  });
});

export const updateStudentProfile = createAsyncThunk(
  "authSession/updateStudentProfile",
  async (
    data: { grade?: string; classCode?: string; schoolName?: string },
    { getState },
  ) => {
    const state = getState() as { authSession: AuthSessionState };
    const user = state.authSession.user;
    if (!user) throw new Error("Not authenticated");
    const stored = loadAuthProfile(user.userId) ?? { role: user.role };
    saveAuthProfile(user.userId, { ...stored, ...data });
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

export const registerTeacher = registerUser;
export const loginTeacher = loginUser;
export const logoutTeacher = logoutUser;
