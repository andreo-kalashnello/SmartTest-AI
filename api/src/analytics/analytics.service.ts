//src/analytics/analytics.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';

function avg(values: number[]) {
    if (values.length === 0) return null;
    return Number(
        (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(
            2,
        ),
    );
}

function percentFromGrade(value: number | null) {
    if (value === null) return 0;
    return Math.round((value / 12) * 100);
}

function startOfCurrentWeek(date = new Date()) {
    const start = new Date(date);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    return start;
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function academicYear(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startsThisYear = month >= 8;
    const startYear = startsThisYear ? year : year - 1;
    return `${startYear}/${startYear + 1} н.р.`;
}

function gradeDistribution(values: number[]) {
    const buckets = [
        { key: '1-4', label: '1-4 балів', min: 1, max: 4 },
        { key: '5-7', label: '5-7 балів', min: 5, max: 7 },
        { key: '8-10', label: '8-10 балів', min: 8, max: 10 },
        { key: '11-12', label: '11-12 балів', min: 11, max: 12 },
    ];

    return buckets.map((bucket) => {
        const count = values.filter(
            (value) => value >= bucket.min && value <= bucket.max,
        ).length;
        return {
            key: bucket.key,
            label: bucket.label,
            count,
            percent:
                values.length > 0 ? Math.round((count / values.length) * 100) : 0,
        };
    });
}

@Injectable()
export class AnalyticsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly subjects: SubjectsService,
    ) {}

    async teacher(user: CurrentUserPayload) {
        const weekStart = startOfCurrentWeek();
        const weekEnd = addDays(weekStart, 7);
        const [
            subjectsCount,
            homeworkCount,
            grades,
            testsCount,
            attemptsCount,
            studentsCount,
            weeklyHomework,
            weeklyAttempts,
        ] = await Promise.all([
            this.prisma.subject.count({ where: { teacherId: user.id } }),
            this.prisma.homework.count({ where: { teacherId: user.id } }),
            this.prisma.grade.findMany({
                where: { teacherId: user.id },
                include: {
                    subject: { select: { id: true, name: true, icon: true } },
                    student: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.test.count({ where: { teacherId: user.id } }),
            this.prisma.testAttempt.count({
                where: { test: { teacherId: user.id } },
            }),
            this.prisma.enrollment.findMany({
                where: { subject: { teacherId: user.id } },
                distinct: ['studentId'],
                select: { studentId: true },
            }),
            this.prisma.homework.findMany({
                where: {
                    teacherId: user.id,
                    createdAt: { gte: weekStart, lt: weekEnd },
                },
                select: { createdAt: true },
            }),
            this.prisma.testAttempt.findMany({
                where: {
                    test: { teacherId: user.id },
                    startedAt: { gte: weekStart, lt: weekEnd },
                },
                select: { startedAt: true },
            }),
        ]);

        const bySubject = await this.prisma.subject.findMany({
            where: { teacherId: user.id },
            select: {
                id: true,
                name: true,
                icon: true,
                grades: { select: { value: true } },
                _count: {
                    select: { enrollments: true, homework: true, tests: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const averageGrade = avg(grades.map((grade) => grade.value));
        const subjectAnalytics = bySubject.map((subject) => {
            const averageSubjectGrade = avg(
                subject.grades.map((grade) => grade.value),
            );
            return {
                id: subject.id,
                name: subject.name,
                icon: subject.icon,
                studentCount: subject._count.enrollments,
                homeworkCount: subject._count.homework,
                testCount: subject._count.tests,
                averageGrade: averageSubjectGrade,
                successPercent: percentFromGrade(averageSubjectGrade),
            };
        });
        const bestSubject =
            subjectAnalytics
                .filter((subject) => subject.averageGrade !== null)
                .sort(
                    (left, right) =>
                        (right.averageGrade ?? 0) - (left.averageGrade ?? 0),
                )[0] ?? null;

        const studentsById = new Map<
            string,
            { id: string; name: string; email: string; total: number; count: number }
        >();
        for (const grade of grades) {
            const current = studentsById.get(grade.studentId) ?? {
                id: grade.student.id,
                name: grade.student.name,
                email: grade.student.email,
                total: 0,
                count: 0,
            };
            current.total += grade.value;
            current.count += 1;
            studentsById.set(grade.studentId, current);
        }
        const bestStudent =
            Array.from(studentsById.values())
                .map((student) => ({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    averageGrade: Number((student.total / student.count).toFixed(2)),
                    gradesCount: student.count,
                }))
                .sort(
                    (left, right) => right.averageGrade - left.averageGrade,
                )[0] ?? null;

        const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
        const weekDays = weekdays.map((label, index) => {
            const date = addDays(weekStart, index);
            const key = dateKey(date);
            return {
                label,
                date: key,
                homework: weeklyHomework.filter(
                    (item) => dateKey(item.createdAt) === key,
                ).length,
                tests: weeklyAttempts.filter(
                    (attempt) => dateKey(attempt.startedAt) === key,
                ).length,
            };
        });

        return {
            summary: {
                subjectsCount,
                homeworkCount,
                gradesCount: grades.length,
                averageGrade,
                testsCount,
                attemptsCount,
                studentsCount: studentsCount.length,
                bestSubject,
                bestStudent,
                classSuccessPercent: percentFromGrade(averageGrade),
            },
            cards: {
                bestSubject: bestSubject
                    ? {
                          value: bestSubject.averageGrade,
                          label: `Кращий предмет: ${bestSubject.name}`,
                          subject: bestSubject,
                      }
                    : null,
                bestStudent: bestStudent
                    ? {
                          value: bestStudent.name,
                          label: 'Найкращий учень',
                          student: bestStudent,
                      }
                    : null,
                classSuccess: {
                    value: percentFromGrade(averageGrade),
                    label: 'Успішність класу',
                },
                activeStudents: {
                    value: studentsCount.length,
                    label: 'Активних учнів',
                },
            },
            weeklyActivity: {
                from: weekStart.toISOString(),
                to: weekEnd.toISOString(),
                days: weekDays,
                series: {
                    homework: weekDays.map((day) => day.homework),
                    tests: weekDays.map((day) => day.tests),
                },
            },
            subjectAverages: subjectAnalytics.map((subject) => ({
                id: subject.id,
                name: subject.name,
                icon: subject.icon,
                averageGrade: subject.averageGrade,
                successPercent: subject.successPercent,
            })),
            knowledgeRadar: subjectAnalytics.map((subject) => ({
                subjectId: subject.id,
                subjectName: subject.name,
                icon: subject.icon,
                value: subject.averageGrade ?? 0,
                percent: subject.successPercent,
            })),
            gradeDistribution: gradeDistribution(
                grades.map((grade) => grade.value),
            ),
            subjects: subjectAnalytics,
        };
    }

    async student(user: CurrentUserPayload) {
        const [grades, homework, attempts, enrollments] = await Promise.all([
            this.prisma.grade.findMany({
                where: { studentId: user.id },
                include: {
                    subject: { select: { id: true, name: true, icon: true } },
                },
                orderBy: { date: 'desc' },
            }),
            this.prisma.homework.findMany({
                where: {
                    subject: { enrollments: { some: { studentId: user.id } } },
                },
                include: {
                    submissions: {
                        where: { studentId: user.id },
                        select: { id: true },
                    },
                },
            }),
            this.prisma.testAttempt.findMany({
                where: { studentId: user.id },
                select: { score: true, total: true, status: true },
            }),
            this.prisma.enrollment.findMany({
                where: { studentId: user.id },
                include: {
                    subject: { select: { id: true, name: true, icon: true } },
                },
            }),
        ]);

        const completedHomework = homework.filter(
            (item) => item.submissions.length > 0,
        ).length;
        const completedAttempts = attempts.filter(
            (attempt) => attempt.status === 'COMPLETED',
        );
        const averageGrade = avg(grades.map((grade) => grade.value));
        const subjectGradebooks = enrollments.map((enrollment) => {
            const subjectGrades = grades.filter(
                (grade) => grade.subjectId === enrollment.subjectId,
            );
            const averageSubjectGrade = avg(
                subjectGrades.map((grade) => grade.value),
            );
            return {
                id: enrollment.subject.id,
                name: enrollment.subject.name,
                icon: enrollment.subject.icon,
                averageGrade: averageSubjectGrade,
                successPercent: percentFromGrade(averageSubjectGrade),
                gradesCount: subjectGrades.length,
                grades: subjectGrades.map((grade) => ({
                    id: grade.id,
                    value: grade.value,
                    type: grade.type,
                    workTitle: grade.workTitle,
                    date: grade.date.toISOString(),
                })),
            };
        });

        return {
            summary: {
                subjectsCount: enrollments.length,
                gradesCount: grades.length,
                averageGrade,
                homeworkTotal: homework.length,
                homeworkCompleted: completedHomework,
                attemptsCompleted: completedAttempts.length,
                averageTestScorePercent: avg(
                    completedAttempts.map((attempt) =>
                        attempt.total > 0
                            ? (attempt.score / attempt.total) * 100
                            : 0,
                    ),
                ),
                schoolYear: academicYear(),
                gradeScale: '12-бальна шкала',
            },
            overview: {
                averageGrade,
                subjectsCount: enrollments.length,
                gradeScale: '12-бальна шкала',
                schoolYear: academicYear(),
            },
            knowledgeRadar: subjectGradebooks.map((subject) => ({
                subjectId: subject.id,
                subjectName: subject.name,
                icon: subject.icon,
                value: subject.averageGrade ?? 0,
                percent: subject.successPercent,
            })),
            gradeDistribution: gradeDistribution(
                grades.map((grade) => grade.value),
            ),
            subjects: subjectGradebooks,
        };
    }

    async subject(user: CurrentUserPayload, id: string) {
        await this.subjects.ensureTeacherOwnsSubject(user.id, id);
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                enrollments: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                grade: true,
                                schoolName: true,
                            },
                        },
                    },
                },
                homework: {
                    select: {
                        id: true,
                        title: true,
                        dueAt: true,
                        _count: { select: { submissions: true } },
                    },
                },
                grades: {
                    include: {
                        student: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
                tests: {
                    select: {
                        id: true,
                        title: true,
                        pin: true,
                        _count: { select: { attempts: true } },
                    },
                },
            },
        });
        if (!subject)
            throw new NotFoundException({ message: 'Subject not found' });

        return {
            subject: {
                id: subject.id,
                name: subject.name,
                icon: subject.icon,
            },
            summary: {
                studentsCount: subject.enrollments.length,
                homeworkCount: subject.homework.length,
                gradesCount: subject.grades.length,
                testsCount: subject.tests.length,
                averageGrade: avg(subject.grades.map((grade) => grade.value)),
            },
            students: subject.enrollments.map((enrollment) => {
                const studentGrades = subject.grades.filter(
                    (grade) => grade.studentId === enrollment.studentId,
                );
                return {
                    ...enrollment.student,
                    averageGrade: avg(
                        studentGrades.map((grade) => grade.value),
                    ),
                    gradesCount: studentGrades.length,
                };
            }),
            homework: subject.homework.map((homework) => ({
                id: homework.id,
                title: homework.title,
                dueAt: homework.dueAt?.toISOString() ?? null,
                submissionCount: homework._count.submissions,
            })),
            tests: subject.tests.map((test) => ({
                id: test.id,
                title: test.title,
                pin: test.pin,
                attemptsCount: test._count.attempts,
            })),
        };
    }
}
