# Emprendedos SaaS Foundation Runbook

## Local Development

1. Copy `.env.example` to `.env`.
2. Run `corepack pnpm install`.
3. Run `corepack pnpm --filter @emprendedos/api dev`.
4. Run `corepack pnpm --filter @emprendedos/web dev -- --port 5173`.
5. Open `http://127.0.0.1:5173`.

## Verification

- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm --filter @emprendedos/web build`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/dashboard`

## Tenant Safety

All business data must be read through tenant-aware repositories. Never query business records without passing the active `tenantId`.

## Current Limitations

- Demo auth only.
- In-memory repositories for the first SaaS foundation milestone.
- PostgreSQL schema is drafted but not wired to runtime yet.
- Billing is not implemented.
