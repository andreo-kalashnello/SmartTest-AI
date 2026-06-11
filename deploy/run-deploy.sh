#!/usr/bin/env bash
set -euo pipefail

# Usage: BRANCH=main bash deploy/run-deploy.sh
# This script updates the repo, brings up infra, builds web+api, runs migrations/seeds
# and (re)starts processes via pm2. It does NOT modify DB schema beyond prisma migrate deploy.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="$ROOT"
BRANCH="${BRANCH:-main}"

cd "$REPO_DIR"

echo "==> Git: fetch & reset to origin/$BRANCH"
git fetch origin --prune
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Docker compose (starts postgres/redis/grafana/prometheus)"
docker compose up -d

echo "==> pnpm install"
pnpm install

echo "==> Prisma: generate + migrate (deploy)"
pnpm prisma:generate
pnpm prisma:deploy

echo "==> Build: api + web"
pnpm build:api || pnpm --filter api build
pnpm build || pnpm --filter web build

echo "==> Nginx (deploy config and reload if installed)"
if command -v nginx >/dev/null; then
  cp "$ROOT/deploy/nginx-smarttest-ai.conf" /etc/nginx/sites-available/smarttest-ai
  ln -sf /etc/nginx/sites-available/smarttest-ai /etc/nginx/sites-enabled/smarttest-ai
  rm -f /etc/nginx/sites-enabled/default || true
  nginx -t && systemctl reload nginx
fi

echo "==> PM2: reload web"
if command -v pm2 >/dev/null; then
  pm2 startOrReload "$ROOT/deploy/ecosystem.config.cjs" || true
fi

echo "==> Start/restart api under pm2 (ensure env from api/.env is exported)"
if [ -f "$ROOT/api/.env" ]; then
  echo "Loading env from api/.env"
  # export variables from .env for the pm2 start that follows
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/api/.env"
  set +a
fi

if command -v pm2 >/dev/null; then
  if pm2 describe smarttest-api >/dev/null 2>&1; then
    pm2 restart smarttest-api || pm2 start "$ROOT/api/dist/main.js" --name smarttest-api --cwd "$ROOT/api"
  else
    pm2 start "$ROOT/api/dist/main.js" --name smarttest-api --cwd "$ROOT/api"
  fi
  pm2 save || true
else
  echo "pm2 not installed — starting api with nohup"
  nohup node "$ROOT/api/dist/main.js" >/var/log/smarttest-api.log 2>&1 &
fi

echo "==> Optional seeds: uncomment lines below if you want seeds to run automatically"
# Run the main prisma seed (seed.ts)
# pnpm --filter api prisma:seed

# Or run specific seeds (uncomment to enable)
# pnpm --filter api exec tsx prisma/seed-users.ts
# pnpm --filter api exec tsx prisma/seed-full.ts
# pnpm --filter api exec tsx prisma/seed-enrollments.ts

echo "Done. Check logs: pm2 logs smarttest-web | pm2 logs smarttest-api | docker compose logs -f postgres"
