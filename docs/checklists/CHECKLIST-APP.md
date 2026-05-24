# Чеклист: приложение целиком (сквозные задачи)

---

## Репозиторий и соглашения

- [x] **v1-test** `.gitignore` (env, .next, node_modules)
- [x] **v1-test** `web/.env.example` (DATABASE_URL, AUTH_SECRET, OPENROUTER_*)
- [ ] **june-full** CONTRIBUTING

---

## Контракт API и типы

- [x] **v1-test** Префикс `/api/*` (Next Route Handlers)
- [x] **v1-test** Ошибки: `{ message }`, validation → `{ message, errors }`
- [ ] **june-full** OpenAPI / shared types

---

## Безопасность

- [x] **v1-test** Секреты в env (не в коде)
- [ ] **v1-test** HTTPS на проде
- [ ] **v1-test** CSRF для cookie-сессий (не реализовано)
- [ ] **june-full** Rate limit (login, AI, upload)

---

## Docker и локальная среда

- [x] **v1-test** `docker-compose.yml` — PostgreSQL
- [x] **v1-test** Команды в [`web/README.md`](../../web/README.md) и корневом README
- [ ] **v1-test** Один compose поднимает app + DB

---

## Деплой (VPS)

- [ ] **v1-test** Prod-сборка на сервере
- [ ] **v1-test** Nginx reverse proxy
- [ ] **june-full** CI/CD

---

## Definition of Done — тестовая v1

1. [x] Новый разработчик может поднять проект по README (Postgres + migrate + dev).
2. [ ] Демо на VPS по HTTPS.
3. [x] Секреты не в git.
4. [x] API не отдаёт stack trace в prod-ответах (generic 500).

**Запуск и тесты:** [`web/README.md`](../../web/README.md)
