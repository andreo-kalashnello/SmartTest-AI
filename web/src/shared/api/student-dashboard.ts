import { apiFetch } from "@/shared/api/client";
import { scoreToGrade12 } from "@/shared/api/teacher-analytics";

export type StudentAttempt = {
  id: string;
  testId: string;
  test: { id: string; title: string; pin: string };
  studentName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  score: number;
  total: number;
  startedAt: string;
  completedAt: string | null;
};

export type StudentClass = {
  id: string;
  name: string;
  teacherId: string;
  school: { id: string; name: string } | null;
  memberCount: number;
  joinedAt?: string;
};

export type StudentGradeRow = {
  testId: string;
  testTitle: string;
  grades: number[];
  avg: number;
};

export type StudentDashboard = {
  attempts: StudentAttempt[];
  completedAttempts: StudentAttempt[];
  classes: StudentClass[];
  gradeByTest: StudentGradeRow[];
  stats: {
    classesCount: number;
    testsCompleted: number;
    avgGrade12: number;
    avgScorePct: number;
  };
  radarData: { subject: string; avg: number }[];
};

function pct(score: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

export async function fetchStudentDashboard(): Promise<StudentDashboard> {
  const [attemptsBody, classesBody] = await Promise.all([
    apiFetch<{ attempts: StudentAttempt[] }>("/student/attempts"),
    apiFetch<{ classes: StudentClass[] }>("/student/classes").catch(() => ({
      classes: [] as StudentClass[],
    })),
  ]);

  const attempts = attemptsBody.attempts;
  // Some seeded attempts may have status === 'COMPLETED' but missing completedAt.
  // Treat either status === 'COMPLETED' or a truthy completedAt as completed.
  const completedAttempts = attempts.filter(
    (a) => a.status === "COMPLETED" || Boolean(a.completedAt),
  );
  const classes = classesBody.classes;

  const byTest = new Map<string, StudentGradeRow>();
  for (const a of completedAttempts) {
    const grade = scoreToGrade12(a.score, a.total);
    const existing = byTest.get(a.testId);
    if (existing) {
      existing.grades.push(grade);
      existing.avg = Math.round(
        (existing.grades.reduce((s, g) => s + g, 0) / existing.grades.length) * 10,
      ) / 10;
    } else {
      byTest.set(a.testId, {
        testId: a.testId,
        testTitle: a.test.title,
        grades: [grade],
        avg: grade,
      });
    }
  }

  const gradeByTest = [...byTest.values()].sort((a, b) =>
    a.testTitle.localeCompare(b.testTitle, "uk"),
  );

  const avgScorePct =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((s, a) => s + pct(a.score, a.total), 0) /
            completedAttempts.length,
        )
      : 0;

  const allGrades = completedAttempts.map((a) => scoreToGrade12(a.score, a.total));
  const avgGrade12 =
    allGrades.length > 0
      ? Math.round((allGrades.reduce((s, g) => s + g, 0) / allGrades.length) * 10) / 10
      : 0;

  const radarData = gradeByTest
    .slice(0, 6)
    .map((g) => ({
      subject: g.testTitle.length > 12 ? `${g.testTitle.slice(0, 12)}…` : g.testTitle,
      avg: g.avg,
    }));

  return {
    attempts,
    completedAttempts,
    classes,
    gradeByTest,
    stats: {
      classesCount: classes.length,
      testsCompleted: completedAttempts.length,
      avgGrade12,
      avgScorePct,
    },
    radarData,
  };
}
