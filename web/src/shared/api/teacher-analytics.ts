import type { Test } from "@/entities/test";
import { apiFetch } from "@/shared/api/client";

type ApiClass = {
  id: string;
  name: string;
  inviteCode: string;
  teacherId: string;
  school: { id: string; name: string } | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

type ApiMember = {
  id: string;
  classId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    grade: string | null;
    schoolName: string | null;
  };
};

type ApiAttempt = {
  id: string;
  testId: string;
  studentId: string | null;
  studentName: string;
  student: {
    id: string;
    email: string;
    name: string;
    grade: string | null;
    schoolName: string | null;
  } | null;
  status: "IN_PROGRESS" | "COMPLETED";
  score: number;
  total: number;
  startedAt: string;
  completedAt: string | null;
};

export type TeacherAttemptRow = ApiAttempt & {
  testTitle: string;
  testPin: string;
};

export type TeacherStudentRow = {
  id: string;
  name: string;
  email: string;
  grade: string | null;
  schoolName: string | null;
  testsCompleted: number;
  avgScorePct: number;
};

export type ActivityChartRow = {
  day: string;
  tests: number;
  homework: number;
};

export type ScoreDistributionRow = {
  range: string;
  count: number;
  color: string;
};

export type RecentActivityRow = {
  id: string;
  student: string;
  action: string;
  test: string;
  score: number;
  time: string;
};

export type GradeJournalRow = {
  id: string;
  student: string;
  subject: string;
  work: string;
  type: "test";
  date: string;
  grade: number;
};

export type TestSubjectRow = {
  id: string;
  title: string;
  pin: string;
  questions: number;
  attempts: number;
  avgScorePct: number;
  createdAt: string;
};

export type TeacherAnalytics = {
  tests: Test[];
  classes: ApiClass[];
  attempts: TeacherAttemptRow[];
  completedAttempts: TeacherAttemptRow[];
  students: TeacherStudentRow[];
  testSubjects: TestSubjectRow[];
  stats: {
    totalTests: number;
    testsThisWeek: number;
    totalStudents: number;
    totalAttempts: number;
    attemptsThisWeek: number;
    avgScorePct: number;
  };
  activityChart: ActivityChartRow[];
  scoreDistribution: ScoreDistributionRow[];
  recentActivity: RecentActivityRow[];
  gradeJournal: GradeJournalRow[];
  analyticsTop: {
    bestTest: string | null;
    bestStudent: string | null;
    successRatePct: number;
    activeStudents: number;
  };
  testAvgChart: { subject: string; avg: number }[];
};

const DAY_LABELS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

const SCORE_BUCKETS: { range: string; min: number; max: number; color: string }[] = [
  { range: "90–100%", min: 90, max: 100, color: "#10b981" },
  { range: "75–89%", min: 75, max: 89, color: "#3b82f6" },
  { range: "50–74%", min: 50, max: 74, color: "#f59e0b" },
  { range: "0–49%", min: 0, max: 49, color: "#ef4444" },
];

