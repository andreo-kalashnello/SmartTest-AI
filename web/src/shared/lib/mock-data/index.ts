import type { SubjectIconKey } from "@/shared/ui/subject-icon";

// ─── Subjects ────────────────────────────────────────────────────────────────
export const MOCK_SUBJECTS: {
  id: string;
  name: string;
  icon: SubjectIconKey;
  color: string;
  students: number;
  tests: number;
  homework: number;
}[] = [
  { id: "s1", name: "Математика", icon: "math", color: "from-violet-500 to-purple-600", students: 28, tests: 12, homework: 5 },
  { id: "s2", name: "Фізика", icon: "physics", color: "from-blue-500 to-cyan-600", students: 24, tests: 8, homework: 3 },
  { id: "s3", name: "Хімія", icon: "chemistry", color: "from-emerald-500 to-teal-600", students: 22, tests: 6, homework: 2 },
  { id: "s4", name: "Біологія", icon: "biology", color: "from-green-500 to-emerald-600", students: 30, tests: 9, homework: 4 },
  { id: "s5", name: "Історія", icon: "history", color: "from-amber-500 to-orange-600", students: 26, tests: 7, homework: 3 },
  { id: "s6", name: "Географія", icon: "geography", color: "from-sky-500 to-blue-600", students: 25, tests: 5, homework: 2 },
];

// ─── Students ─────────────────────────────────────────────────────────────────
export const MOCK_STUDENTS = [
  { id: "st1", name: "Олена Ковальська", avatar: "ОК", email: "kovarska@school.ua", grade: "10-А", avgScore: 94, tests: 18, homework: 15 },
  { id: "st2", name: "Михайло Петренко", avatar: "МП", email: "petrenko@school.ua", grade: "10-А", avgScore: 78, tests: 16, homework: 12 },
  { id: "st3", name: "Анна Сидоренко", avatar: "АС", email: "sydorenko@school.ua", grade: "10-А", avgScore: 88, tests: 17, homework: 14 },
  { id: "st4", name: "Іван Бондаренко", avatar: "ІБ", email: "bondarenko@school.ua", grade: "10-Б", avgScore: 65, tests: 14, homework: 10 },
  { id: "st5", name: "Катерина Мельник", avatar: "КМ", email: "melnyk@school.ua", grade: "10-Б", avgScore: 91, tests: 19, homework: 16 },
  { id: "st6", name: "Олексій Шевченко", avatar: "ОШ", email: "shevchenko@school.ua", grade: "10-В", avgScore: 72, tests: 15, homework: 11 },
  { id: "st7", name: "Марія Захаренко", avatar: "МЗ", email: "zakharenko@school.ua", grade: "10-В", avgScore: 85, tests: 18, homework: 15 },
  { id: "st8", name: "Дмитро Лисенко", avatar: "ДЛ", email: "lysenko@school.ua", grade: "10-А", avgScore: 60, tests: 13, homework: 9 },
];

// ─── Homework ─────────────────────────────────────────────────────────────────
export const MOCK_HOMEWORK = [
  {
    id: "h1", title: "Квадратні рівняння §4.2", subject: "Математика", subjectId: "s1",
    dueDate: "2026-06-05", status: "active",
    submitted: 22, total: 28, description: "Виконати вправи 4.2.1–4.2.15",
  },
  {
    id: "h2", title: "Закони Ньютона — реферат", subject: "Фізика", subjectId: "s2",
    dueDate: "2026-06-03", status: "active",
    submitted: 18, total: 24, description: "Підготувати реферат на 2–3 сторінки",
  },
  {
    id: "h3", title: "Хімічні реакції §6", subject: "Хімія", subjectId: "s3",
    dueDate: "2026-05-30", status: "overdue",
    submitted: 20, total: 22, description: "Параграф 6, завдання 1–10",
  },
  {
    id: "h4", title: "Клітинний поділ — схема", subject: "Біологія", subjectId: "s4",
    dueDate: "2026-06-08", status: "active",
    submitted: 5, total: 30, description: "Намалювати схему мітозу та мейозу",
  },
  {
    id: "h5", title: "Козацька доба — хронологія", subject: "Історія", subjectId: "s5",
    dueDate: "2026-05-28", status: "completed",
    submitted: 26, total: 26, description: "Скласти хронологічну таблицю",
  },
];

