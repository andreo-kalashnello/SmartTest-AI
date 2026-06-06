# SmartTest AI — Backend ТЗ на NestJS (production-oriented)

## 1. Загальна ідея

**SmartTest AI** — платформа для створення, проходження та аналізу тестів із використанням AI. Ціль backend — не просто навчальний CRUD, а система, схожа на реальний production-проєкт: окремий NestJS backend, PostgreSQL, Redis, background jobs, JWT security, observability, Swagger, Docker і готовність до VPS deployment.

---

## 2. Архітектура

```txt
SmartTest-AI/
├── web/                         # Next.js frontend
├── api/                         # NestJS backend
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

Локально:

```txt
Frontend:   http://localhost:3000
Backend:    http://localhost:4000
PostgreSQL: 127.0.0.1:5433
Redis:      127.0.0.1:6379
```

Frontend більше не використовує `web/src/app/api`. Усі запити йдуть через:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 3. Стек

### Core

```txt
NestJS
TypeScript
Prisma
PostgreSQL
Zod
JWT
httpOnly cookies
Argon2 або bcrypt
OpenRouter
pdf-parse
mammoth
pdf-lib
Docker / Docker Compose
```

### Production-oriented layer

```txt
Redis
BullMQ
Rate limiting
Swagger / OpenAPI
nestjs-pino / Pino logging
Prometheus metrics
Health checks
GitHub Actions
Nginx reverse proxy
```

### Later / advanced

```txt
Socket.IO + Redis adapter
Grafana
Loki / ELK
Sentry або GlitchTip
RabbitMQ або Kafka
Kubernetes
Terraform
```

Kafka/Kubernetes/Terraform не додавати одразу. Вони мають сенс тільки після стабільного NestJS backend, Redis/BullMQ, observability і нормального deployment.

---

## 4. NestJS modules

```txt
api/src/
├── main.ts
├── app.module.ts
├── config/
│   ├── config.module.ts
│   └── env.schema.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── token.service.ts
│   ├── password.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   ├── optional-jwt-auth.guard.ts
│   ├── current-user.decorator.ts
│   └── schemas.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── user.serializer.ts
├── tests/
│   ├── tests.module.ts
│   ├── tests.controller.ts
│   ├── tests.service.ts
│   ├── test.serializer.ts
│   ├── pin.service.ts
│   └── schemas.ts
├── attempts/
│   ├── attempts.module.ts
│   ├── attempts.controller.ts
│   ├── attempts.service.ts
│   └── schemas.ts
├── ai/
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   ├── ai.service.ts
│   ├── openrouter.service.ts
│   ├── material-extractor.service.ts
│   ├── ai-queue.service.ts
│   ├── ai-jobs.processor.ts
│   └── schemas.ts
├── classes/
│   ├── classes.module.ts
│   ├── classes.controller.ts
│   ├── classes.service.ts
│   ├── class-code.service.ts
│   └── schemas.ts
├── student/
│   ├── student.module.ts
│   ├── student.controller.ts
│   └── student.service.ts
├── analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts
├── health/
│   ├── health.module.ts
│   └── health.controller.ts
├── metrics/
│   ├── metrics.module.ts
│   └── metrics.service.ts
└── common/
    ├── filters/
    ├── pipes/
    ├── interceptors/
    ├── decorators/
    └── errors/
```

---

## 5. Environment

Backend `.env`:

```env
NODE_ENV="development"
PORT="4000"
DATABASE_URL="postgresql://smarttest:smarttest@127.0.0.1:5433/smarttest?schema=public"
FRONTEND_URL="http://localhost:3000"
APP_NAME="SmartTest AI"
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
COOKIE_ACCESS_NAME="smarttest_access_token"
COOKIE_REFRESH_NAME="smarttest_refresh_token"
COOKIE_SECURE="false"
COOKIE_SAME_SITE="lax"
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="openrouter/free"
OPENROUTER_VISION_MODEL="openrouter/free"
OPENROUTER_MAX_TOKENS="1200"
OPENROUTER_TIMEOUT_MS="30000"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
RATE_LIMIT_TTL_SECONDS="60"
RATE_LIMIT_MAX_REQUESTS="100"
LOG_LEVEL="info"
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Всі env бажано валідовувати на старті через Zod.

