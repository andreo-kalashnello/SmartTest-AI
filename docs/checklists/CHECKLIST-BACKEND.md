# Чеклист: бэкенд (SmartTest AI)

Метки: **v1-test** — нужно для тестовой версии; **june-full** — к полному релизу.

**Текущая реализация:** Next.js Route Handlers в [`web/src/app/api/`](../../web/src/app/api/), Prisma в [`web/prisma/`](../../web/prisma/).

---

## База данных и Prisma

- [x] **v1-test** `schema.prisma`: `User`, `Test`, `Question`, `QuestionOption`, `TestAttempt`, `Answer`
- [x] **v1-test** Первая миграция [`20260522141500_init`](../../web/prisma/migrations/20260522141500_init/migration.sql)
- [ ] **v1-test** Seed (демо-пользователь) — опционально, пока нет
- [ ] **june-full** Расширение схемы: типы вопросов, настройки теста, банк вопросов, организации
- [x] **v1-test** Индексы на `teacherId`, `pin`, `testId` (базовые)

---

## Auth.js

- [ ] **v1-test** Auth.js — **не подключён**
- [x] **v1-test** *Вместо Auth.js:* credentials + httpOnly cookie `smarttest_session` ([`session.ts`](../../web/src/shared/lib/server/session.ts))
- [x] **v1-test** Защита teacher API через `getCurrentTeacher()` → 401
- [x] **v1-test** Сессии: httpOnly, sameSite, secure в production
- [ ] **june-full** OAuth, роли, восстановление доступа

---

## API и Zod

- [x] **v1-test** `GET/POST /api/tests`, `GET/PUT /api/tests/[id]`
- [x] **v1-test** `POST /api/public/attempts/start` — PIN → попытка + данные для player
- [x] **v1-test** `PATCH .../answers`, `POST .../complete` — ответы и подсчёт балла
- [x] **v1-test** `GET /api/tests/[id]/attempts` — список попыток
- [x] **v1-test** Zod на auth, tests, attempts, AI ([`web/src/shared/lib/server/*-schemas.ts`](../../web/src/shared/lib/server/))
- [x] **v1-test** `GET /api/health`
- [ ] **june-full** Настройки теста, перемешивание на сервере
- [ ] **june-full** Экспорт CSV/Excel, аналитика

---

## Socket.IO

- [ ] **june-full** Сервер, комнаты, live-события

---

## Файлы и парсинг

- [ ] **june-full** Upload endpoint, pdf-parse, mammoth

---

## AI (OpenRouter)

- [x] **v1-test** `POST /api/ai/create-test` — тема, сложность, count, sourceText ([`openrouter.ts`](../../web/src/shared/lib/server/openrouter.ts))
- [x] **v1-test** Ключ из env, таймаут, лимит токенов, Zod-валидация ответа модели
- [ ] **june-full** PDF/DOCX → текст → AI; переключение моделей в UI
- [ ] **june-full** «Умные» дистракторы, доработка промптов

---

## PDF (pdf-lib)

- [ ] **june-full** Генерация бланков и ключей

---

## Инфраструктура и качество

- [ ] **v1-test** Dockerfile для Next.js — **нет**
- [x] **v1-test** `docker-compose.yml` — **только PostgreSQL** (порт 5433)
- [ ] **v1-test** Compose «app + postgres» одной командой
- [ ] **june-full** Rate limiting, structured logging, бэкапы БД

---

## Definition of Done — тестовая v1

1. [x] Миграции на чистой БД (`pnpm --filter web prisma:deploy`).
2. [x] Преподаватель: register/login → CRUD теста через API/UI.
3. [x] Ученик: PIN → попытка → ответы → результат в PostgreSQL.
4. [x] Zod + 4xx с `{ message }`.
5. [ ] `docker compose up` поднимает **всё** приложение (сейчас только БД).

**Запуск и тесты:** [`web/README.md`](../../web/README.md)
