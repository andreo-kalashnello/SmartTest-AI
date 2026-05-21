# SmartTest AI — фронтенд (`web`)

Next.js 15 (App Router), React 19, Redux Toolkit, Tailwind, shadcn/ui, Zod, react-hook-form.

## Запуск

```bash
# з кореня монорепо
pnpm install
pnpm --filter web dev
```

Відкрийте http://localhost:3000

## Тестова v1 (без бекенду)

Дані зберігаються в **localStorage** (користувачі, тести, спроби) та **sessionStorage** (сесія викладача). При першому відкритті створюється демо-тест з PIN `123456`.

### Сценарій викладача

1. `/register` — реєстрація (email, пароль, ім'я).
2. `/dashboard` — список тестів, «Створити тест».
3. `/dashboard/tests/new` — назва → редактор.
4. `/dashboard/tests/[id]/edit` — питання, один правильний варіант, «Зберегти».
5. Скопіюйте PIN з картки або редактора.
6. `/dashboard/tests/[id]/attempts` — таблиця спроб учнів (після проходження).

### Сценарій учня

1. `/join` — PIN `123456` (демо) + ПІБ.
2. `/test/[pin]/play` — плеєр, прогрес, «Далі» / «Завершити».
3. `/test/[pin]/results` — бал і відсоток.

### Захист маршрутів

**Тимчасово** `/dashboard` доступний без логіну (`NEXT_PUBLIC_SKIP_AUTH` за замовчуванням не `false`).

Щоб знову вимагати вхід: у `web/.env.local` додайте `NEXT_PUBLIC_SKIP_AUTH=false` і перезапустіть dev.

**Потрібен бек** для middleware + JWT/сесії Auth.js.

### API

`NEXT_PUBLIC_API_URL` у `.env` — коли з'явиться бекенд. Зараз thunks використовують `localDb`; `apiFetch` кидає помилку, якщо URL порожній.

## Збірка

```bash
pnpm --filter web build
```
