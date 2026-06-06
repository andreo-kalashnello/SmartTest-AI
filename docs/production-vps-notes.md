# SmartTest AI VPS production notes

This is a reminder checklist for moving the project from local development to a VPS.

Current local setup uses many localhost values. Before production, review every item below.

## Domains

Planned example:

```txt
Frontend: https://smarttestai.duckdns.org
Backend:  https://api.smarttestai.duckdns.org
```

If using other domains, replace them everywhere in env, nginx, CORS and OAuth/OpenRouter settings if needed.

## Backend env

File:

```txt
api/.env
```

Production values to edit:

```env
NODE_ENV="production"
PORT="4000"

DATABASE_URL="postgresql://smarttest:CHANGE_ME_STRONG_PASSWORD@postgres:5432/smarttest?schema=public"

FRONTEND_URL="https://smarttestai.duckdns.org"
APP_NAME="SmartTest AI"

JWT_ACCESS_SECRET="CHANGE_ME_LONG_RANDOM_SECRET"
JWT_REFRESH_SECRET="CHANGE_ME_ANOTHER_LONG_RANDOM_SECRET"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

COOKIE_ACCESS_NAME="smarttest_access_token"
COOKIE_REFRESH_NAME="smarttest_refresh_token"
COOKIE_SECURE="true"
COOKIE_SAME_SITE="lax"

OPENROUTER_API_KEY="CHANGE_ME"
OPENROUTER_MODEL="..."
OPENROUTER_VISION_MODEL="..."
OPENROUTER_MAX_TOKENS="1200"
OPENROUTER_TIMEOUT_MS="30000"

REDIS_HOST="redis"
REDIS_PORT="6379"

RATE_LIMIT_TTL_SECONDS="60"
RATE_LIMIT_MAX_REQUESTS="100"
LOG_LEVEL="info"
```

Important:

- Do not use local secrets like `change-me-access-secret`.
- Use different values for access and refresh secrets.
- Use `COOKIE_SECURE="true"` only with HTTPS.
- In Docker network, backend should connect to Postgres as `postgres:5432`, not `127.0.0.1:5433`.
- In Docker network, backend should connect to Redis as `redis:6379`, not `127.0.0.1:6379`.

Generate secrets with something like:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Frontend env

File:

```txt
web/.env.production
```

Production values:

```env
NEXT_PUBLIC_APP_URL="https://smarttestai.duckdns.org"
NEXT_PUBLIC_API_URL="https://api.smarttestai.duckdns.org/api"
NEXT_PUBLIC_SKIP_AUTH=false
```

Important:

- Frontend must call backend through the public HTTPS API domain.
- Do not use `http://localhost:4000/api` in production.

## docker-compose production edits

Current local compose is development-oriented. For production, add services:

```txt
api
web
nginx
```

Existing services:

```txt
postgres
redis
prometheus
grafana
```

Need to change:

- Add `api` Dockerfile/service.
- Add `web` Dockerfile/service.
- Put all services on the same Docker network.
- Backend `DATABASE_URL` should use `postgres`.
- Backend `REDIS_HOST` should use `redis`.
- Expose only nginx publicly.
- Avoid exposing Postgres and Redis to the public internet.

Production port idea:

```txt
public 80/443 -> nginx
api internal -> api:4000
web internal -> web:3000
postgres internal -> postgres:5432
redis internal -> redis:6379
prometheus/grafana ideally private or protected
```

Current local ports:

```txt
postgres:   127.0.0.1:5433
redis:      127.0.0.1:6379
prometheus: 127.0.0.1:9090
grafana:    127.0.0.1:3001
```

On VPS, do not expose Postgres/Redis publicly.

## Docker log rotation

Already configured for local infrastructure services:

```txt
postgres:   10MB x 3
redis:       5MB x 2
prometheus: 10MB x 2
grafana:    10MB x 2
```

When adding production `api` and `web` services, add:

```yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

This prevents Docker logs from filling the VPS disk.

## Prometheus and Grafana retention

Current Prometheus limits:

```txt
retention time: 6h
retention size: 128MB
```

This is intentionally small for the olympiad/demo project.

For VPS, decide whether to keep it small:

```txt
6h / 128MB
```

or slightly larger:

```txt
24h / 512MB
```

Do not leave unlimited metrics retention.

Grafana default local login:

```txt
admin / smarttest
```

Production must change this:

```env
GF_SECURITY_ADMIN_PASSWORD="CHANGE_ME_STRONG_PASSWORD"
```

Also consider protecting Grafana behind nginx basic auth or VPN.

## Nginx / HTTPS

Need nginx reverse proxy:

```txt
https://smarttestai.duckdns.org      -> web:3000
https://api.smarttestai.duckdns.org  -> api:4000
```

Need HTTPS certificates:

```txt
Certbot / Let's Encrypt
```

Important headers:

```txt
X-Forwarded-For
X-Forwarded-Proto
Host
```

If cookies behave incorrectly behind proxy, check:

- `COOKIE_SECURE=true`
- HTTPS is actually used
- CORS `FRONTEND_URL` matches frontend origin
- API is called with `credentials: include`

## CORS

Backend uses:

```env
FRONTEND_URL="https://smarttestai.duckdns.org"
```

If there are multiple allowed origins, use comma-separated values:

```env
FRONTEND_URL="https://smarttestai.duckdns.org,https://www.smarttestai.duckdns.org"
```

Do not use wildcard CORS with credentials.

## Database

Before first production run:

```bash
pnpm --filter api prisma:deploy
```

If using Dockerized API, run migrations inside api container or as a one-off job.

Need backup plan:

```txt
daily pg_dump
store outside container volume
keep several recent backups
```

Example idea:

```bash
docker exec smarttest-postgres pg_dump -U smarttest smarttest > backups/smarttest-$(date +%F).sql
```

Also remember:

- Use strong Postgres password.
- Do not expose Postgres port publicly.
- Keep volume backups.

## Redis

Redis is used by BullMQ for AI background jobs.

Production:

```env
REDIS_HOST="redis"
REDIS_PORT="6379"
```

Do not expose Redis publicly.

If Redis data is lost, queued/running jobs may disappear, but saved completed job results remain in Postgres `AiJob`.

## OpenRouter

Production needs:

```env
OPENROUTER_API_KEY="..."
OPENROUTER_MODEL="..."
OPENROUTER_VISION_MODEL="..."
```

Use free models only if the demo requirement still says so.

Watch for:

- model availability changes
- token limits
- timeout values
- quota/credits errors

## Health and monitoring checks

After deploy, check:

```http
GET https://api.smarttestai.duckdns.org/api/health
GET https://api.smarttestai.duckdns.org/api/health/db
GET https://api.smarttestai.duckdns.org/api/health/redis
GET https://api.smarttestai.duckdns.org/api/metrics
```

Prometheus target should be `UP`.

Grafana dashboard:

```txt
SmartTest -> SmartTest API Overview
```

## Security checklist

Before production:

- Change JWT secrets.
- Change Grafana admin password.
- Change Postgres password.
- Use HTTPS.
- Set `COOKIE_SECURE=true`.
- Keep CORS strict.
- Do not expose Postgres/Redis publicly.
- Add Docker log rotation for `api` and `web`.
- Keep Prometheus retention limited.
- Verify no `.env` files are committed.
- Verify OpenRouter API key is not in git.

## Deployment order idea

1. Pull latest code on VPS.
2. Create production `.env` files.
3. Build Docker images.
4. Start Postgres and Redis.
5. Run Prisma migrations.
6. Start API.
7. Start Web.
8. Start Nginx.
9. Issue HTTPS certificates.
10. Start Prometheus and Grafana.
11. Check health endpoints.
12. Smoke test auth, tests, attempts, AI jobs.

## Manual smoke test after deploy

- Register teacher.
- Login teacher.
- Create test.
- Register student.
- Start attempt by PIN.
- Complete attempt.
- Teacher sees attempt analytics.
- Create class.
- Student joins class.
- Run AI create-test job.
- Check `/metrics`.
- Check Grafana dashboard.
