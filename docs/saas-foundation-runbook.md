# Emprendedos SaaS Foundation Runbook

## Local Development

1. Copy `.env.example` to `.env`.
2. Run `corepack pnpm install`.
3. Keep `DATA_STORE=memory` for the fastest demo, or switch to `DATA_STORE=postgres` after following the Local PostgreSQL section.
4. Run `corepack pnpm --filter @emprendedos/api dev`.
5. Run `corepack pnpm --filter @emprendedos/web dev -- --port 5173`.
6. Open `http://127.0.0.1:5173`.

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

## Shared Demo Instance

Use this mode when showing Emprendedos to another entrepreneur or potential partner:

1. Set `DATA_STORE=postgres`.
2. Set a non-demo `AUTH_SECRET`.
3. Keep `ALLOW_DEV_REQUEST_CONTEXT=false`.
4. Run `corepack pnpm db:migrate`.
5. Run `corepack pnpm db:seed`.
6. Start the API and web app with `VITE_API_BASE_URL` pointing to the API URL.
7. Verify login, dashboard, inventory, recipes and CSV exports before sharing the URL.

The seed gives the demo tenant enough sales, expenses, products, supplies, recipes and production history to tell a complete operating story.

## Verification

- `corepack pnpm verify:saas`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/dashboard`

## Tenant Safety

All business data must be read through tenant-aware repositories. Never query business records without passing the active `tenantId`.

## Demo Request Context

The API resolves tenant context from `Authorization: Bearer <token>` first.

For local development only, `ALLOW_DEV_REQUEST_CONTEXT=true` permits fallback to:

- `x-emprendedos-tenant-id`
- `x-emprendedos-user-id`
- `x-emprendedos-role`

Set `ALLOW_DEV_REQUEST_CONTEXT=false` or `NODE_ENV=production` to require bearer tokens. Production must not trust tenant headers from the client.

## Auth Foundation

The API exposes:

- `POST /v1/auth/login`
- `GET /v1/auth/me`

Demo credentials are controlled by:

- `DEMO_AUTH_EMAIL`
- `DEMO_AUTH_PASSWORD`
- `AUTH_SECRET`

Successful login returns a bearer token signed with `AUTH_SECRET`. Business routes resolve tenant context from `Authorization: Bearer <token>` before any development fallback.

## Current Limitations

- Demo auth only.
- PostgreSQL requires manual `docker compose up`, `db:migrate`, and `db:seed` locally.
- Billing is not implemented.

## Demo Flow

Use `docs/demo-flow.md` as the canonical demo script. The demo tenant should always include enough products, supplies, sales, expenses, recipes and production history to make the dashboard meaningful on first login.

## MVP Release Checklist

Before calling a build SaaS MVP ready, run:

```bash
corepack pnpm verify:saas
```

Then manually verify:

- Login with demo credentials.
- Register a new owner account.
- Open dashboard.
- Create one sale.
- Confirm dashboard reloads.
- Open inventory on desktop and mobile.
- Open recipes on desktop and mobile.
- Check browser console for blocking errors.
