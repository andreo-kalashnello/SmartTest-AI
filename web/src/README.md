# FSD у `web/src`

- **`app`** — лише Next.js App Router (`layout`, `page`, `providers`, стилі).
- **`views`** — композиція екранів (аналог шару **Pages** у FSD). Назва `views`, а не `pages`, щоб не створювати каталог `src/pages` — у Next.js він увімкнув би [Pages Router](https://nextjs.org/docs/pages) і зламав би збірку.
- **`widgets`** — великі самостійні блоки UI.
- **`features`** — користувацькі сценарії (один slice на фічу).
- **`entities`** — бізнес-сутності та їхні типи/моделі.
- **`shared`** — ui-kit (shadcn), `lib` (store, utils), `config`, `api`.

Імпорти між шарами — знизу вгору (entities → features → widgets → views → app). Детальні правила — у [Feature-Sliced Design](https://feature-sliced.design/).
