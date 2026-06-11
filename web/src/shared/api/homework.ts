import { apiFetch } from "@/shared/api/client";

export type HomeworkAttachment = {
  fileName: string;
  mimeType: string | null;
  size: number | null;
};

export type HomeworkSubject = {
  id: string;
  name: string;
  icon: string | null;
};

export type TeacherHomeworkItem = {
  id: string;
  teacherId: string;
  subjectId: string;
  subject: HomeworkSubject;
  title: string;
  description: string | null;
  dueAt: string | null;
  attachment: HomeworkAttachment | null;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type StudentHomeworkItem = TeacherHomeworkItem & {
  submission: {
    id: string;
    content: string | null;
    attachment: HomeworkAttachment | null;
    submittedAt: string;
  } | null;
};

export async function fetchTeacherHomework() {
  return apiFetch<{ homework: TeacherHomeworkItem[] }>("/homework");
}

export async function fetchStudentHomework() {
  return apiFetch<{ homework: StudentHomeworkItem[] }>("/homework/student");
}
export type HomeworkSubmissionItem = {
  id: string;
  homeworkId: string;
  content: string | null;
  attachment: HomeworkAttachment | null;
  submittedAt: string;
  student: {
    id: string;
    email: string;
    name: string | null;
    grade: string | null;
    schoolName: string | null;
  };
  subjectId: string;
  homeworkTitle: string;
};

export async function fetchHomeworkSubmissions(homeworkId: string) {
  return apiFetch<{ submissions: HomeworkSubmissionItem[] }>(`/homework/${homeworkId}/submissions`);
}

export async function submitHomework(homeworkId: string, options: { content?: string; file?: File } = {}) {
  const form = new FormData();
  if (options.content) form.append("content", options.content);
  if (options.file) form.append("file", options.file as Blob);
  return apiFetch<{ submission: HomeworkSubmissionItem }>(`/homework/${homeworkId}/submit`, {
    method: "POST",
    body: form,
  });
}