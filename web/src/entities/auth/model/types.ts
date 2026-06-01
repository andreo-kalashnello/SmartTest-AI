export type UserRole = "teacher" | "student";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  grade?: string;
  classCode?: string;
  schoolName?: string;
}
