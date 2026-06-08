//src/homework/homework.serializer.ts
import { Homework, HomeworkSubmit, Subject, User } from '@prisma/client';

type HomeworkWithSubjectAndCount = Homework & {
    subject: Pick<Subject, 'id' | 'name' | 'icon'>;
    _count?: { submissions: number };
};

function attachmentMeta(item: {
  attachmentName: string | null;
  attachmentMimeType: string | null;
  attachmentSize: number | null;
}) {
  if (!item.attachmentName) return null;
  return {
    fileName: item.attachmentName,
    mimeType: item.attachmentMimeType,
    size: item.attachmentSize,
  };
}

type HomeworkWithSubjectAndSubmission = HomeworkWithSubjectAndCount & {
    submissions: HomeworkSubmit[];
};

type SubmitWithStudent = HomeworkSubmit & {
    student: Pick<User, 'id' | 'email' | 'name' | 'grade' | 'schoolName'>;
};

export function serializeHomework(homework: HomeworkWithSubjectAndCount) {
    return {
        id: homework.id,
        teacherId: homework.teacherId,
        subjectId: homework.subjectId,
        subject: homework.subject,
        title: homework.title,
        description: homework.description,
    dueAt: homework.dueAt?.toISOString() ?? null,
    attachment: attachmentMeta(homework),
    submissionCount: homework._count?.submissions ?? 0,
        createdAt: homework.createdAt.toISOString(),
        updatedAt: homework.updatedAt.toISOString(),
    };
}

export function serializeStudentHomework(
    homework: HomeworkWithSubjectAndSubmission,
) {
    const submission = homework.submissions[0] ?? null;
    return {
        ...serializeHomework(homework),
        submission: submission
            ? {
          id: submission.id,
          content: submission.content,
          attachment: attachmentMeta(submission),
          submittedAt: submission.submittedAt.toISOString(),
              }
            : null,
    };
}

export function serializeHomeworkSubmission(submission: SubmitWithStudent) {
    return {
        id: submission.id,
        homeworkId: submission.homeworkId,
    content: submission.content,
    attachment: attachmentMeta(submission),
    submittedAt: submission.submittedAt.toISOString(),
        student: {
            id: submission.student.id,
            email: submission.student.email,
            name: submission.student.name,
            grade: submission.student.grade,
            schoolName: submission.student.schoolName,
        },
    };
}