// ─── Grades ───────────────────────────────────────────────────────────────────
export const MOCK_GRADES = [
  { id: "g1", student: "Олена Ковальська", subject: "Математика", grade: 12, date: "2026-05-28", type: "test", work: "Тест №5" },
  { id: "g2", student: "Михайло Петренко", subject: "Математика", grade: 9, date: "2026-05-28", type: "test", work: "Тест №5" },
  { id: "g3", student: "Анна Сидоренко", subject: "Математика", grade: 11, date: "2026-05-28", type: "test", work: "Тест №5" },
  { id: "g4", student: "Олена Ковальська", subject: "Фізика", grade: 10, date: "2026-05-26", type: "homework", work: "ДЗ §3" },
  { id: "g5", student: "Іван Бондаренко", subject: "Фізика", grade: 7, date: "2026-05-26", type: "homework", work: "ДЗ §3" },
  { id: "g6", student: "Катерина Мельник", subject: "Хімія", grade: 12, date: "2026-05-24", type: "test", work: "Контроль №2" },
  { id: "g7", student: "Марія Захаренко", subject: "Біологія", grade: 10, date: "2026-05-22", type: "oral", work: "Усне опитування" },
  { id: "g8", student: "Дмитро Лисенко", subject: "Математика", grade: 6, date: "2026-05-20", type: "test", work: "Тест №4" },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY_CHART = [
  { day: "Пн", tests: 4, homework: 2 },
  { day: "Вт", tests: 7, homework: 5 },
  { day: "Ср", tests: 5, homework: 3 },
  { day: "Чт", tests: 9, homework: 6 },
  { day: "Пт", tests: 12, homework: 8 },
  { day: "Сб", tests: 3, homework: 1 },
  { day: "Нд", tests: 1, homework: 0 },
];

export const MOCK_SCORE_DISTRIBUTION = [
  { range: "1–4", count: 8, color: "#ef4444" },
  { range: "5–7", count: 24, color: "#f59e0b" },
  { range: "8–10", count: 45, color: "#3b82f6" },
  { range: "11–12", count: 38, color: "#10b981" },
];

export const MOCK_SUBJECT_STATS = [
  { subject: "Математика", avg: 8.7, tests: 12 },
  { subject: "Фізика", avg: 7.9, tests: 8 },
  { subject: "Хімія", avg: 9.1, tests: 6 },
  { subject: "Біологія", avg: 8.3, tests: 9 },
  { subject: "Історія", avg: 9.4, tests: 7 },
];

// ─── Student data ─────────────────────────────────────────────────────────────
export const MOCK_STUDENT_GRADES: {
  subject: string;
  icon: SubjectIconKey;
  grades: number[];
  avg: number;
}[] = [
  { subject: "Математика", icon: "math", grades: [10, 11, 9, 12, 10], avg: 10.4 },
  { subject: "Фізика", icon: "physics", grades: [9, 8, 10, 9], avg: 9.0 },
  { subject: "Хімія", icon: "chemistry", grades: [11, 12, 11], avg: 11.3 },
  { subject: "Біологія", icon: "biology", grades: [10, 10, 11, 9], avg: 10.0 },
  { subject: "Історія", icon: "history", grades: [12, 11, 12], avg: 11.7 },
];

export const MOCK_STUDENT_HOMEWORK: {
  id: string;
  title: string;
  subject: string;
  icon: SubjectIconKey;
  dueDate: string;
  status: string;
}[] = [
  { id: "sh1", title: "Квадратні рівняння §4.2", subject: "Математика", icon: "math", dueDate: "2026-06-05", status: "pending" },
  { id: "sh2", title: "Закони Ньютона — реферат", subject: "Фізика", icon: "physics", dueDate: "2026-06-03", status: "submitted" },
  { id: "sh3", title: "Хімічні реакції §6", subject: "Хімія", icon: "chemistry", dueDate: "2026-05-30", status: "overdue" },
  { id: "sh4", title: "Клітинний поділ — схема", subject: "Біологія", icon: "biology", dueDate: "2026-06-08", status: "pending" },
  { id: "sh5", title: "Козацька доба — хронологія", subject: "Історія", icon: "history", dueDate: "2026-05-28", status: "submitted" },
];

export const MOCK_STUDENT_TESTS = [
  { id: "t1", title: "Тест з алгебри №5", subject: "Математика", score: 10, total: 12, date: "2026-05-28", pin: "482916" },
  { id: "t2", title: "Кінематика і динаміка", subject: "Фізика", score: 9, total: 10, date: "2026-05-24", pin: "193847" },
  { id: "t3", title: "Органічна хімія — контроль", subject: "Хімія", score: 11, total: 12, date: "2026-05-20", pin: "574821" },
  { id: "t4", title: "Генетика. Закони Менделя", subject: "Біологія", score: 8, total: 10, date: "2026-05-15", pin: "302948" },
  { id: "t5", title: "Козацька держава", subject: "Історія", score: 12, total: 12, date: "2026-05-10", pin: "819274" },
];

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export const MOCK_TEACHER_STATS = {
  totalTests: 38,
  totalStudents: 155,
  totalAttempts: 1247,
  avgScore: 8.4,
  testsThisWeek: 5,
  attemptsThisWeek: 87,
};

export const MOCK_RECENT_ACTIVITY = [
  { id: "a1", student: "Олена Ковальська", action: "пройшла тест", test: "Квадратні рівняння", score: 12, time: "2 хв тому" },
  { id: "a2", student: "Іван Бондаренко", action: "пройшов тест", test: "Закони Ньютона", score: 7, time: "15 хв тому" },
  { id: "a3", student: "Анна Сидоренко", action: "пройшла тест", test: "Органічна хімія", score: 11, time: "1 год тому" },
  { id: "a4", student: "Катерина Мельник", action: "пройшла тест", test: "Квадратні рівняння", score: 12, time: "2 год тому" },
  { id: "a5", student: "Дмитро Лисенко", action: "пройшов тест", test: "Генетика", score: 6, time: "3 год тому" },
];
