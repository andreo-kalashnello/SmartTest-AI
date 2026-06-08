# Frontend integration notes for SmartTest AI backend

This file describes what frontend still needs to connect/check after backend phases 1-5.

## Backend base URL

Backend runs as a separate NestJS service:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

All frontend requests should use this value as base URL.

Important:

- Always send requests with `credentials: "include"`.
- Do not store JWT tokens in localStorage.
- Auth is cookie-based: backend sets httpOnly cookies.
- Do not manually set `Content-Type` for `FormData` uploads.

## Auth

Backend endpoints:

```http
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
POST /auth/refresh
```

Full URLs locally:

```http
POST http://localhost:4000/api/auth/register
POST http://localhost:4000/api/auth/login
GET  http://localhost:4000/api/auth/me
POST http://localhost:4000/api/auth/logout
POST http://localhost:4000/api/auth/refresh
```

Register body:

```json
{
  "name": "Dara Teacher",
  "email": "dara@example.com",
  "password": "12345678",
  "role": "TEACHER"
}
```

Student registration is also supported:

```json
{
  "name": "Student One",
  "email": "student@example.com",
  "password": "12345678",
  "role": "STUDENT",
  "grade": "8",
  "schoolName": "School name"
}
```

Login body:

```json
{
  "email": "dara@example.com",
  "password": "12345678"
}
```

Backend returns:

```json
{
  "user": {
    "id": "...",
    "email": "dara@example.com",
    "name": "Dara Teacher",
    "role": "TEACHER",
    "grade": null,
    "schoolName": null
  }
}
```

Frontend should:

- Use `GET /auth/me` on app load to hydrate session.
- If an API request returns `401`, call `POST /auth/refresh` once and retry the original request.
- If refresh also fails, clear frontend session and redirect to login.
- Use `POST /auth/logout` to revoke the backend session.

## Teacher tests

Teacher-only endpoints:

```http
GET    /tests
POST   /tests
GET    /tests/:id
PUT    /tests/:id
DELETE /tests/:id
GET    /tests/:id/attempts
```

All require logged-in teacher cookies.

Create/update body:

```json
{
  "title": "HTML test",
  "questions": [
    {
      "prompt": "What does HTML stand for?",
      "options": [
        { "text": "HyperText Markup Language", "isCorrect": true },
        { "text": "High Tech Modern Language", "isCorrect": false }
      ]
    }
  ]
}
```

Frontend should:

- Keep using backend-generated `pin`.
- Never generate PIN on frontend.
- Allow empty `questions` only where current backend validation allows it.
- Treat test ownership errors as `404`/not found.

## Public attempts for students

Public endpoints:

```http
POST  /public/attempts/start
PATCH /public/attempts/:id/answers
POST  /public/attempts/:id/complete
```

Start body:

```json
{
  "pin": "123456",
  "studentName": "Student One"
}
```

Start response:

```json
{
  "attemptId": "...",
  "test": {
    "id": "...",
    "title": "HTML test",
    "pin": "123456",
    "questions": [
      {
        "id": "...",
        "prompt": "...",
        "options": [
          { "id": "...", "text": "..." }
        ]
      }
    ]
  }
}
```

Important:

- Public player payload does not include `isCorrect`.
- Frontend should not expect correct answers before completion.
- If a logged-in `STUDENT` starts an attempt, backend links the attempt to `studentId`.
- If no student cookie is present, the attempt remains a guest attempt.

Save answers body:

```json
{
  "answers": [
    {
      "questionId": "...",
      "optionId": "..."
    }
  ]
}
```

Complete returns:

```json
{
  "result": {
    "id": "...",
    "testId": "...",
    "studentName": "Student One",
    "answers": {},
    "score": 2,
    "total": 3,
    "completedAt": "..."
  }
}
```

## Classes

Teacher/student class endpoints were added in Phase 4.

### Teacher classes

Teacher-only:

```http
GET  /classes
POST /classes
GET  /classes/:id/members
POST /classes/:id/regenerate-code
```

Create class:

```http
POST /classes
```

Body:

```json
{
  "name": "8-A Math",
  "schoolName": "School name"
}
```

