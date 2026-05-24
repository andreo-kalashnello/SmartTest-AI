# Чеклист: сторінки фронтенду (SmartTest AI)

Метки: **v1-test** / **june-full**. Маршрути: `web/src/app/`.

---

## Публічні сторінки

| Сторінка | Маршрут | Статус |
|----------|---------|--------|
| Лендінг | `/` | **v1-test** ✅ |
| Реєстрація | `/register` | **v1-test** ✅ |
| Вхід | `/login` | **v1-test** ✅ |
| Учень за PIN | `/join` | **v1-test** ✅ |
| 404 | `not-found` | **v1-test** ✅ |

- [x] **v1-test** `/` — лендінг
- [x] **v1-test** `/register` — реєстрація → API + cookie
- [x] **v1-test** `/login` — вхід → API + cookie
- [x] **v1-test** `/join` — PIN + ПІБ → API
- [x] **v1-test** 404
- [ ] **june-full** `/forgot-password`, `/verify-email`

---

## Зона викладача

| Сторінка | Маршрут | Статус |
|----------|---------|--------|
| Дашборд | `/dashboard` | **v1-test** ✅ |
| Новий тест | `/dashboard/tests/new` | **v1-test** ✅ (+ ШІ) |
| Редактор | `/dashboard/tests/[id]/edit` | **v1-test** ✅ |
| Спроби | `/dashboard/tests/[id]/attempts` | **v1-test** ✅ |

- [x] **v1-test** `/dashboard` — список з API
- [x] **v1-test** `/dashboard/tests/new` — вручну + **Створити з ШІ**
- [x] **v1-test** `/dashboard/tests/[id]/edit`
- [x] **v1-test** `/dashboard/tests/[id]/attempts`
- [ ] **june-full** settings, live, question-bank, profile

---

## Зона учня

| Сторінка | Маршрут | Статус |
|----------|---------|--------|
| Плеєр | `/test/[pin]/play` | **v1-test** ✅ |
| Результат | `/test/[pin]/results` | **v1-test** ✅ |

- [x] **v1-test** play + results
- [ ] **june-full** таймер, AI-пояснення, пропуск

---

## Definition of Done — v1

1. [x] Маршрути v1 без 404/500
2. [x] Login/register → dashboard (потрібна БД + migrate)
3. [x] Учень: PIN → play → results
4. [~] Захист dashboard: API 401 без cookie; UI — тимчасово `SKIP_AUTH` (middleware — ні)
5. [x] Адаптив

**Запуск і тести:** [`web/README.md`](../../web/README.md)
