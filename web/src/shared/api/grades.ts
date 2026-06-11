import { apiFetch } from "@/shared/api/client";

export type SubjectGrade = {
  id: string;
  name: string;
  icon: string | null;
};

export type GradeStudent = {
  id: string;
  email: string;
  name: string;
  role: string;
  grade: string | null;
  schoolName: string | null;
  enrolledAt: string;
};

export type TeacherGradeItem = {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  subject: SubjectGrade;
  student: {
    id: string;
    email: string;
    name: string;
    grade: string | null;
    schoolName: string | null;
  };
  value: number;
  type: string;
  workTitle: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type GradeInput = {
  studentId: string;
  subjectId: string;
  value: number;
  type: string;
  workTitle: string;
  date?: string;
};

export async function fetchTeacherGrades() {
  return apiFetch<{ grades: TeacherGradeItem[] }>("/grades");
}

export async function createTeacherGrade(body: GradeInput) {
  return apiFetch<{ grade: TeacherGradeItem }>("/grades", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchSubjectStudents(subjectId: string) {
  return apiFetch<{ students: GradeStudent[] }>(`/subjects/${subjectId}/students`);
}

export async function fetchMyGrades() {
  return apiFetch<{ grades: TeacherGradeItem[] }>(`/grades/my`);
}