Response:

```json
{
  "class": {
    "id": "...",
    "name": "8-A Math",
    "inviteCode": "ABCD2345",
    "teacherId": "...",
    "school": {
      "id": "...",
      "name": "School name"
    },
    "memberCount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Frontend should:

- Show `inviteCode` only to teacher.
- Use `POST /classes/:id/regenerate-code` if teacher wants a new invite code.
- After invite code regeneration, old code stops working.

Get members:

```http
GET /classes/:id/members
```

Response:

```json
{
  "members": [
    {
      "id": "...",
      "classId": "...",
      "role": "STUDENT",
      "joinedAt": "...",
      "user": {
        "id": "...",
        "email": "student@example.com",
        "name": "Student One",
        "role": "STUDENT",
        "grade": "8",
        "schoolName": "School name"
      }
    }
  ]
}
```

### Student joins class

Student-only:

```http
POST   /classes/join
DELETE /classes/:id/leave
```

Join body:

```json
{
  "inviteCode": "ABCD2345"
}
```

Response:

```json
{
  "class": {
    "id": "...",
    "name": "8-A Math",
    "teacherId": "...",
    "school": {
      "id": "...",
      "name": "School name"
    },
    "memberCount": 3,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Frontend should:

- Ask student for invite code.
- Send code as uppercase or any case; backend normalizes to uppercase.
- Treat duplicate join as `409`.
- Use `DELETE /classes/:id/leave` for leaving a class.

## Student dashboard endpoints

Student-only:

```http
GET /student/classes
GET /student/attempts
```

`GET /student/classes` returns classes where current student is a member:

```json
{
  "classes": [
    {
      "id": "...",
      "name": "8-A Math",
      "teacherId": "...",
      "school": null,
      "memberCount": 3,
      "joinedAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

`GET /student/attempts` returns only attempts linked to current student:

```json
{
  "attempts": [
    {
      "id": "...",
      "testId": "...",
      "test": {
        "id": "...",
        "title": "HTML test",
        "pin": "123456"
      },
      "studentName": "Student One",
      "status": "COMPLETED",
      "answers": {},
      "score": 2,
      "total": 3,
      "startedAt": "...",
      "completedAt": "..."
    }
  ]
}
```

Important:

- Guest attempts are not shown in `/student/attempts`.
- Student attempt appears here only if student was logged in when starting attempt by PIN.

## Teacher attempts analytics

Existing endpoint:

```http
GET /tests/:id/attempts
```

Now includes extra fields:

```json
{
  "attempts": [
    {
      "id": "...",
      "testId": "...",
      "studentId": "...",
      "studentName": "Student One",
      "student": {
        "id": "...",
        "email": "student@example.com",
        "name": "Student One",
        "role": "STUDENT",
        "grade": "8",
        "schoolName": "School name"
      },
      "status": "COMPLETED",
      "answers": {},
      "score": 2,
      "total": 3,
      "startedAt": "...",
      "completedAt": "..."
    }
  ]
}
```

For guest attempts:

```json
{
  "studentId": null,
  "student": null
}
```

## Subjects

Phase C added subjects, enrollments, homework, grades and analytics.

Subject endpoints:

```http
GET    /subjects
POST   /subjects
PUT    /subjects/:id
DELETE /subjects/:id
POST   /subjects/:id/enroll
DELETE /subjects/:id/enroll
GET    /subjects/:id/students
```

Teacher:

- `GET /subjects` returns teacher subjects.
- `POST /subjects` creates subject.
- `PUT /subjects/:id` updates teacher-owned subject.
- `DELETE /subjects/:id` deletes teacher-owned subject.
- `GET /subjects/:id/students` returns enrolled students.

Student:

- `GET /subjects` returns enrolled subjects.
- `POST /subjects/:id/enroll` enrolls current student.
- `DELETE /subjects/:id/enroll` unenrolls current student.

Create/update body:

```json
{
  "name": "Mathematics",
  "icon": "calculator"
}
```

Response shape:

```json
{
  "subject": {
    "id": "...",
    "teacherId": "...",
    "name": "Mathematics",
    "icon": "calculator",
    "studentCount": 1,
    "homeworkCount": 0,
    "testCount": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Tests can optionally be linked to subject:

```json
{
  "title": "Algebra test",
  "subjectId": "...",
  "questions": []
}
```

## Homework

Homework endpoints:

```http
GET    /homework
POST   /homework
PUT    /homework/:id
DELETE /homework/:id
POST   /homework/:id/attachment
GET    /homework/:id/attachment
DELETE /homework/:id/attachment
GET    /homework/student
POST   /homework/:id/submit
GET    /homework/:id/submissions
GET    /homework/:id/submissions/:submissionId/attachment
```

Teacher:

- `GET /homework` returns teacher homework.
- `POST /homework` creates homework for teacher-owned subject.
- `PUT /homework/:id` updates teacher-owned homework.
- `DELETE /homework/:id` deletes teacher-owned homework.
- `POST /homework/:id/attachment` uploads/replaces one teacher attachment.
- `DELETE /homework/:id/attachment` removes teacher attachment.
- `GET /homework/:id/submissions` returns student submissions.

Student:

- `GET /homework/student` returns homework from enrolled subjects.
- `GET /homework/:id/attachment` downloads teacher attachment if student is enrolled.
- `POST /homework/:id/submit` creates or updates own submission, optionally with file.
- `GET /homework/:id/submissions/:submissionId/attachment` downloads own submission file. Teacher can download any submission file for owned homework.

Create/update body:

```json
{
  "subjectId": "...",
  "title": "Read chapter 1",
  "description": "Solve exercises 1-5",
  "dueAt": "2026-06-20T18:00:00.000Z"
}
```

Submit body:

JSON without file:

```json
{
  "content": "My answer text or link"
}
```

Multipart with file:

```txt
Content-Type: multipart/form-data

content = My answer text
file    = answer.pdf
```

Teacher homework attachment upload:

```txt
POST /homework/:id/attachment
Content-Type: multipart/form-data

file = task.pdf
```

Important:

- Student can submit homework only if enrolled in homework subject.
- Re-submitting updates previous submission.
- If re-submitting without `file`, existing submission file is kept.
- Allowed attachment formats: PDF, DOC, DOCX, TXT, JPG, PNG, WEBP.
- Default max attachment size: 5MB (`HOMEWORK_UPLOAD_MAX_BYTES`).
- Attachments are stored in Postgres as protected binary data for now.

## Grades

Grade endpoints:

```http
GET    /grades
POST   /grades
PUT    /grades/:id
DELETE /grades/:id
GET    /grades/my
```

Teacher:

- `GET /grades` returns teacher-created grades.
- `POST /grades` creates grade.
- `PUT /grades/:id` updates teacher-owned grade.
- `DELETE /grades/:id` deletes teacher-owned grade.

Student:

- `GET /grades/my` returns current student's grades.

Create/update body:

```json
{
  "studentId": "...",
  "subjectId": "...",
  "value": 10,
  "type": "homework",
  "workTitle": "Chapter 1 homework",
  "date": "2026-06-20T18:00:00.000Z"
}
```

Important:

- `value` is integer from 1 to 12.
- Teacher can grade only inside own subject.
- Student must be enrolled in that subject.

## Analytics

Analytics endpoints:

```http
GET /analytics/teacher
GET /analytics/student
GET /analytics/subject/:id
```

Teacher analytics now returns old summary fields plus UI-ready blocks for the analytics page.

Teacher response:

```txt
summary
cards
weeklyActivity
subjectAverages
knowledgeRadar
gradeDistribution
subjects
```

`summary` still includes:

```txt
subjectsCount
homeworkCount
gradesCount
averageGrade
testsCount
attemptsCount
studentsCount
subjects[]
bestSubject
bestStudent
classSuccessPercent
```

`cards` is for the top teacher dashboard cards:

```json
{
  "bestSubject": {
    "value": 9.4,
    "label": "Кращий предмет: Історія",
    "subject": {}
  },
  "bestStudent": {
    "value": "Олена К.",
    "label": "Найкращий учень",
    "student": {}
  },
  "classSuccess": {
    "value": 87,
    "label": "Успішність класу"
  },
  "activeStudents": {
    "value": 155,
    "label": "Активних учнів"
  }
}
```

`weeklyActivity` is for the line chart:

```json
{
  "from": "...",
  "to": "...",
  "days": [
    { "label": "Пн", "date": "2026-06-08", "homework": 2, "tests": 4 }
  ],
  "series": {
    "homework": [2, 5, 3, 6, 8, 1, 0],
    "tests": [4, 7, 5, 9, 12, 3, 1]
  }
}
```

`subjectAverages` is for horizontal bars. `averageGrade` is on the 1-12 scale:

```json
[
  {
    "id": "...",
    "name": "Історія",
    "icon": "book",
    "averageGrade": 9.4,
    "successPercent": 78
  }
]
```

`knowledgeRadar` is for radar charts:

```json
[
  {
    "subjectId": "...",
    "subjectName": "Математика",
    "icon": "calculator",
    "value": 10.4,
    "percent": 87
  }
]
```

`gradeDistribution` buckets grades into ranges:

```json
[
  { "key": "1-4", "label": "1-4 балів", "count": 8, "percent": 5 },
  { "key": "5-7", "label": "5-7 балів", "count": 24, "percent": 15 },
  { "key": "8-10", "label": "8-10 балів", "count": 80, "percent": 52 },
  { "key": "11-12", "label": "11-12 балів", "count": 43, "percent": 28 }
]
```

Student analytics now returns old summary fields plus UI-ready gradebook blocks.

Student response:

```txt
summary
overview
knowledgeRadar
gradeDistribution
subjects
```

`summary` still includes:

```txt
subjectsCount
gradesCount
averageGrade
homeworkTotal
homeworkCompleted
attemptsCompleted
averageTestScorePercent
subjects[]
schoolYear
gradeScale
```

`overview` is for the main average grade card:

```json
{
  "averageGrade": 10.5,
  "subjectsCount": 5,
  "gradeScale": "12-бальна шкала",
  "schoolYear": "2025/2026 н.р."
}
```

`subjects` includes per-subject grade chips and subject average:

```json
[
  {
    "id": "...",
    "name": "Математика",
    "icon": "calculator",
    "averageGrade": 10.4,
    "successPercent": 87,
    "gradesCount": 5,
    "grades": [
      {
        "id": "...",
        "value": 10,
        "type": "homework",
        "workTitle": "Chapter 1 homework",
        "date": "2026-06-20T18:00:00.000Z"
      }
    ]
  }
]
```

Subject analytics returns:

```txt
subject
summary
students[]
homework[]
tests[]
```

## AI generation now uses background jobs

Old synchronous AI endpoints were removed:

```http
POST /ai/generate-questions
POST /ai/create-test
POST /ai/extract-material
```

Frontend must use only job endpoints:

```http
POST /ai/jobs/create-test
POST /ai/jobs/extract-material
GET  /ai/jobs/:id
```

### Create AI test

Request:

```http
POST /ai/jobs/create-test
```

Body:

```json
{
  "title": "HTML test",
  "topic": "HTML basics",
  "count": 3,
  "difficulty": "easy",
  "language": "auto",
  "sourceText": "Optional source material"
}
```

Immediate response:

```json
{
  "job": {
    "id": "...",
    "type": "create-test",
    "status": "PENDING",
    "input": {},
    "result": null,
    "error": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Then poll:

```http
GET /ai/jobs/:id
```

Possible statuses:

```txt
PENDING
PROCESSING
COMPLETED
FAILED
```

When completed, `job.result` contains:

```json
{
  "test": {
    "id": "...",
    "title": "...",
    "pin": "...",
    "questions": []
  },
  "model": "...",
  "usage": {},
  "language": "uk"
}
```

Frontend should redirect teacher to:

```txt
/dashboard/tests/:testId/edit
```

### Extract material from file

Request:

```http
POST /ai/jobs/extract-material
```

Body type: `multipart/form-data`

Field:

```txt
file
```

Supported:

```txt
PDF, JPG, PNG, WEBP
```

Immediate response is a job. Poll `GET /ai/jobs/:id`.

When completed, `job.result` contains:

```json
{
  "fileName": "material.pdf",
  "mimeType": "application/pdf",
  "text": "Extracted text..."
}
```

Frontend should:

- Show scanning/loading state while job is `PENDING` or `PROCESSING`.
- Add extracted text into the AI source material only after `COMPLETED`.
- Show `job.error` if status is `FAILED`.

Suggested polling:

```txt
interval: 1000-2000 ms
timeout: 2-3 minutes
```

## API helper requirements

Recommended shared helper behavior:

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}
```

Add refresh retry logic:

```txt
request -> 401 -> POST /auth/refresh -> retry original request once
```

Do not retry infinitely.

## Local backend requirements for frontend testing

Before testing AI jobs, backend developer should have:

```powershell
docker compose up -d
docker compose exec redis redis-cli ping
pnpm --filter api dev
```

Redis ping must return:

```txt
PONG
```

If Redis is not running, AI job endpoints will not work correctly because BullMQ needs Redis.

## Observability endpoints

Phase 5 added backend observability. Frontend does not need to integrate these into UI right now, but they are useful for debugging and deployment checks.

Health endpoints:

```http
GET /health
GET /health/db
GET /health/redis
```

Full local URLs:

```http
GET http://localhost:4000/api/health
GET http://localhost:4000/api/health/db
GET http://localhost:4000/api/health/redis
```

Successful response example:

```json
{
  "ok": true,
  "dependency": "db",
  "timestamp": "..."
}
```

Prometheus metrics endpoint:

```http
GET /metrics
```

Full local URL:

```http
GET http://localhost:4000/api/metrics
```

It returns plain text in Prometheus format, not JSON.

Important response header:

```txt
Content-Type: text/plain; version=0.0.4; charset=utf-8
```

Every API response now includes:

```txt
x-request-id
```

Frontend can optionally log this value when showing/reporting errors. This helps backend find the matching structured log line.

Example frontend debug handling:

```ts
const requestId = response.headers.get("x-request-id");
```

Do not show request id as normal UI text unless it is an error/debug screen.

### Grafana and Prometheus

Prometheus and Grafana are configured in Docker Compose for local/educational production-style monitoring.

Local URLs:

```txt
Prometheus: http://localhost:9090
Grafana:    http://localhost:3001
```

Grafana login:

```txt
user:     admin
password: smarttest
```

Grafana datasource is provisioned automatically:

```txt
SmartTest Prometheus -> http://prometheus:9090
```

Prometheus scrapes backend metrics from:

```txt
http://host.docker.internal:4000/api/metrics
```

So the backend must be running on the host machine:

```powershell
pnpm --filter api dev
```

Storage is intentionally small for the olympiad/demo project:

```txt
Prometheus retention time: 6h
Prometheus retention size: 128MB
```

This prevents metrics from filling the computer/server disk.

Logs are currently structured JSON logs written to backend stdout/terminal. They are not stored in Loki or files yet, intentionally. This avoids accumulating log data before the API is dockerized. Later, after API Docker deployment, Loki/Promtail can be added with short retention.

## Manual frontend acceptance checklist

- Register teacher.
- Login teacher.
- Refresh browser page and session stays active via `GET /auth/me`.
- Create manual test.
- Edit test questions/options.
- Open attempts page for test.
- Start student attempt by PIN.
- Save answers.
- Complete attempt and see score.
- Teacher sees completed attempt.
- Teacher creates class and sees invite code.
- Student joins class by invite code.
- Student sees own classes in `/student/classes`.
- Logged-in student starts attempt by PIN.
- Student sees own attempt in `/student/attempts`.
- Teacher attempts page shows registered student data for linked attempts.
- Create AI test through `/ai/jobs/create-test`.
- File scan works through `/ai/jobs/extract-material`.
- AI job failure displays readable error from `job.error`.
- Expired access token is refreshed through `/auth/refresh`.
- `GET /health`, `/health/db`, `/health/redis` return healthy responses.
- `GET /metrics` returns Prometheus text metrics.
- Failed frontend requests can capture `x-request-id` for debugging.
