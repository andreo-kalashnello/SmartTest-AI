# Інструкція з тестування SmartTest-AI

> Версія: бекенд NestJS (`api/`) + фронтенд Next.js (`web/`)  
> Дата: червень 2026

---

## 1. Запуск стеку локально

### 1.1 Бекенд (NestJS, порт 4000)

```bash
cd api
cp .env.example .env          # заповніть DATABASE_URL, REDIS_URL, JWT_SECRET, OPENROUTER_API_KEY
npm install
npx prisma migrate dev        # застосувати міграції
npm run start:dev             # або npm run start:prod
```

Перевірка: `curl http://localhost:4000/api/health` → `{"status":"ok"}`

### 1.2 Фронтенд (Next.js, порт 3000)

```bash
cd web
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev
```

Відкрити: `http://localhost:3000`

> **Важливо:** `NEXT_PUBLIC_SKIP_AUTH=false` — автентифікація ввімкнена.  
> `NEXT_PUBLIC_API_URL` без `/` в кінці, `/api` вже включено в URL.

---

## 2. Що підключено до реального бекенду

| Функціонал | Ендпоінт NestJS | Статус |
|---|---|---|
| Реєстрація (teacher/student) | `POST /auth/register` | ✅ |
| Вхід | `POST /auth/login` | ✅ |
| Вихід | `POST /auth/logout` | ✅ |
| Поточний користувач (hydrate) | `GET /auth/me` | ✅ |
| Рефреш JWT | `POST /auth/refresh` | ✅ авто |
| Список тестів викладача | `GET /tests` | ✅ |
| Створення тесту вручну | `POST /tests` | ✅ |
| Перегляд/видалення тесту | `GET/DELETE /tests/:id` | ✅ |
| Спроби гостя (PIN + ПІБ) | `POST /public/attempts/start` | ✅ |
| Відповіді | `PUT /public/attempts/:id/answers` | ✅ |
| Завершення спроби | `POST /public/attempts/:id/complete` | ✅ |
| Результати тесту (для вчителя) | `GET /tests/:id/attempts` | ✅ |
| Класи вчителя (список/створення) | `GET/POST /classes` | ✅ |
| Учні класу | `GET /classes/:id/members` | ✅ |
| Перегенерація коду | `POST /classes/:id/regenerate-code` | ✅ |
| Приєднання учня до класу | `POST /classes/join` | ✅ |
| Вихід з класу | `DELETE /classes/:id/leave` | ✅ |
| Класи учня | `GET /student/classes` | ✅ |
| Спроби учня (авторизованого) | `GET /student/attempts` | ✅ |
| AI: генерація тесту | `POST /ai/jobs/create-test` | ✅ |
| AI: витяг матеріалу | `POST /ai/jobs/extract-material` | ✅ |
| AI: поллінг результату | `GET /ai/jobs/:id` | ✅ |

## 3. Що ще mock / не реалізовано на бекенді

| Функціонал | Де видно | Примітка |
|---|---|---|
| Предмети вчителя | `/dashboard/subjects` | MOCK, немає API |
| Домашні завдання (учитель/учень) | `/dashboard/homework`, `/student/homework` | MOCK |
| Оцінки (журнал) | `/dashboard/grades`, `/student/grades` | MOCK |
| Аналітика | `/dashboard/analytics` | MOCK |
| Список учнів у дашборді | `/dashboard/students` | MOCK |
| AI чат | Плаваюча кнопка на всіх сторінках | Demo UI, немає `POST /ai/chat` на бекенді |
| PATCH профілю (клас, школа) | `/student/settings` (поля Клас/Школа) | Redux only, немає PATCH /users/me |

---

## 4. Сценарій 1: Викладач

### Крок 1 — Реєстрація
1. Відкрити `http://localhost:3000/register`
2. Натиснути таб **Викладач**
3. Заповнити: Ім'я, Email, Пароль → **Зареєструватися**
4. Редірект на `/dashboard`

