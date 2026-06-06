# SmartTest AI — Technology Learning Checklist

Цей файл — roadmap для прокачки backend skills на базі SmartTest AI. Ідея: не просто додати технології, а розуміти, яку проблему кожна з них вирішує в реальному backend-продукті.

---

## 1. NestJS Core

- [ ] Modules
- [ ] Controllers
- [ ] Services
- [ ] Providers
- [ ] Dependency Injection
- [ ] Guards
- [ ] Pipes
- [ ] Interceptors
- [ ] Exception filters
- [ ] Custom decorators
- [ ] ConfigModule
- [ ] Lifecycle hooks

Практика:

- [ ] AuthModule
- [ ] TestsModule
- [ ] AttemptsModule
- [ ] AiModule
- [ ] PrismaModule
- [ ] HealthModule

Що вміти пояснити:

- чим module відрізняється від service;
- навіщо DI;
- де має бути бізнес-логіка;
- чому controller не має містити складну логіку.

---

## 2. PostgreSQL + Prisma

### PostgreSQL

- [ ] Tables
- [ ] Relations
- [ ] Indexes
- [ ] Unique constraints
- [ ] Transactions
- [ ] Cascading delete
- [ ] JSON fields
- [ ] Basic query optimization

### Prisma

- [ ] schema.prisma
- [ ] migrations
- [ ] migrate dev vs migrate deploy
- [ ] Prisma Client
- [ ] include/select
- [ ] transactions
- [ ] composite unique keys
- [ ] relation modeling

Практика:

- [ ] User
- [ ] Session
- [ ] Test
- [ ] Question
- [ ] Option
- [ ] TestAttempt
- [ ] Answer
- [ ] Class
- [ ] ClassMember
- [ ] AiJob

Що вміти пояснити:

- чому PostgreSQL;
- що таке migration;
- чому не можна редагувати стару applied migration;
- навіщо індекси;
- навіщо transaction при update test.

---

## 3. Authentication & Security

### Passwords

- [ ] bcrypt
- [ ] argon2
- [ ] salt
- [ ] password hash vs plain password

### JWT

- [ ] Access token
- [ ] Refresh token
- [ ] JWT payload
- [ ] JWT expiration
- [ ] Token rotation
- [ ] httpOnly cookies
- [ ] sameSite
- [ ] secure cookies

### Sessions

- [ ] Session table
- [ ] Refresh token hash
- [ ] Logout revoke
- [ ] Multiple devices
- [ ] Session expiration

### API security

- [ ] Helmet
- [ ] CORS
- [ ] Rate limiting
- [ ] Validation
- [ ] No secrets in logs
- [ ] Request size limits

Практика:

- [ ] TokenService wrapper
- [ ] PasswordService
- [ ] JwtAuthGuard
- [ ] RolesGuard
- [ ] OptionalJwtAuthGuard
- [ ] Session model
- [ ] Logout revoke
- [ ] Refresh endpoint

Що вміти пояснити:

- чому access token короткоживучий;
- чому refresh token треба хешувати;
- чому краще httpOnly cookie, а не localStorage;
- як працює logout з JWT;
- що таке CSRF/XSS на базовому рівні.

---

## 4. Validation / Zod

- [ ] Zod schema
- [ ] Request validation
- [ ] Response validation where needed
- [ ] Custom ZodValidationPipe
- [ ] Error formatting
- [ ] Generated AI JSON validation
- [ ] Env schema validation

Практика:

- [ ] auth schemas
- [ ] test input schemas
- [ ] attempt schemas
- [ ] AI schemas
- [ ] env schema

Що вміти пояснити:

- чому frontend validation недостатньо;
- чому AI output теж треба валідовувати;
- що робити, якщо модель повернула невалідний JSON.

---

## 5. Redis

- [ ] Key-value storage
- [ ] TTL
- [ ] Increment counters
- [ ] Cache
- [ ] Pub/Sub basics
- [ ] Redis in Docker

Практика:

- [ ] Redis connection in NestJS
- [ ] Cache simple endpoint
- [ ] Rate limit storage
- [ ] BullMQ backend
- [ ] Socket.IO adapter later

Що вміти пояснити:

