# SmartTest AI — приложение (`web`)

Next.js 15 fullstack: UI + API Routes + Prisma + PostgreSQL.

**Стек:** React 19, Redux Toolkit, Tailwind, shadcn/ui, Zod, react-hook-form, OpenRouter (ИИ).

---

## Требования

- Node.js 20+
- pnpm 9+
- Docker (для PostgreSQL) или свой экземпляр Postgres

---

## Запуск с нуля

### 1. PostgreSQL

```bash
# из корня репозитория
docker compose up -d
```

Postgres слушает **localhost:5433** (см. `docker-compose.yml`).

### 2. Переменные окружения

```bash
cp web/.env.example web/.env.local
```

Минимум в `web/.env.local`:

```env
DATABASE_URL="postgresql://smarttest:smarttest@localhost:5433/smarttest?schema=public"
AUTH_SECRET="dev-secret-at-least-32-characters-long"
OPENROUTER_API_KEY="sk-or-..."   # только для «Создать с ИИ»
OPENROUTER_MAX_TOKENS="3000"     # для reasoning-моделей (cobuddy) не ставьте 700
```

### 3. Миграции и Prisma Client

```bash
pnpm install
pnpm --filter web prisma:generate
pnpm --filter web prisma:deploy
```

### 4. Dev-сервер

```bash
pnpm dev
```

Откройте http://localhost:3000

### Проверка API

```bash
curl http://localhost:3000/api/health
```

---

## Как протестировать (сквозной сценарий)

### A. Преподаватель

1. **Регистрация:** http://localhost:3000/register  
   Email, пароль (≥6), имя → редирект на `/dashboard`.

2. **Список тестов:** http://localhost:3000/dashboard  
   Без входа API вернёт 401 — список будет пустым. Нужна сессия (cookie).

3. **Создать тест вручную:** «Створити тест» → название → редактор.  
   Добавьте вопросы, отметьте один правильный вариант → «Зберегти».

4. **Создать с ИИ:** на `/dashboard/tests/new` — блок «Створити з ШІ»  
   Тема, количество (1–10), сложность, опционально текст материала.  
   Нужен `OPENROUTER_API_KEY` в `.env.local`.

5. **PIN:** на карточке теста или в редакторе — скопируйте 6-значный PIN.

6. **Спроби:** `/dashboard/tests/[id]/attempts` — таблица после прохождения учеником.

### B. Ученик

1. http://localhost:3000/join — PIN + ФИО.  
2. Плеер: ответы → «Далі» → «Завершити».  
3. Результат: балл и процент.

### C. Выход

Кнопка «Вийти» в шапке дашборда → `/api/auth/logout`.

---

## Временные настройки

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `NEXT_PUBLIC_SKIP_AUTH` | не `false` | UI дашборда без редиректа на `/login`. **API всё равно требует cookie.** |
| `NEXT_PUBLIC_SKIP_AUTH=false` | — | Строгий `AuthGuard` на `/dashboard/*`. |

---

## Сборка

```bash
pnpm --filter web build
pnpm --filter web start
```

---

## API (v1)

| Метод | Путь | Кто |
|-------|------|-----|
| GET | `/api/health` | все |
| POST | `/api/auth/register`, `/login`, `/logout` | все / teacher |
| GET | `/api/auth/me` | teacher |
| GET/POST | `/api/tests` | teacher |
| GET/PUT | `/api/tests/[id]` | teacher |
| GET | `/api/tests/[id]/attempts` | teacher |
| POST | `/api/ai/create-test` | teacher + OpenRouter |
| POST | `/api/public/attempts/start` | ученик (PIN) |
| PATCH | `/api/public/attempts/[id]/answers` | ученик |
| POST | `/api/public/attempts/[id]/complete` | ученик |

Авторизация: httpOnly cookie `smarttest_session` (своя реализация, не Auth.js).