function pct(score: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

function scoreToGrade12(score: number, total: number) {
  const p = pct(score, total);
  return Math.max(1, Math.min(12, Math.round((p / 100) * 12)));
}

function isThisWeek(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return d >= weekAgo;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "щойно";
  if (mins < 60) return `${mins} хв тому`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} год тому`;
  const days = Math.floor(hours / 24);
  return `${days} дн тому`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function fetchTeacherAnalytics(): Promise<TeacherAnalytics> {
  const { classes } = await apiFetch<{ classes: ApiClass[] }>("/classes");
  const { tests } = await apiFetch<{ tests: Test[] }>("/tests");

  const memberResults = await Promise.all(
    classes.map(async (cls) => {
      try {
        const body = await apiFetch<{ members: ApiMember[] }>(`/classes/${cls.id}/members`);
        return body.members;
      } catch {
        return [] as ApiMember[];
      }
    }),
  );

  const attemptResults = await Promise.all(
    tests.map(async (test) => {
      try {
        const body = await apiFetch<{ attempts: ApiAttempt[] }>(`/tests/${test.id}/attempts`);
        return body.attempts.map((a) => ({
          ...a,
          testTitle: test.title,
          testPin: test.pin,
        }));
      } catch {
        return [] as TeacherAttemptRow[];
      }
    }),
  );

  const attempts = attemptResults.flat();
  const completedAttempts = attempts.filter((a) => a.status === "COMPLETED");

  const studentMap = new Map<string, TeacherStudentRow>();
  for (const members of memberResults) {
    for (const m of members) {
      if (!studentMap.has(m.user.id)) {
        studentMap.set(m.user.id, {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          grade: m.user.grade,
          schoolName: m.user.schoolName,
          testsCompleted: 0,
          avgScorePct: 0,
        });
      }
    }
  }

  const scoresByStudent = new Map<string, number[]>();
  for (const a of completedAttempts) {
    if (!a.studentId) continue;
    const list = scoresByStudent.get(a.studentId) ?? [];
    list.push(pct(a.score, a.total));
    scoresByStudent.set(a.studentId, list);
  }

  for (const [studentId, scores] of scoresByStudent) {
    const row = studentMap.get(studentId);
    if (!row) continue;
    row.testsCompleted = scores.length;
    row.avgScorePct = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }

  const students = [...studentMap.values()].sort((a, b) => a.name.localeCompare(b.name, "uk"));

  const testsThisWeek = tests.filter((t) => isThisWeek(t.createdAt)).length;
  const attemptsThisWeek = completedAttempts.filter(
    (a) => a.completedAt && isThisWeek(a.completedAt),
  ).length;

  const avgScorePct =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((s, a) => s + pct(a.score, a.total), 0) /
            completedAttempts.length,
        )
      : 0;

  const weekDays: ActivityChartRow[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = completedAttempts.filter((a) => {
      if (!a.completedAt) return false;
      const t = new Date(a.completedAt);
      return t >= d && t < next;
    }).length;
    weekDays.push({
      day: DAY_LABELS[d.getDay()]!,
      tests: count,
      homework: 0,
    });
  }

  const scoreDistribution = SCORE_BUCKETS.map((bucket) => ({
    range: bucket.range,
    color: bucket.color,
    count: completedAttempts.filter((a) => {
      const p = pct(a.score, a.total);
      return p >= bucket.min && p <= bucket.max;
    }).length,
  }));

  const recentActivity: RecentActivityRow[] = completedAttempts
    .filter((a) => a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      student: a.student?.name ?? a.studentName,
      action: "Пройшов тест",
      test: a.testTitle,
      score: scoreToGrade12(a.score, a.total),
      time: relativeTime(a.completedAt!),
    }));

  const gradeJournal: GradeJournalRow[] = completedAttempts
    .filter((a) => a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .map((a) => ({
      id: a.id,
      student: a.student?.name ?? a.studentName,
      subject: "Тестування",
      work: a.testTitle,
      type: "test" as const,
      date: new Date(a.completedAt!).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "short",
      }),
      grade: scoreToGrade12(a.score, a.total),
    }));

  const testSubjects: TestSubjectRow[] = tests.map((test) => {
    const testAttempts = completedAttempts.filter((a) => a.testId === test.id);
    const avg =
      testAttempts.length > 0
        ? Math.round(
            testAttempts.reduce((s, a) => s + pct(a.score, a.total), 0) / testAttempts.length,
          )
        : 0;
    return {
      id: test.id,
      title: test.title,
      pin: test.pin,
      questions: test.questions.length,
      attempts: testAttempts.length,
      avgScorePct: avg,
      createdAt: test.createdAt,
    };
  });

  const testAvgChart = testSubjects
    .filter((t) => t.attempts > 0)
    .map((t) => ({
      subject: t.title.length > 14 ? `${t.title.slice(0, 14)}…` : t.title,
      avg: Math.round((t.avgScorePct / 100) * 12),
    }))
    .slice(0, 6);

  let bestTest: string | null = null;
  let bestTestAvg = -1;
  for (const t of testSubjects) {
    if (t.attempts > 0 && t.avgScorePct > bestTestAvg) {
      bestTestAvg = t.avgScorePct;
      bestTest = t.title;
    }
  }

  let bestStudent: string | null = null;
  let bestStudentAvg = -1;
  for (const s of students) {
    if (s.testsCompleted > 0 && s.avgScorePct > bestStudentAvg) {
      bestStudentAvg = s.avgScorePct;
      bestStudent = s.name.split(" ")[0] ?? s.name;
    }
  }

  const successRatePct =
    completedAttempts.length > 0
      ? Math.round(
          (completedAttempts.filter((a) => pct(a.score, a.total) >= 50).length /
            completedAttempts.length) *
            100,
        )
      : 0;

  const activeStudents = students.filter((s) => s.testsCompleted > 0).length;

  return {
    tests,
    classes,
    attempts,
    completedAttempts,
    students,
    testSubjects,
    stats: {
      totalTests: tests.length,
      testsThisWeek,
      totalStudents: students.length,
      totalAttempts: completedAttempts.length,
      attemptsThisWeek,
      avgScorePct,
    },
    activityChart: weekDays,
    scoreDistribution,
    recentActivity,
    gradeJournal,
    analyticsTop: {
      bestTest,
      bestStudent,
      successRatePct,
      activeStudents,
    },
    testAvgChart,
  };
}

export { initials, pct, scoreToGrade12 };
