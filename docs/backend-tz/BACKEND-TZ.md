# ТЗ для бекенду — SmartTest AI (Full Release v2)

## Огляд

**SmartTest AI** — платформа для вчителів і учнів: тести з ШІ, проходження за PIN, кабінети, школи/класи, AI-чат.

| Шар | Технологія |
|-----|------------|
| API | Next.js 15 Route Handlers (`web/src/app/api/`) |
| БД | PostgreSQL 16 + Prisma |
| Auth | Cookie `smarttest_session` (HMAC, 7 днів) |
| AI | OpenRouter (`/api/ai/*`) |

**Фронт уже зроблено (мок/UI):** реєстрація з вибором ролі, кабінет учня `/student`, класи `/dashboard/classes`, AI-чат (віджет), `/join` для гостей і залогінених учнів.

**Бекенд зараз:** один `User` без `role` в Prisma; роль при реєстрації **echo** в JSON + **localStorage** на клієнті до міграції.

---

## 0. Два сценарії проходження тесту (обовʼязково зрозуміти)

| Сценарій | Хто | Auth | Як заходить | Що зберігати |
|----------|-----|------|-------------|--------------|
| **Гість** | Будь-хто | Ні | `/join` → PIN + ПІБ | `TestAttempt` з `studentName`, `studentId = null` |
| **Учень з акаунтом** | `role=STUDENT` | Cookie | `/join` (імʼя з профілю) або з кабінету | `TestAttempt.studentId` + імʼя для відображення |

Вчитель у «Спробах» бачить обидва типи; у аналітиці учня — лише свої спроби з `studentId`.

---

## 1. Пріоритети (MVP → Full)

### Фаза A — без цього фронт «бреше»

1. **`User.role`** (`TEACHER` \| `STUDENT`) + `grade`, `schoolName` в БД  
2. **`POST /api/auth/register`** — зберігати role в БД  
3. **`GET /api/auth/me`** — повертати `role`, `grade`, `schoolName`, `classCode` (через join)  
4. **`getCurrentTeacher()` / `getCurrentStudent()`** — 403 якщо роль не та  
5. **`TestAttempt.studentId`** (nullable FK → User) при submit з сесії учня  

### Фаза B — школа / клас

6. Моделі **`School`**, **`Class`**, **`ClassMember`**  
7. **`POST /api/classes`** (teacher) — створити клас, згенерувати `inviteCode`  
8. **`POST /api/classes/join`** (student) — ввести код → `ClassMember`  
9. Опційно: привʼязка тесту до `classId` (учні класу бачать тест у кабінеті)

### Фаза C — предмети, ДЗ, оцінки, аналітика

10. `Subject`, `Homework`, `Grade`, `Enrollment` — як у розділі 4 нижче  

### Фаза D — AI-чат

11. **`POST /api/ai/chat`** — стрім або JSON, контекст ролі (teacher/student/guest)

---

## 2. Схема Prisma (цільова)

```prisma
enum Role {
  TEACHER
  STUDENT
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  role         Role     @default(TEACHER)
  grade        String?  // "10-А" для учня
  schoolName   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tests            Test[]
  classMemberships ClassMember[]
  attempts         TestAttempt[] @relation("StudentAttempts")
  // homework, grades — див. розділ 4
}

model School {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  classes   Class[]
}

model Class {
  id         String   @id @default(cuid())
  name       String   // "10-А Алгебра"
  inviteCode String   @unique  // "CLS-MATH-10A" або random
  schoolId   String?
  school     School?  @relation(fields: [schoolId], references: [id])
  teacherId  String
  teacher    User     @relation("TeacherClasses", fields: [teacherId], references: [id])
  members    ClassMember[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([teacherId])
}

model ClassMember {
  id        String   @id @default(cuid())
  classId   String
  class     Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  studentId String
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  joinedAt  DateTime @default(now())

  @@unique([classId, studentId])
}

// TestAttempt — додати:
// studentId String?
// student   User? @relation("StudentAttempts", fields: [studentId], references: [id])
```

**Генерація `inviteCode`:** `CLS-` + 8 символів A-Z0-9, unique в БД.

---

## 3. Auth API (детально)

### `POST /api/auth/register`

**Request:**
```json
{
  "name": "Марія Іваненко",
  "email": "student@test.ua",
  "password": "Test1234",
  "role": "STUDENT",
  "grade": "10-А",
  "schoolName": "Ліцей №12",
  "classCode": "CLS-MATH-10A"
}
```

**Валідація:** `registerUserSchema` вже в `web/src/shared/lib/server/auth-schemas.ts`.

**Після міграції:**
- Записати `role`, `grade`, `schoolName` в `User`
- Якщо `classCode` — знайти `Class` за `inviteCode`, створити `ClassMember`