- чому Redis швидкий;
- чому Redis не замінює PostgreSQL;
- де Redis корисний у SmartTest AI.

---

## 6. BullMQ / Queues

- [ ] Queue
- [ ] Worker / Processor
- [ ] Job data
- [ ] Job status
- [ ] Retry
- [ ] Failed jobs
- [ ] Delayed jobs
- [ ] Concurrency

Практика:

- [ ] AI generation queue
- [ ] Material extraction queue
- [ ] PDF export queue
- [ ] GET /ai/jobs/:id
- [ ] AiJob model in DB

Що вміти пояснити:

- чому довгі задачі не треба робити в HTTP request;
- що таке retry;
- чому queue краще для AI/PDF задач;
- як frontend може polling-ом перевіряти status.

---

## 7. OpenRouter / AI Integration

- [ ] OpenRouter API
- [ ] Free models
- [ ] Vision models
- [ ] Token usage
- [ ] Cost field
- [ ] 402 / 429 / 502 / 503 handling
- [ ] Prompt engineering
- [ ] JSON-only prompt
- [ ] Fallback model
- [ ] Timeout
- [ ] Error normalization

Практика:

- [ ] generate questions
- [ ] create test
- [ ] extract text from image
- [ ] extract PDF text locally
- [ ] validate AI output
- [ ] handle empty response

Що вміти пояснити:

- чому не можна довіряти AI output без Zod;
- чому PDF краще читати локально через pdf-parse;
- чому free models можуть бути нестабільні;
- як обробляти OpenRouter errors.

---

## 8. File Processing

- [ ] multipart/form-data
- [ ] File size limits
- [ ] MIME validation
- [ ] pdf-parse
- [ ] mammoth for docx
- [ ] pdf-lib
- [ ] Image as base64 data URL
- [ ] Do not store temp files unnecessarily

Практика:

- [ ] /ai/extract-material
- [ ] PDF text extraction
- [ ] Image text extraction
- [ ] PDF export later

Що вміти пояснити:

- різниця між текстовим PDF і сканованим PDF;
- чому image OCR потребує vision model;
- чому не можна приймати будь-який файл без перевірки.

---

## 9. Swagger / OpenAPI

- [ ] @nestjs/swagger
- [ ] Swagger setup
- [ ] Auth in Swagger
- [ ] DTO documentation
- [ ] Tags by module
- [ ] Example responses

Практика:

- [ ] /docs endpoint
- [ ] auth docs
- [ ] tests docs
- [ ] attempts docs
- [ ] ai docs

Що вміти пояснити:

- навіщо API documentation;
- чим Swagger корисний для frontend/backend команди.

---

## 10. Logging

- [ ] pino
- [ ] nestjs-pino
- [ ] request logs
- [ ] error logs
- [ ] requestId
- [ ] userId in logs
- [ ] log levels
- [ ] no secrets in logs

Практика:

- [ ] global logger
- [ ] request-id interceptor
- [ ] logs for OpenRouter errors
- [ ] logs for queue jobs

Що вміти пояснити:

- чому console.log недостатньо;
- чому JSON logs корисні;
- як знайти помилку по requestId.

---

## 11. Metrics / Observability

### Prometheus

- [ ] Counter
- [ ] Histogram
- [ ] Gauge
- [ ] /metrics endpoint
- [ ] http request duration
- [ ] error count
- [ ] AI usage metrics
- [ ] queue metrics

Практика:

- [ ] http_requests_total
- [ ] http_request_duration_seconds
- [ ] ai_requests_total
- [ ] ai_errors_total
- [ ] test_attempts_completed_total
- [ ] queue_failed_jobs_total

### Grafana later

- [ ] Add Grafana in Docker
- [ ] Create dashboard
- [ ] Request rate panel
- [ ] Error rate panel
- [ ] AI latency panel

Що вміти пояснити:

- різниця між logs і metrics;
- що таке latency;
- як зрозуміти, що endpoint повільний.

---

## 12. Health checks

- [ ] /health
- [ ] /health/db
- [ ] /health/redis
- [ ] readiness vs liveness
- [ ] DB ping
- [ ] Redis ping

Практика:

- [ ] HealthModule
- [ ] HealthController

Що вміти пояснити:

