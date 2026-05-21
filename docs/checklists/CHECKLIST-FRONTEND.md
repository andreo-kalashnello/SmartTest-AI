# Чеклист: фронтенд (SmartTest AI)

Метки: **v1-test** — нужно для тестовой версии; **june-full** — к полному релизу.

Фокус команды: **сначала фронт** под минимальный бэкенд; сложные экраны и real-time — по мере готовности API.

---

## Проект и TypeScript

- [x] **v1-test** Инициализация Next.js (App Router) в [`web/`](../../web/), менеджер пакетов **pnpm**
- [x] **v1-test** Строгий TypeScript (`strict: true`), единый стиль импортов
- [ ] **june-full** ESLint + Prettier (или Biome), pre-commit по желанию

---

## Стили и UI-kit

- [x] **v1-test** Tailwind CSS подключён, базовые токены (цвета, шрифты, радиусы) согласованы с продуктом
- [x] **v1-test** shadcn/ui: Button, Input, Label, Card, Dialog (или Sheet) — минимум для форм и модалок
- [x] **v1-test** Textarea, LoadingButton, Badge — для редакторов и форм v1
- [ ] **june-full** Расширение набора компонентов (Table, Tabs, Toast, Dropdown и т.д.)
- [ ] **june-full** Тёмная тема / переключатель, если входит в дизайн

---

## Redux

- [x] **v1-test** Store: конфигурация (Redux Toolkit) в [`web/src/shared/lib/store`](../../web/src/shared/lib/store)
- [x] **v1-test** Слайсы: `authSession`, `teacherTestDraft`, `studentAttempt` (+ `appShell`)
- [x] **v1-test** Async thunks для локального демо (`localDb`); **потрібен бек** для RTK Query / реальних API
- [ ] **june-full** Кэширование списков тестов, инвалидация после мутаций
- [ ] **june-full** Оптимистичные обновления там, где уместно

---

## Маршруты и layout

- [x] **v1-test** Публичная главная + `/join` (PIN + ПІБ)
- [x] **v1-test** `/login`, `/register` — зона викладача (локальна авторизація)
- [x] **v1-test** `/dashboard`, створення/редагування тесту, спроби
- [x] **v1-test** Player: `/test/[pin]/play` — один вопрос, прогресс, «Далі» / «Завершити»
- [x] **v1-test** Результат: `/test/[pin]/results`
- [x] **v1-test** Layout teacher (`AuthGuard` + header); **потрібен бек** для Next middleware + серверної сесії
- [ ] **june-full** Окремі marketing layout; Socket live

---

## Формы и UX

- [x] **v1-test** Zod + react-hook-form (login, register, join, new test)
- [x] **v1-test** Loading / ошибки на кнопках и формах (`LoadingButton`, `role="alert"`)
- [ ] **june-full** Skeleton-экраны, пустые состояния, i18n при необходимости

---

## Интеграция с бэкендом

- [x] **v1-test** `apiFetch` + `ApiError`, base URL з `NEXT_PUBLIC_API_URL`
- [x] **v1-test** Обработка 401/403 в `apiFetch` (**потрібен бек** — зараз дашборд через клієнтський `AuthGuard` + sessionStorage)
- [x] **v1-test** Демо без API: `web/src/shared/lib/storage/local-db.ts`
- [ ] **june-full** Socket.IO client, переподключение, индикатор «live»
- [ ] **june-full** Загрузка файлов (progress, ограничение размера на клиенте)

---

## Доступность и адаптив

- [x] **v1-test** Мобильная вёрстка для player и `/join` (mobile-first, кнопки на всю ширину)
- [x] **v1-test** Label + `aria-invalid`, progressbar, radiogroup у плеєрі
- [ ] **june-full** Прогоны с клавиатуры по основным сценариям

---

## FSD (Feature-Sliced Design)

- [x] **v1-test** Каркас FSD у [`web/src`](../../web/src): `app`, `views`, `widgets`, `features`, `entities`, `shared`
- [ ] **june-full** Дотримання правил публічних API шарів, рефакторинг імпортів

---

## Definition of Done — тестовая v1

1. [x] Преподаватель после входа может создать тест с несколькими вопросами (один правильный ответ) и получить PIN (локально; **потрібен бек** для серверного PIN/посилання).
2. [x] Ученик вводит PIN и имя, проходит все вопросы, видит итог.
3. [x] Ключевые действия: loading и сообщения об ошибках.
4. [x] Интерфейс для демо на телефоне (player + join).
5. [x] Redux для сессии, черновика теста и попытки ученика.

**Як тестувати:** [`web/README.md`](../../web/README.md)
