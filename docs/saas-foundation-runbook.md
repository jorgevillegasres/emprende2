# Emprendedos SaaS Foundation Runbook

## Local Development

1. Copy `.env.example` to `.env`.
2. Run `corepack pnpm install`.
3. Run `corepack pnpm --filter @emprendedos/api dev`.
4. Run `corepack pnpm --filter @emprendedos/web dev -- --port 5173`.
5. Open `http://127.0.0.1:5173`.

## Data Store Modes

The API supports two data store modes:

- `DATA_STORE=memory`: default mode, seeded demo data, no database required.
- `DATA_STORE=postgres`: uses Drizzle ORM and `DATABASE_URL`.

## Local PostgreSQL

Start Postgres:

```bash
docker compose up -d postgres
```

Generate migrations after schema changes:

```bash
corepack pnpm db:generate
```

Apply migrations:

```bash
corepack pnpm db:migrate
```

Seed demo data:

```bash
corepack pnpm db:seed
```

Run the API against Postgres:

```bash
$env:DATA_STORE="postgres"; corepack pnpm --filter @emprendedos/api dev
```

The current automated test suite uses memory mode so it can run without a local PostgreSQL service.

## Verification

- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm --filter @emprendedos/web build`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/dashboard`

## Tenant Safety

All business data must be read through tenant-aware repositories. Never query business records without passing the active `tenantId`.

## Demo Request Context

Until real authentication is implemented, the API resolves request context from optional headers:

- `x-emprendedos-tenant-id`
- `x-emprendedos-user-id`
- `x-emprendedos-role`

When headers are missing, the API falls back to the demo tenant and demo owner user from `.env.example`. These headers are a development bridge only; production auth must verify users and memberships server-side before trusting tenant access.

## Auth Foundation

The API exposes:

- `POST /v1/auth/login`
- `GET /v1/auth/me`

Demo credentials are controlled by:

- `DEMO_AUTH_EMAIL`
- `DEMO_AUTH_PASSWORD`
- `AUTH_SECRET`

Successful login returns a bearer token signed with `AUTH_SECRET`. Business routes resolve tenant context from `Authorization: Bearer <token>` before falling back to development headers and demo context.

## Current Limitations

- Demo auth only.
- PostgreSQL requires manual `docker compose up`, `db:migrate`, and `db:seed` locally.
- Billing is not implemented.
