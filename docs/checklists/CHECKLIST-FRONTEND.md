# Чеклист: фронтенд (SmartTest AI)

Метки: **v1-test** — нужно для тестовой версии; **june-full** — к полному релизу.

**Состояние:** UI подключён к **реальному API** (`/api/*`). Legacy `localDb` остался только для `seedDemoIfEmpty` в bootstrap (не используется при работе с БД).

---

## Проект и TypeScript

- [x] **v1-test** Next.js App Router в [`web/`](../../web/), **pnpm**
- [x] **v1-test** TypeScript strict
- [x] **v1-test** ESLint (next lint в build)
- [ ] **june-full** Prettier / pre-commit

---

## Стили и UI-kit

- [x] **v1-test** Tailwind CSS
- [x] **v1-test** shadcn/ui: Button, Input, Label, Card, Dialog
- [x] **v1-test** Textarea, LoadingButton, Badge
- [ ] **june-full** Table, Tabs, Toast, Dropdown

---

## Redux

- [x] **v1-test** Store + слайсы `authSession`, `teacherTestDraft`, `studentAttempt`, `appShell`
- [x] **v1-test** Thunks → `/api/auth/*`, `/api/tests/*`, `/api/public/attempts/*`
- [ ] **june-full** RTK Query, кэш, инвалидация

---

## Маршруты и layout

- [x] **v1-test** `/`, `/join`, `/login`, `/register`, `/dashboard/*`, `/test/[pin]/*`, 404
- [x] **v1-test** Teacher layout: `AuthGuard` + `TeacherHeader`
- [x] **v1-test** `/dashboard/tests/new` — ручное создание **+ форма «Створити з ШІ»**
- [ ] **june-full** Marketing layout; live-мониторинг

---

## Формы и UX

- [x] **v1-test** Zod + react-hook-form
- [x] **v1-test** Loading / ошибки на формах
- [ ] **june-full** Skeleton, пустые состояния, i18n

---

## Интеграция с бэкендом

- [x] **v1-test** Fetch к same-origin `/api/*` с `credentials: "include"`
- [x] **v1-test** Cookie-сессия (hydrate через `/api/auth/me`)
- [x] **v1-test** `apiFetch` + `ApiError` (для внешнего API, если понадобится)
- [ ] **v1-test** Убрать legacy `localDb` из bootstrap
- [ ] **v1-test** Обновить тексты форм login/join (ещё упоминают localStorage / demo PIN)
- [ ] **june-full** Socket.IO client

---

## Доступность и адаптив

- [x] **v1-test** Mobile-first: join, player
- [x] **v1-test** Labels, aria-invalid, progressbar, radiogroup
- [ ] **june-full** Полный keyboard audit

---

## FSD

- [x] **v1-test** Каркас `app`, `views`, `widgets`, `features`, `entities`, `shared`
- [ ] **june-full** Строгая изоляция слоёв

---

## Definition of Done — тестовая v1

1. [x] Преподаватель создаёт тест, получает PIN из API.
2. [x] Ученик проходит тест, видит результат.
3. [x] Loading и ошибки на ключевых действиях.
4. [x] Адаптив player + join.
5. [x] Redux для сессии, черновика, попытки.

**Запуск и тесты:** [`web/README.md`](../../web/README.md)