---

## 6. Prisma / Database

Prisma належить backend package `api`.

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm --filter api prisma:deploy
pnpm --filter api prisma:studio
```

Очікувані моделі:

```txt
User
Session
Test
Question
Option
TestAttempt
Answer
School
Class
ClassMember
AiJob
```

---

## 7. Roles

```prisma
enum Role {
  TEACHER
  STUDENT
}
```

У `User` мають бути поля:

```txt
id
email
name
passwordHash
role
grade?
schoolName?
createdAt
updatedAt
```

Teacher має доступ до:

```txt
tests CRUD
classes management
AI create/generate/extract
teacher analytics
```

Student має доступ до:

```txt
student attempts
student classes
join class
```

Public доступ:

```txt
attempt by PIN
optional AI chat help
```

---

## 8. Auth and Security

Endpoints:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
POST /auth/refresh
```

### JWT approach

- access JWT в `httpOnly` cookie;
- refresh JWT в `httpOnly` cookie;
- refresh session зберігається в БД;
- logout відкликає session;
- refresh token rotation бажано реалізувати у Phase 2.

### TokenService

Створити wrapper:

```txt
TokenService
```

Він відповідає за:

```txt
generateAccessToken
generateRefreshToken
verifyAccessToken
verifyRefreshToken
parse payload
expiration config
```

Не розкидати `jwtService.sign()` по всьому коду.

### Opaque refresh token hash

Refresh token не зберігати plain text.

```prisma
model Session {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshTokenHash String
  userAgent        String?
  ipAddress        String?
  expiresAt        DateTime
  revokedAt        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId])
}
```

### Security requirements

```txt
Argon2 or bcrypt password hashing
Helmet
CORS whitelist
Zod validation
Rate limit on auth and AI routes
No secrets in logs
Request size limits
```

---

## 9. Rate limiting

Перший рівень: Nest Throttler. Production-oriented рівень: Redis-backed rate limit.

Обмежити:

```txt
POST /auth/login
POST /auth/register
POST /ai/*
POST /public/attempts/start
POST /ai/chat
```

Орієнтовно:

```txt
login: 5 спроб / хв / IP або email
AI routes: 10–20 запитів / хв / userId
public attempt start: 20 запитів / хв / IP
```

---

## 10. Tests API

Teacher routes:

```txt
GET    /tests
POST   /tests
GET    /tests/:id
PUT    /tests/:id
DELETE /tests/:id
GET    /tests/:id/attempts
```

### POST /tests

- only teacher;
- generate unique PIN;
- save test/questions/options;
- validate exactly one correct option per question.

### PUT /tests/:id

- only owner teacher;
- update title;
- replace all questions/options in Prisma transaction;
- preserve test id and PIN.

### GET /tests/:id/attempts

Return attempts for teacher analytics, including guest and registered students.

---

## 11. Public attempts API

```txt
POST  /public/attempts/start
PATCH /public/attempts/:id/answers
POST  /public/attempts/:id/complete
```

Two modes:

| Mode | Auth | Data |
|---|---|---|
| Guest | no auth | studentName, studentId = null |
| Registered student | JWT cookie | studentId = currentUser.id |

### Start attempt

- find test by PIN;
- create attempt;
- if authenticated student, link attempt to student;
- return player-safe test without correct answers.

### Save answers

- validate question/option belong to test;
- upsert answers;
- reject completed attempt.

### Complete

- calculate score;
- set status `COMPLETED`;
- save completedAt.

---

## 12. Classes and students

Endpoints:

