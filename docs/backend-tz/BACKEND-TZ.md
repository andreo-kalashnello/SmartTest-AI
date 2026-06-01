# ТЗ для бекенду — SmartTest AI (Full Release)

## Огляд проєкту

SmartTest AI — освітня платформа для вчителів і учнів. Бекенд реалізовано у вигляді **Next.js Route Handlers** (монорепо, каталог `web/src/app/api/`).

**Стек:** Node 22, Next.js 15, Prisma ORM, PostgreSQL 16, OpenRouter AI, cookie-auth.

---

## 1. Нові API-ендпоінти (що треба реалізувати)

### 1.1 Ролі користувачів

Зараз є один `User`. Потрібно додати поле `role`.

**Зміни в схемі Prisma:**

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
  grade        String?  // клас для учнів (напр. "10-А")
  // ... relations ...
}
```

**Зміни в API:**

`POST /api/auth/register`
```json
{
  "name": "Олена Ковальська",
  "email": "olena@school.ua",
  "password": "password123",
  "role": "STUDENT",       // "TEACHER" | "STUDENT"
  "grade": "10-А"          // тільки для STUDENT
}
```

`GET /api/auth/me` — повертати `role` і `grade`.

---

### 1.2 Предмети (Subjects)

```prisma
model Subject {
  id        String     @id @default(cuid())
  name      String
  icon      String?
  teacherId String
  teacher   User       @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  tests     Test[]
  homework  Homework[]
  grades    Grade[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

| Метод | URL | Авт. | Опис |
|-------|-----|------|------|
| GET | `/api/subjects` | teacher | Список предметів вчителя |
| POST | `/api/subjects` | teacher | Створити предмет |
| PUT | `/api/subjects/[id]` | teacher | Редагувати |
| DELETE | `/api/subjects/[id]` | teacher | Видалити |

---

### 1.3 Домашні завдання (Homework)

```prisma
model Homework {
  id          String           @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  subjectId   String
  subject     Subject          @relation(...)
  teacherId   String
  teacher     User             @relation(...)
  submissions HomeworkSubmit[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model HomeworkSubmit {
  id         String   @id @default(cuid())
  homeworkId String
  homework   Homework @relation(...)
  studentId  String
  student    User     @relation(...)
  content    String?
  fileUrl    String?
  status     String   @default("submitted") // submitted | reviewed
  createdAt  DateTime @default(now())
}
```

| Метод | URL | Авт. | Опис |
|-------|-----|------|------|
| GET | `/api/homework` | teacher | Список ДЗ вчителя |
| POST | `/api/homework` | teacher | Створити ДЗ |
| PUT | `/api/homework/[id]` | teacher | Редагувати |
| DELETE | `/api/homework/[id]` | teacher | Видалити |
| GET | `/api/homework/student` | student | Список ДЗ для учня (за класом/предметом) |
| POST | `/api/homework/[id]/submit` | student | Здати ДЗ |
| GET | `/api/homework/[id]/submissions` | teacher | Перегляд здач |

---

### 1.4 Оцінки (Grades)

```prisma
model Grade {
  id        String   @id @default(cuid())
  studentId String
  student   User     @relation("StudentGrades", ...)
  teacherId String
  teacher   User     @relation("TeacherGrades", ...)
  subjectId String
  subject   Subject  @relation(...)
  value     Int      // 1–12
  type      String   // "test" | "homework" | "oral" | "project"
  workTitle String?
  date      DateTime @default(now())
  createdAt DateTime @default(now())
}
```

| Метод | URL | Авт. | Опис |
|-------|-----|------|------|
| GET | `/api/grades` | teacher | Журнал оцінок вчителя |
| POST | `/api/grades` | teacher | Виставити оцінку |
| PUT | `/api/grades/[id]` | teacher | Редагувати оцінку |
| DELETE | `/api/grades/[id]` | teacher | Видалити оцінку |
| GET | `/api/grades/my` | student | Оцінки поточного учня |

---

### 1.5 Класи і зарахування (Enrollment)

```prisma
model Enrollment {
  id        String  @id @default(cuid())
  studentId String
  student   User    @relation("EnrolledStudent", ...)
  subjectId String
  subject   Subject @relation(...)
  createdAt DateTime @default(now())

  @@unique([studentId, subjectId])
}
```

| Метод | URL | Авт. | Опис |
|-------|-----|------|------|
| POST | `/api/subjects/[id]/enroll` | student | Записатись на предмет |
| DELETE | `/api/subjects/[id]/enroll` | student | Відписатись |
| GET | `/api/subjects/[id]/students` | teacher | Учні предмету |

---

### 1.6 Аналітика

| Метод | URL | Авт. | Опис |
|-------|-----|------|------|
| GET | `/api/analytics/teacher` | teacher | Зведена статистика вчителя |
| GET | `/api/analytics/subject/[id]` | teacher | Статистика предмету |
| GET | `/api/analytics/student` | student | Прогрес поточного учня |

**Відповідь `GET /api/analytics/teacher`:**
```json
{
  "totalTests": 38,
  "totalStudents": 155,
  "totalAttempts": 1247,
  "avgScore": 8.4,
  "activityByDay": [{ "day": "Пн", "tests": 4, "homework": 2 }],
  "scoreDistribution": [{ "range": "10–12", "count": 38 }],
  "subjectStats": [{ "subject": "Математика", "avg": 8.7 }]
}
```

---

### 1.7 Зміни в існуючих ендпоінтах

- `POST /api/tests` — додати `subjectId?: string`
- `GET /api/tests` — учень бачить тільки тести своїх предметів
- `GET /api/tests/[id]/attempts` — вчитель бачить, є можливість фільтру
- `POST /api/ai/create-test` — без змін

---

## 2. Авторизація і middleware

- Cookie-сесія: `smarttest_session` (HMAC, 7 днів) — вже є
- Перевіряти роль: `getCurrentTeacher()` і `getCurrentStudent()` як helper-функції
- Учень не може звертатись до `/api/tests`, `/api/homework`, `/api/grades` (методи вчителя)
- Вчитель не може звертатись до `/api/grades/my`, `/api/homework/student`

---

## 3. Міграції Prisma

Порядок:

1. Додати поле `role` і `grade` до `User`
2. Додати модель `Subject`
3. Додати модель `Homework` і `HomeworkSubmit`
4. Додати модель `Grade`
5. Додати модель `Enrollment`
6. Додати `subjectId` до `Test` (nullable, FK)

```bash
cd web
pnpm prisma migrate dev --name add-roles-subjects-homework-grades
pnpm prisma generate
```

---

## 4. Структура проєкту

```
web/src/app/api/
├── auth/
│   ├── login/route.ts         ✅
│   ├── logout/route.ts        ✅
│   ├── me/route.ts            ✅ (додати role)
│   └── register/route.ts      ✅ (додати role, grade)
├── subjects/
│   ├── route.ts               🔲 GET/POST
│   └── [id]/
│       ├── route.ts           🔲 PUT/DELETE
│       ├── enroll/route.ts    🔲 POST/DELETE
│       └── students/route.ts  🔲 GET
├── homework/
│   ├── route.ts               🔲 GET/POST
│   ├── student/route.ts       🔲 GET (для учня)
│   └── [id]/
│       ├── route.ts           🔲 PUT/DELETE
│       └── submit/route.ts    🔲 POST
│       └── submissions/route.ts 🔲 GET
├── grades/
│   ├── route.ts               🔲 GET/POST
│   ├── my/route.ts            🔲 GET (для учня)
│   └── [id]/route.ts          🔲 PUT/DELETE
├── analytics/
│   ├── teacher/route.ts       🔲 GET
│   ├── student/route.ts       🔲 GET
│   └── subject/[id]/route.ts  🔲 GET
├── tests/
│   ├── route.ts               ✅
│   └── [id]/
│       ├── route.ts           ✅
│       └── attempts/route.ts  ✅
├── public/attempts/...        ✅
├── ai/
│   ├── create-test/route.ts   ✅
│   └── extract-material/route.ts ✅
└── health/route.ts            ✅
```

---

## 5. Запуск і тестування

### 5.1 Локальний запуск

```bash
# Клонувати репо
git clone https://github.com/andreo-kalashnello/SmartTest-AI.git
cd SmartTest-AI

# Запустити PostgreSQL
docker compose up -d

# Встановити залежності
pnpm install

# Налаштувати .env
cp web/.env.example web/.env
# Заповнити: DATABASE_URL, AUTH_SECRET, OPENROUTER_API_KEY

# Міграції + клієнт
pnpm prisma:generate
pnpm prisma:deploy

# Запустити dev
pnpm dev
```

Додаток: http://localhost:3000

### 5.2 Тестування ендпоінтів

**Реєстрація вчителя:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Петренко","email":"teacher@test.ua","password":"Test1234","role":"TEACHER"}'
```

**Реєстрація учня:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Марія Іваненко","email":"student@test.ua","password":"Test1234","role":"STUDENT","grade":"10-А"}'
```

**Вхід:**
```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.ua","password":"Test1234"}'
```

**Перевірка сесії:**
```bash
curl -b cookies.txt http://localhost:3000/api/auth/me
```

**Створити предмет (вчитель):**
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"name":"Математика","icon":"📐"}'
```

**Виставити оцінку:**
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/grades \
  -H "Content-Type: application/json" \
  -d '{"studentId":"...","subjectId":"...","value":10,"type":"test","workTitle":"Тест №5"}'
```

### 5.3 Seed-дані (для розробки)

Створи `web/prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/lib/server/password";

const prisma = new PrismaClient();

async function main() {
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.ua" },
    update: {},
    create: {
      name: "Демо Вчитель",
      email: "teacher@demo.ua",
      passwordHash: hashPassword("Demo1234"),
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@demo.ua" },
    update: {},
    create: {
      name: "Демо Учень",
      email: "student@demo.ua",
      passwordHash: hashPassword("Demo1234"),
      role: "STUDENT",
      grade: "10-А",
    },
  });

  console.log("Seed complete", { teacher: teacher.email, student: student.email });
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Запуск seed:
```bash
pnpm --filter web exec ts-node prisma/seed.ts
```

---

## 6. Мінімальний MVP для бекендера

Пріоритет реалізації:

1. ✅ **Поле `role`** в `User` + API реєстрації/входу з роллю
2. 🔲 **CRUD предметів** (`Subject` + `/api/subjects`)
3. 🔲 **Журнал оцінок** (`Grade` + `/api/grades`)
4. 🔲 **ДЗ** (`Homework` + `/api/homework`)
5. 🔲 **Аналітика** (агрегаційні запити)
6. 🔲 **Зарахування учнів** (`Enrollment`)

---

## 7. Deployment (сервер 159.89.106.184)

```bash
ssh root@159.89.106.184
cd /opt/SmartTest-AI
git pull
pnpm install
pnpm prisma:generate
pnpm prisma:deploy   # застосовує нові міграції
export NODE_OPTIONS="--max-old-space-size=1536"
pnpm build
pm2 restart smarttest-web
```

Health check: http://smarttestai.duckdns.org/api/health
