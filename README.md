# Emprendedos

Emprendedos is a SaaS product for entrepreneurs who produce and sell physical goods. It helps them understand sales, margin, inventory, expenses, and weekly growth decisions.

## Current Workstreams

- `index.html` and `src/`: legacy local-first prototype.
- `apps/api`: SaaS API foundation.
- `apps/web`: SaaS React web app.
- `packages/domain`: shared business rules.

## Run SaaS Foundation

See `docs/saas-foundation-runbook.md`.

Fast local verification:

```bash
corepack pnpm verify:saas
```

Fast local demo:

```bash
corepack pnpm --filter @emprendedos/api dev
corepack pnpm --filter @emprendedos/web dev -- --port 5173
```
