import { apiFetch } from "@/shared/api/client";

export type TeacherSubjectItem = {
  id: string;
  teacherId: string;
  name: string;
  icon: string | null;
  studentCount: number;
  homeworkCount: number;
  testCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SubjectInput = {
  name: string;
  icon?: string;
};

export async function fetchTeacherSubjects() {
  return apiFetch<{ subjects: TeacherSubjectItem[] }>("/subjects");
}

export async function createTeacherSubject(body: SubjectInput) {
  return apiFetch<{ subject: TeacherSubjectItem }>("/subjects", {
    method: "POST",
    body: JSON.stringify(body),
  });
}