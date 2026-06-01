# Чеклист: бекенд (SmartTest AI)

**Повне ТЗ:** [`docs/backend-tz/BACKEND-TZ.md`](../backend-tz/BACKEND-TZ.md) — єдине джерело правди для бекендера.  
**Цей чеклист** — контроль виконання ТЗ + **чек підключення фронту** після релізу API (щоб не дописувати ТЗ повторно).

Метки: **v1-test** — тестова версія (вже на проді); **full** — повний реліз за BACKEND-TZ v2.

**Код API:** [`web/src/app/api/`](../../web/src/app/api/) · **Prisma:** [`web/prisma/`](../../web/prisma/)

---

## Статус зараз (коротко)

| Область | v1-test | full (UI вже чекає API) |
|---------|---------|-------------------------|
| Тести, PIN, спроби гостя | ✅ | + `studentId` на спробі |
| Auth cookie | ✅ | + `role` в БД, `getCurrentStudent` |
| Реєстрація з роллю | 🟡 echo в JSON, **не в БД** | зберегти в Prisma |
| Кабінет учня `/student/*` | — | homework, grades, tests API |
| Класи `/dashboard/classes` | — | `/api/classes/*` |
| AI-чат (віджет) | — | `POST /api/ai/chat` |
| Предмети, ДЗ, журнал, аналітика | — | subjects, homework, grades, analytics |

---

## Фаза A — ролі та auth (блокер для фронту)

Без цього залишається `localStorage` у [`auth-profile.ts`](../../web/src/shared/lib/client/auth-profile.ts).

### Prisma

- [x] **v1-test** `User`, `Test`, `Question`, `QuestionOption`, `TestAttempt`, `Answer`
- [x] **v1-test** Міграція [`20260522141500_init`](../../web/prisma/migrations/20260522141500_init/migration.sql)
- [ ] **full** `enum Role { TEACHER STUDENT }`
- [ ] **full** `User.role`, `User.grade`, `User.schoolName`
- [ ] **full** `TestAttempt.studentId` (nullable FK → `User`)
- [ ] **full** Міграція `add_user_roles` + `add_attempt_student_id`

### Auth API

- [x] **v1-test** Cookie `smarttest_session` ([`session.ts`](../../web/src/shared/lib/server/session.ts))
- [x] **v1-test** `POST /api/auth/register`, `login`, `logout`, `GET /api/auth/me`
- [x] **v1-test** Zod: [`registerUserSchema`](../../web/src/shared/lib/server/auth-schemas.ts) (role, grade, classCode, schoolName)
- [ ] **full** Register **записує** `role`, `grade`, `schoolName` в БД
- [ ] **full** Login / me **повертають** `role`, `grade`, `schoolName`, `classCode` (classCode з join ClassMember)
- [ ] **full** `getCurrentTeacher()` — 401/403 якщо не TEACHER
- [ ] **full** `getCurrentStudent()` — 401/403 якщо не STUDENT
- [ ] **full** Усі teacher routes → лише TEACHER; student routes → лише STUDENT

### Спроби (guest + зареєстрований учень)

- [x] **v1-test** `POST /api/public/attempts/start` — PIN + `studentName`
- [x] **v1-test** `PATCH .../answers`, `POST .../complete`
- [ ] **full** Якщо cookie учня — встановити `TestAttempt.studentId`
- [ ] **full** `GET /api/tests/[id]/attempts` — поле/мітка guest vs registered
- [ ] **full** `GET /api/student/attempts` — для `/student/tests`

---

## Фаза B — школа та класи

UI: [`/dashboard/classes`](../../web/src/app/dashboard/classes/page.tsx), [`/student/settings`](../../web/src/app/student/settings/page.tsx).

### Prisma

- [ ] **full** `School`, `Class`, `ClassMember` (див. BACKEND-TZ §2)
- [ ] **full** `Class.inviteCode` unique, генерація `CLS-XXXXXXXX`

### API

- [ ] **full** `GET /api/classes` — список класів вчителя (+ кількість учнів)
- [ ] **full** `POST /api/classes` — створити клас
- [ ] **full** `POST /api/classes/[id]/regenerate-code`
- [ ] **full** `GET /api/classes/[id]/members`
- [ ] **full** `POST /api/classes/join` — `{ inviteCode }` (student)
- [ ] **full** `DELETE /api/classes/[id]/leave` (student)
- [ ] **full** При register з `classCode` — auto `ClassMember`

---

## Фаза C — предмети, ДЗ, оцінки, аналітика

UI (мок): `/dashboard/subjects`, `/homework`, `/grades`, `/analytics`, `/students`; учень: `/student/homework`, `/grades`, `/tests`.

### Prisma

- [ ] **full** `Subject` (teacherId, name, icon)
- [ ] **full** `Homework`, `HomeworkSubmit`
- [ ] **full** `Grade` (student, teacher, subject, value, type, workTitle, date)
- [ ] **full** `Enrollment` (studentId + subjectId) або привʼязка через classId
- [ ] **full** Опційно: `Test.subjectId`

### API — предмети

- [ ] **full** `GET/POST /api/subjects`
- [ ] **full** `PUT/DELETE /api/subjects/[id]`
- [ ] **full** `POST/DELETE /api/subjects/[id]/enroll` (student)
- [ ] **full** `GET /api/subjects/[id]/students` (teacher)

### API — домашні завдання