```txt
GET    /classes
POST   /classes
POST   /classes/join
GET    /classes/:id/members
POST   /classes/:id/regenerate-code
DELETE /classes/:id/leave
```

Required models:

```txt
School
Class
ClassMember
```

Teacher creates classes and invite codes. Student joins by invite code.

---

## 13. Student API

```txt
GET /student/attempts
GET /student/classes
```

Only role `STUDENT`.

`/student/attempts` returns only attempts where:

```txt
studentId = currentUser.id
```

---

## 14. AI API

Synchronous routes:

```txt
POST /ai/generate-questions
POST /ai/create-test
POST /ai/extract-material
POST /ai/chat
```

### generate-questions

- only teacher;
- call OpenRouter;
- require JSON-only output;
- validate generated questions with Zod;
- do not save to DB.

### create-test

- only teacher;
- generate questions;
- save test;
- generate PIN;
- return saved test + model + usage.

### extract-material

- only teacher;
- `multipart/form-data`, field `file`;
- supported: PDF, JPG, PNG, WEBP;
- PDF extraction locally via `pdf-parse`;
- image extraction via OpenRouter vision;
- do not store file permanently.

### ai/chat

- optional auth;
- help with platform navigation and explanations;
- must not help cheat during active tests;
- later add stricter rate limit.

---

## 15. Redis + BullMQ background jobs

AI and file processing can be slow, so треба додати background jobs.

Queues:

```txt
ai-generation
material-extraction
pdf-export
email-notifications later
```

Model:

```prisma
enum AiJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model AiJob {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String
  status    AiJobStatus @default(PENDING)
  input     Json
  result    Json?
  error     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([status])
}
```

Async endpoints:

```txt
POST /ai/jobs/create-test
GET  /ai/jobs/:id
```

Flow:

```txt
teacher uploads PDF/text
backend creates AiJob
BullMQ worker processes extraction/generation
job status changes to COMPLETED/FAILED
frontend polls GET /ai/jobs/:id
teacher receives generated test
```

Це Phase 3, не перша міграція.

---

## 16. PDF export

Use `pdf-lib`.

Future endpoints:

```txt
GET /tests/:id/export/pdf
GET /tests/:id/attempts/export/pdf
```

If export becomes slow, move it to BullMQ queue.

---

## 17. Observability

### Structured logging

Use:

```txt
nestjs-pino
pino
```

Log:

```txt
requestId
method
url
statusCode
responseTime
userId if authenticated
error stack in development
```

Do not log secrets.

### Request ID

Add middleware/interceptor:

```txt
x-request-id
```

Attach it to logs and return in response headers.

### Metrics

Add:

```txt
GET /metrics
```

Prometheus metrics:

```txt
http_requests_total
http_request_duration_seconds
http_errors_total
ai_requests_total
ai_request_duration_seconds
ai_errors_total
ai_tokens_total
ai_cost_total
test_attempts_started_total
test_attempts_completed_total
pdf_extract_duration_seconds
material_extract_errors_total
queue_jobs_total
queue_job_duration_seconds
queue_failed_jobs_total
```

### Health checks

```txt
GET /health
GET /health/db
GET /health/redis
```

---

## 18. Swagger / OpenAPI

Add:

```txt
GET /docs
```

Document:

```txt
auth
tests
public attempts
AI
classes
student
analytics
```

Swagger is required for frontend/backend integration and portfolio presentation.

---

## 19. Error handling

Use global exception filter.

Response style:

```json
{
  "message": "Validation error",
  "errors": []
}
```

Unauthorized:

```json
{
  "message": "Unauthorized"
}
```

OpenRouter error:

```json
{
  "message": "OpenRouter request failed",
  "details": "..."
}
```

Never leak:

```txt
API keys
JWT secrets
passwordHash
refreshTokenHash
```

---

## 20. Frontend API helper

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

Important:

```txt
always credentials: include
do not manually set Content-Type for FormData
```

---

