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