- навіщо health checks;
- як Nginx/Docker/monitoring може використовувати health endpoint.

---

## 13. Testing

### Unit tests

- [ ] AuthService
- [ ] PasswordService
- [ ] TokenService
- [ ] TestsService
- [ ] AttemptsService
- [ ] OpenRouterService mocked

### E2E tests

- [ ] register/login/me
- [ ] create test
- [ ] start attempt
- [ ] save answers
- [ ] complete attempt
- [ ] access control tests

Stack:

- [ ] Jest
- [ ] Supertest
- [ ] Test database
- [ ] Testcontainers later

Що вміти пояснити:

- різниця між unit і e2e tests;
- що треба мокати;
- чому e2e важливі для backend.

---

## 14. Docker

- [ ] Dockerfile for api
- [ ] Dockerfile for web
- [ ] docker-compose
- [ ] postgres service
- [ ] redis service
- [ ] environment variables
- [ ] volumes
- [ ] healthcheck
- [ ] logs
- [ ] container networking

Практика:

- [ ] docker compose up postgres redis
- [ ] dockerize api
- [ ] dockerize web
- [ ] run migrations in container
- [ ] local full stack via Docker Compose

Що вміти пояснити:

- різниця між image і container;
- навіщо volumes;
- як backend бачить postgres inside docker network.

---

## 15. Nginx / VPS Deployment

- [ ] Nginx reverse proxy
- [ ] api domain
- [ ] frontend domain
- [ ] HTTPS / Certbot
- [ ] PM2 or Docker deployment
- [ ] .env on server
- [ ] migrations on deploy
- [ ] database backups

Практика:

- [ ] deploy backend to VPS
- [ ] deploy frontend to VPS
- [ ] configure Nginx
- [ ] setup SSL
- [ ] test public API

Що вміти пояснити:

- навіщо reverse proxy;
- як HTTPS працює через Nginx;
- чому backend не треба відкривати напряму без proxy.

---

## 16. CI/CD

GitHub Actions:

- [ ] install
- [ ] lint
- [ ] typecheck
- [ ] test
- [ ] prisma validate
- [ ] build api
- [ ] build web
- [ ] docker build
- [ ] deploy to VPS later

Практика:

- [ ] create CI workflow
- [ ] create deploy workflow
- [ ] use GitHub secrets
- [ ] SSH deploy to VPS

Що вміти пояснити:

- що таке CI;
- що таке CD;
- чому deploy руками погано;
- де зберігати secrets.

---

## 17. Realtime later

Socket.IO:

- [ ] Gateway
- [ ] Rooms
- [ ] Events
- [ ] Auth in websocket
- [ ] Teacher live dashboard
- [ ] Redis adapter later

Практика:

- [ ] teacher sees live attempt progress
- [ ] student answer progress events
- [ ] dashboard updates without refresh

Що вміти пояснити:

- WebSocket vs HTTP;
- навіщо Redis adapter при кількох backend instances.

---

## 18. Event-driven later

Не додавати одразу.

Possible technologies:

- [ ] RabbitMQ
- [ ] Kafka

Possible future events:

- [ ] test.created
- [ ] attempt.started
- [ ] attempt.completed
- [ ] ai.job.completed
- [ ] notification.created

Що вміти пояснити:

- RabbitMQ vs Kafka на базовому рівні;
- чому Kafka не потрібна для маленького modular monolith;
- коли event-driven architecture має сенс.

---

## Suggested learning order

1. NestJS architecture
2. Prisma + PostgreSQL
3. JWT + refresh sessions
4. Zod validation
5. Redis basics
6. BullMQ queues
7. OpenRouter integration
8. Swagger
9. Logging with Pino
10. Health checks
11. Prometheus metrics
12. Testing
13. Docker Compose
14. Nginx/VPS deployment
15. GitHub Actions
16. Socket.IO
17. Kafka/RabbitMQ only later

---

## Portfolio wording

> Built a production-oriented NestJS backend for an AI-powered testing platform with JWT authentication, RBAC, PostgreSQL/Prisma persistence, Redis-based rate limiting and background jobs, OpenRouter AI integration, structured logging, health checks, metrics, Swagger API docs, Dockerized local infrastructure and VPS deployment readiness.