## 21. Docker Compose

```yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: smarttest
      POSTGRES_PASSWORD: smarttest
      POSTGRES_DB: smarttest
    ports:
      - "5433:5432"
    volumes:
      - smarttest_postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  smarttest_postgres_data:
```

Later add:

```txt
api
web
nginx
prometheus
grafana
```

---

## 22. CI/CD

GitHub Actions pipeline:

```txt
install dependencies
lint
typecheck
test
prisma validate
build api
build web
docker build
```

Later deploy to VPS:

```txt
SSH into server
pull latest
install/pull images
run migrations
restart services
```

---

## 23. Testing

Minimum:

```txt
AuthService unit tests
TokenService unit tests
PasswordService unit tests
TestsService unit tests
Attempts flow e2e tests
AI service mocked tests
```

Stack:

```txt
Jest
Supertest
Testcontainers later
```

E2E flows:

```txt
register/login/me/logout
create test
start attempt
save answers
complete attempt
teacher sees attempt
student sees own attempt
```

---

## 24. Deployment direction

VPS:

```txt
Nginx
├── frontend Next.js
├── backend NestJS
├── PostgreSQL Docker
└── Redis Docker
```

Possible domains:

```txt
smarttestai.duckdns.org      -> frontend
api.smarttestai.duckdns.org  -> backend
```

Required:

```txt
Nginx reverse proxy
HTTPS via Certbot
.env on server
database migration on deploy
logs
PostgreSQL backup script
```

---

## 25. Roadmap

### Phase 1 — NestJS migration and stabilization

- Move API from Next.js to NestJS.
- Move Prisma to backend.
- Keep existing auth/tests/attempts/AI working.
- Frontend calls backend via `NEXT_PUBLIC_API_URL`.

### Phase 2 — Security/Auth upgrade

- JWT access token.
- Refresh token.
- Session table.
- Opaque refresh token hash.
- Logout revoke.
- Roles.
- Argon2.
- Helmet.
- Basic rate limiting.

### Phase 3 — Redis + BullMQ

- Add Redis.
- Add BullMQ.
- Move AI generation and material extraction to background jobs.
- Add job status endpoint.

### Phase 4 — Classes and student accounts

- Add teacher/student roles.
- Add classes.
- Add invite codes.
- Add student dashboard.
- Add teacher attempts analytics.

### Phase 5 — Observability

- Add structured logging.
- Add requestId.
- Add health checks.
- Add Prometheus `/metrics`.
- Optional Grafana dashboard.

### Phase 6 — Deployment quality

- Dockerize api/web.
- Nginx reverse proxy.
- GitHub Actions.
- VPS deployment.
- Backups.

### Phase 7 — Advanced future

- Socket.IO realtime teacher dashboard.
- Redis adapter for Socket.IO.
- RabbitMQ/Kafka for analytics/notifications if project grows.
- Kubernetes/Terraform only after Docker/VPS flow is stable.

---

## 26. What not to do immediately

Do not add everything at once.

Avoid in early phase:

```txt
Kafka
Kubernetes
Terraform
microservices
CQRS everywhere
event sourcing
complex LMS logic
```

First priority:

```txt
stable NestJS backend + security + Redis/BullMQ + observability
```

---

## 27. Acceptance criteria

Project is production-oriented enough when:

- backend runs separately on port 4000;
- frontend runs separately on port 3000;
- DB is in Docker;
- Redis is in Docker;
- auth uses JWT httpOnly cookies;
- refresh sessions are supported or architecture is ready;
- teacher/student roles work;
- teacher can create/manage tests;
- guest and student can pass tests;
- AI routes work through OpenRouter;
- PDF extraction works locally;
- image extraction works through vision model;
- background jobs exist for long AI tasks;
- rate limiting exists for critical routes;
- Swagger docs exist;
- health endpoints exist;
- structured logs exist;
- basic metrics exist;
- deployment to VPS is possible.