- [ ] **full** `GET/POST /api/homework` (teacher)
- [ ] **full** `PUT/DELETE /api/homework/[id]`
- [ ] **full** `GET /api/homework/student` (student)
- [ ] **full** `POST /api/homework/[id]/submit`
- [ ] **full** `GET /api/homework/[id]/submissions` (teacher)

### API — оцінки

- [ ] **full** `GET/POST /api/grades` (teacher)
- [ ] **full** `PUT/DELETE /api/grades/[id]`
- [ ] **full** `GET /api/grades/my` (student)

### API — аналітика

- [ ] **full** `GET /api/analytics/teacher` — зведення для `/dashboard`, `/dashboard/analytics`
- [ ] **full** `GET /api/analytics/student` — для `/student`
- [ ] **full** `GET /api/analytics/subject/[id]`

### API — учні (опційно)

- [ ] **full** Список учнів вчителя (агрегація з ClassMember + Enrollment) для `/dashboard/students`

---

## Фаза D — AI

- [x] **v1-test** `POST /api/ai/create-test` ([`openrouter.ts`](../../web/src/shared/lib/server/openrouter.ts))
- [x] **v1-test** `POST /api/ai/extract-material` — текст з PDF/фото
- [ ] **full** `POST /api/ai/chat` — body: `message`, `context`, `history`; response `{ reply }` або SSE
- [ ] **full** Rate limit для guest на `/api/ai/chat`
- [ ] **full** Не підказувати відповіді під час активного тесту (`context.testPin`)

---

## Вже зроблено (v1-test) — не ламати

- [x] `GET/POST /api/tests`, `GET/PUT /api/tests/[id]`
- [x] `GET /api/tests/[id]/attempts`
- [x] `GET /api/health`
- [x] Zod на auth, tests, attempts, AI
- [x] Індекси `teacherId`, `pin`, `testId`
- [x] Secure cookie лише на HTTPS ([`session.ts`](../../web/src/shared/lib/server/session.ts) — `cookieSecure()`)

---

## Не в scope full v2 (окреме ТЗ, якщо знадобиться)

- [ ] Auth.js / OAuth / відновлення пароля
- [ ] Socket.IO live-оновлення
- [ ] pdf-lib бланки, експорт CSV/Excel
- [ ] Docker image app + compose «все в одному»
- [ ] Типи питань, банк питань, таймер тесту, QR PIN

---

## Підключення фронту після full API (для тебе, не для бекендера)

Коли всі пункти **Фаз A–D** зібрані — виконати на фронті:

| Крок | Дія |
|------|-----|
| 1 | Видалити або вимкнути [`auth-profile.ts`](../../web/src/shared/lib/client/auth-profile.ts) (localStorage role) |
| 2 | `hydrateAuth` / `register` / `login` — брати `role` лише з `/api/auth/me` |
| 3 | [`StudentAuthGuard`](../../web/src/features/auth-guard/ui/role-auth-guard.tsx) — покладатися на `me.role` |
| 4 | [`/student/settings`](../../web/src/views/student-settings/ui/student-settings-page.tsx) → `POST /api/classes/join` + PATCH profile |
| 5 | [`teacher-classes-page`](../../web/src/views/teacher-classes/ui/teacher-classes-page.tsx) → реальні `GET/POST /api/classes` |
| 6 | [`ai-chat-widget`](../../web/src/widgets/ai-chat/ui/ai-chat-widget.tsx) → `POST /api/ai/chat` замість mock replies |
| 7 | Сторінки student/teacher dashboard — замінити [`mock-data`](../../web/src/shared/lib/mock-data/) на fetch до analytics, homework, grades, subjects |
| 8 | `NEXT_PUBLIC_SKIP_AUTH=false` на проді — перевірити guards |

Чеклист фронту: [`CHECKLIST-FUNCTIONAL.md`](CHECKLIST-FUNCTIONAL.md).

---

## Seed і тести

- [ ] **full** `web/prisma/seed.ts` — teacher@demo.ua + student@demo.ua (див. BACKEND-TZ §10)
- [ ] **full** curl-сценарії з BACKEND-TZ §10 пройдені на localhost
- [ ] **full** `pnpm prisma:deploy` на проді після міграцій

---

## Definition of Done — full release

1. [ ] Усі міграції застосовані; `prisma generate` у CI/деплої.
2. [ ] Реєстрація teacher/student → правильний `me.role` з БД.
3. [ ] Гість: PIN + ПІБ; учень з cookie: спроба з `studentId`.
4. [ ] Клас: вчитель створює код → учень join → видно в members.
5. [ ] CRUD предметів, ДЗ (submit), оцінки (my), аналітика teacher/student.
6. [ ] AI-чат відповідає через OpenRouter.
7. [ ] Фронт підключений (таблиця вище) — без mock для цих модулів.
8. [ ] Zod + 4xx `{ message }` на всіх нових route.

**Деплой:** BACKEND-TZ §12 · **Запуск локально:** [`web/README.md`](../../web/README.md)

---

## Definition of Done — тестова v1 (закрита)

1. [x] Міграції на чистій БД.
2. [x] Вчитель: register/login → CRUD тесту.
3. [x] Учень-гість: PIN → спроба → результат у PostgreSQL.
4. [x] Zod + 4xx.
5. [ ] `docker compose up` піднімає app + postgres (лише БД зараз).