**Response 201:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "STUDENT",
    "grade": "10-А",
    "schoolName": "Ліцей №12",
    "classCode": "CLS-MATH-10A"
  }
}
```

### `POST /api/auth/login` / `GET /api/auth/me`

Повертати ті самі поля з БД (не покладатися на localStorage).

### Helpers (`web/src/shared/lib/server/current-user.ts`)

```ts
export async function getCurrentTeacher(): Promise<User | null>
export async function getCurrentStudent(): Promise<User | null>
```

- Teacher routes → `getCurrentTeacher()` або 403  
- Student routes → `getCurrentStudent()` або 403  

---

## 4. Класи API

| Метод | URL | Роль | Опис |
|-------|-----|------|------|
| GET | `/api/classes` | teacher | Список класів вчителя + `inviteCode`, кількість учнів |
| POST | `/api/classes` | teacher | `{ "name": "10-А", "schoolId?": "..." }` → новий код |
| POST | `/api/classes/[id]/regenerate-code` | teacher | Новий `inviteCode` |
| GET | `/api/classes/[id]/members` | teacher | Учні класу |
| POST | `/api/classes/join` | student | `{ "inviteCode": "CLS-..." }` |
| DELETE | `/api/classes/[id]/leave` | student | Вийти з класу |

**Response join:**
```json
{ "class": { "id": "...", "name": "10-А Алгебра", "schoolName": "..." } }
```

---

## 5. Тести і спроби (зміни)

### `POST /api/public/attempts/...` (join / submit)

- Якщо є cookie учня → записати `studentId`  
- Інакше лише `studentName` (як зараз)

### `GET /api/tests/[id]/attempts`

- Вчитель: усі спроби  
- Додати колонку «тип»: гість / зареєстрований (`studentId != null`)

### `GET /api/student/attempts` (новий)

- Список спроб поточного учня для `/student/tests`

---

## 6. AI-чат API

**UI:** `web/src/widgets/ai-chat` — плаваюча кнопка, демо-відповіді.

### `POST /api/ai/chat`

**Auth:** опційно (guest без cookie — обмежений rate limit по IP).

**Request:**
```json
{
  "message": "Як пройти тест за PIN?",
  "context": {
    "page": "/join",
    "role": "student"
  },
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:** `{ "reply": "..." }` або SSE stream.

**Системний prompt (орієнтир):**
- Допомога з навігацією SmartTest AI  
- Пояснення тем (без списування відповідей під час активного тесту, якщо `context.testPin` передано)  
- Для вчителя: підказки з AI-генерації тестів  

**Env:** той самий `OPENROUTER_API_KEY`, модель — як у `create-test`.

---

## 7. Предмети, ДЗ, оцінки, аналітика

(Без змін по суті з v1 — реалізувати після фази A–B.)

### Subject, Homework, Grade, Enrollment

Див. попередні розділи в git-історії; ключові URL:

- `/api/subjects` — CRUD (teacher)  
- `/api/homework`, `/api/homework/student`, `/api/homework/[id]/submit`  
- `/api/grades`, `/api/grades/my`  
- `/api/analytics/teacher`, `/api/analytics/student`, `/api/analytics/subject/[id]`  

Учні класу автоматично бачать ДЗ/оцінки вчителя цього класу після привʼязки `ClassMember` + `subject.classId` (або через Enrollment на предмет).

---

## 8. Міграції (порядок команд)

```bash
cd web
pnpm prisma migrate dev --name add_user_roles
pnpm prisma migrate dev --name add_schools_classes
pnpm prisma migrate dev --name add_attempt_student_id
# ... subjects, homework, grades
pnpm prisma generate
```

На проді: `pnpm prisma:deploy` з кореня монорепо.

---

## 9. Структура `web/src/app/api/` (статус)

```
auth/
  login, logout, register, me     ✅ (register echo role; me — додати role з БД)
classes/
  route.ts                        🔲 GET/POST
  join/route.ts                   🔲 POST
  [id]/
    members/route.ts              🔲 GET
    regenerate-code/route.ts      🔲 POST
student/
  attempts/route.ts               🔲 GET
ai/
  create-test/route.ts            ✅
  extract-material/route.ts       ✅
  chat/route.ts                   🔲 POST
tests/ ...                        ✅ (+ studentId на attempt)
public/attempts/ ...              ✅ (+ studentId)
subjects, homework, grades, analytics  🔲
```

---

## 10. Тестування (curl)

**Учень:**
```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Марія","email":"s@test.ua","password":"Test1234","role":"STUDENT","grade":"10-А"}'

curl -b cookies.txt http://localhost:3000/api/auth/me
```

**Приєднатися до класу:**
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/classes/join \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"CLS-MATH-10A"}'
```

**AI-чат:**
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Де взяти PIN тесту?"}'
```

---

## 11. Відповідність UI → API

| Сторінка / UI | Що чекає бекенд |
|---------------|-----------------|
| `/register` (teacher/student) | `role` в register + me |
| `/login` → redirect | `me.role` |
| `/student/*` | Student guard + реальні grades/homework/tests |
| `/student/settings` | `POST /api/classes/join` або PATCH profile |
| `/dashboard/classes` | `GET/POST /api/classes`, regenerate code |
| `/join` | guest attempt; якщо cookie — `studentId` |
| AI widget | `POST /api/ai/chat` |
| Teacher analytics | `/api/analytics/teacher` |

---

## 12. Deployment

```bash
ssh root@159.89.106.184
cd /opt/SmartTest-AI
git pull && pnpm install && pnpm prisma:generate && pnpm prisma:deploy
export NODE_OPTIONS="--max-old-space-size=1536"
pnpm build && pm2 restart smarttest-web
```

Health: http://smarttestai.duckdns.org/api/health

---

## 13. Що НЕ робити в першій ітерації

- OAuth / Google Classroom  
- Повноцінний realtime-чат (достатньо request/response)  
- Привʼязка кожного тесту до класу (можна phase 2)  

---

**Контакт з фронтом:** після зміни `me` і `register` — прибрати fallback `localStorage` у `web/src/shared/lib/client/auth-profile.ts` (залишити лише для офлайн-демо, якщо потрібно).
