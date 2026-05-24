#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Docker Postgres"
docker compose up -d

echo "==> pnpm install"
pnpm install

echo "==> Prisma"
pnpm prisma:generate
pnpm prisma:deploy

echo "==> Build"
pnpm build

echo "==> Nginx"
if command -v nginx >/dev/null; then
  cp "$ROOT/deploy/nginx-smarttest-ai.conf" /etc/nginx/sites-available/smarttest-ai
  ln -sf /etc/nginx/sites-available/smarttest-ai /etc/nginx/sites-enabled/smarttest-ai
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

echo "==> PM2"
if command -v pm2 >/dev/null; then
  pm2 startOrReload "$ROOT/deploy/ecosystem.config.cjs"
  pm2 save
fi

echo "Done. Open http://smarttestai.duckdns.org"