### Крок 2 — Створення класу
1. Бічне меню → **Класи**
2. Ввести назву класу (напр. `10-А Математика`) та школу (необов'язково)
3. **Створити клас** → з'явиться картка з кодом запрошення
4. Натиснути **Копіювати** — збережіть код, він знадобиться учню

### Крок 3 — Створення тесту вручну
1. Дашборд → **Нові Тест** (або `/dashboard/tests/new`)
2. Вкладка **Ввести вручну**
3. Заповнити назву, додати питання → **Зберегти**
4. Тест отримає унікальний PIN (6 символів)

### Крок 4 — AI-генерація тесту
1. Перейти до **Новий тест** → вкладка **З матеріалу**
2. Вставити текст або завантажити файл (PDF/DOCX)
3. Натиснути **Витягти питання** — бекенд запускає BullMQ-задачу
4. Фронтенд поллить `GET /ai/jobs/:id` кожні 2 секунди
5. Після готовності — перегляньте/відредагуйте питання → **Зберегти**

### Крок 5 — Перегляд результатів
1. `Тести` → відкрити потрібний тест
2. Вкладка **Результати** — список спроб з балами

---

## 5. Сценарій 2: Учень (зареєстрований)

### Крок 1 — Реєстрація учня
1. Відкрити `/register` → таб **Учень**
2. Заповнити: Ім'я, Email, Пароль
3. Опціонально: Клас (напр. `10-А`), Школа
4. **Зареєструватися** → редірект на `/student`

### Крок 2 — Приєднання до класу
1. `/student/settings` → розділ **Приєднатися до класу**
2. Вставити код від викладача (напр. `ABCD1234`)
3. **Приєднатися** — клас з'явиться у списку нижче

### Крок 3 — Проходження тесту (авторизовано)
1. Відкрити `/join`
2. Ввести PIN тесту від викладача
3. ПІБ автоматично підставляється з профілю (поле лише для читання)
4. Пройти тест → результати збережуться на бекенді під вашим userId
5. Результати видно у `/student/tests`

### Крок 4 — Кабінет учня
- `/student` — домашня: ім'я, клас, останні тести (реальний API)
- `/student/tests` — всі завершені спроби (реальний API)
- `/student/settings` — клас/школа та управління членством

---

## 6. Сценарій 3: Гість (без реєстрації)

1. Відкрити `/join`
2. Ввести PIN тесту
3. Ввести ПІБ вручну (будь-яке ім'я)
4. Пройти тест
5. Результати видно відразу після завершення
6. Спроба зберігається в БД із `studentId = null`

---

## 7. Перевірка через curl

### Реєстрація
```bash
curl -s -c cookies.txt -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Вчитель","email":"teacher@test.com","password":"qwerty123","role":"TEACHER"}' | jq
```

### Вхід
```bash
curl -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"teacher@test.com","password":"qwerty123"}' | jq
```

### Список тестів (з кукою)
```bash
curl -s -b cookies.txt http://localhost:4000/api/tests | jq
```

### Створення класу
```bash
curl -s -b cookies.txt -X POST http://localhost:4000/api/classes \
  -H 'Content-Type: application/json' \
  -d '{"name":"10-А Алгебра","schoolName":"Ліцей №1"}' | jq
```

### Реєстрація учня
```bash
curl -s -c student.txt -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Тест Учень","email":"student@test.com","password":"qwerty123","role":"STUDENT","grade":"10-А"}' | jq
```

### Учень приєднується до класу
```bash
curl -s -b student.txt -c student.txt -X POST http://localhost:4000/api/classes/join \
  -H 'Content-Type: application/json' \
  -d '{"inviteCode":"ABCD1234"}' | jq
```

### Спроби учня
```bash
curl -s -b student.txt http://localhost:4000/api/student/attempts | jq
```

---

## 8. Відомі обмеження бекенду

| Проблема | Деталь | Вплив на UI |
|---|---|---|
| `GET /auth/me` не повертає `grade`/`schoolName` | JWT payload містить лише `id, email, name, role` | Після перезавантаження сторінки клас/школа учня зникають із сесії (до наступного логіну) |
| Немає `PATCH /users/me` | Не можна оновити grade/schoolName через API | Поля "Клас" і "Школа" в `/student/settings` оновлюють лише Redux-стан (без збереження на сервері) |
| Немає `POST /ai/chat` | AI-чат — демо-заглушка | Кнопка чату показує mock-відповіді |

---

## 9. URL-карта додатку

| URL | Хто бачить | Backend |
|---|---|---|
| `/` | Всі | — лендінг |
| `/login` | Всі | — |
| `/register` | Всі | — |
| `/join` | Всі | `POST /public/attempts/start` |
| `/test/:pin` | Учасник спроби | `PUT /public/attempts/:id/answers` |
| `/test/:pin/results` | Всі | `GET /public/attempts/:id` *(якщо є)* |
| `/dashboard` | TEACHER | `GET /tests` |
| `/dashboard/tests/new` | TEACHER | `POST /ai/jobs/*`, `POST /tests` |
| `/dashboard/classes` | TEACHER | `GET/POST /classes`, `GET /classes/:id/members` |
| `/dashboard/students` | TEACHER | MOCK |
| `/dashboard/subjects` | TEACHER | MOCK |
| `/dashboard/homework` | TEACHER | MOCK |
| `/dashboard/grades` | TEACHER | MOCK |
| `/dashboard/analytics` | TEACHER | MOCK |
| `/student` | STUDENT | `GET /student/attempts` |
| `/student/tests` | STUDENT | `GET /student/attempts` |
| `/student/homework` | STUDENT | MOCK |
| `/student/grades` | STUDENT | MOCK |
| `/student/settings` | STUDENT | `POST /classes/join`, `GET /student/classes` |

---

## 10. Що потрібно зробити на бекенді (якщо буде час)

1. **`GET /auth/me`** — додати `grade` і `schoolName` до відповіді (з БД, не лише з JWT).  
   *Поточно: клас учня зникає після refresh сторінки.*

2. **`PATCH /users/me`** — ендпоінт для оновлення `grade` і `schoolName`.  
   *Поточно: студент не може зберегти клас на сервері.*

3. **`POST /ai/chat`** — чат-ендпоінт через OpenRouter.  
   *Поточно: демо-відповіді на фронтенді.*
