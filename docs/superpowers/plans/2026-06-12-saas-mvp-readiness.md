# SaaS MVP Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close Emprendedos as a professional SaaS MVP by hardening tenant/auth behavior, onboarding readiness, demo data, deployment documentation, and QA gates before adding new product features.

**Architecture:** Keep the existing monorepo shape: `apps/api` owns auth, tenant context, persistence and operational endpoints; `apps/web` owns the React experience; `packages/domain` owns business calculations; `docs` owns readiness and release evidence. Changes must be small, tenant-aware, test-first, and committed by phase.

**Tech Stack:** React 19, TypeScript, Vite, Fastify, Zod, Drizzle ORM, PostgreSQL, Vitest, pnpm workspaces.

---

## File Structure

- Create: `docs/saas-mvp-readiness-checklist.md`
  - Responsibility: living checklist of MVP readiness gaps, status, owner phase, verification command, and release decision.
- Modify: `.env.example`
  - Responsibility: document production-sensitive configuration, including explicit development fallback control.
- Modify: `apps/api/src/config.ts`
  - Responsibility: parse readiness-related env flags in one place.
- Modify: `apps/api/src/auth/context.ts`
  - Responsibility: resolve tenant context from bearer token first, then allow development/demo fallback only when explicitly enabled.
- Modify: `apps/api/tests/request-context.test.ts`
  - Responsibility: prove token precedence, dev fallback, and production rejection of unauthenticated context.
- Modify: `docs/saas-foundation-runbook.md`
  - Responsibility: document memory/Postgres modes, demo credentials, health checks, release checklist, and production limitations.
- Modify: `apps/web/src/components/onboarding.ts`
  - Responsibility: expose activation status as a pure helper.
- Modify: `apps/web/src/components/onboarding.test.ts`
  - Responsibility: prove setup completion and next-step behavior.
- Modify: `apps/web/src/components/Dashboard.tsx`
  - Responsibility: use activation copy/states from onboarding helpers without adding a new feature module.
- Create: `docs/demo-flow.md`
  - Responsibility: reproducible demo script and credentials.
- Modify: `apps/api/src/db/seed.ts`
  - Responsibility: ensure memory demo data communicates product value.
- Modify: `apps/api/src/db/postgres-seed.ts`
  - Responsibility: keep Postgres demo seed aligned with memory seed.

---

## Task 1: Readiness Checklist

**Files:**
- Create: `docs/saas-mvp-readiness-checklist.md`

- [ ] **Step 1: Create the checklist document**

Create `docs/saas-mvp-readiness-checklist.md` with this exact structure:

```markdown
# Emprendedos SaaS MVP Readiness Checklist

Fecha: 2026-06-12

## Decision

No se agregan nuevas funcionalidades de producto hasta cerrar este checklist.

## Estado General

| Area | Estado | Evidencia requerida |
| --- | --- | --- |
| Arquitectura multi-tenant | En progreso | Tests de aislamiento tenant y revision de repositorios |
| Auth y contexto | En progreso | Token obligatorio para flujos productivos; fallback dev explicitado |
| Onboarding | En progreso | Progreso de activacion claro y estados vacios accionables |
| Demo | En progreso | Tenant demo reproducible y datos suficientes |
| Despliegue | En progreso | Runbook con variables, migraciones, seed y health check |
| Calidad | En progreso | test, typecheck, build y QA visual |
| Seguridad basica | En progreso | Sin tenantId confiado desde cliente en produccion |

## Congelamiento De Features

Quedan fuera de este cierre:

- Billing y Stripe.
- Reportes PDF avanzados.
- Integraciones externas.
- IA generativa.
- App movil nativa.
- Multi-bodega avanzado.
- Permisos granulares.
- Notificaciones.

## Gate De Release MVP

- [ ] `corepack pnpm test`
- [ ] `corepack pnpm typecheck`
- [ ] `corepack pnpm --filter @emprendedos/web build`
- [ ] API en modo `memory` documentada y probada.
- [ ] API en modo `postgres` documentada.
- [ ] Login demo documentado.
- [ ] Registro de nuevo emprendimiento probado.
- [ ] Dashboard demo con datos utiles.
- [ ] Operacion critica probada: crear producto, crear venta, revisar dashboard.
- [ ] QA desktop en dashboard, operaciones y onboarding.
- [ ] QA mobile en dashboard, operaciones y onboarding.
- [ ] Sin errores bloqueantes de consola en navegador.

## Bitacora De Cierre

| Fecha | Commit | Resultado |
| --- | --- | --- |
| 2026-06-12 | Registrar hash del commit de Task 1 | Checklist creado |
```

- [ ] **Step 2: Review for feature creep**

Run:

```bash
rg -n "Stripe|PDF|IA|notificaciones|multi-bodega|integraciones" docs/saas-mvp-readiness-checklist.md
```

Expected: matches only appear under `Congelamiento De Features`.

- [ ] **Step 3: Commit**

Run:

```bash
git add docs/saas-mvp-readiness-checklist.md
git commit -m "docs: add saas mvp readiness checklist"
```

---

## Task 2: Harden Auth And Tenant Context

**Files:**
- Modify: `.env.example`
- Modify: `apps/api/src/config.ts`
- Modify: `apps/api/src/auth/context.ts`
- Modify: `apps/api/tests/request-context.test.ts`
- Modify: `docs/saas-foundation-runbook.md`

- [ ] **Step 1: Write failing tests for explicit development fallback**

In `apps/api/tests/request-context.test.ts`, replace the existing file with:

```ts
import { describe, expect, it } from "vitest";
import { resolveRequestContext } from "../src/auth/context.js";
import { signAuthToken } from "../src/auth/tokens.js";

describe("resolveRequestContext", () => {
  it("uses demo context when development fallback is enabled and headers are missing", () => {
    const context = resolveRequestContext({}, { allowDevelopmentContext: true });

    expect(context.tenantId).toBe("10000000-0000-0000-0000-000000000001");
    expect(context.userId).toBe("00000000-0000-0000-0000-000000000001");
    expect(context.role).toBe("owner");
  });

  it("uses request headers only when development fallback is enabled", () => {
    const context = resolveRequestContext(
      {
        "x-emprendedos-tenant-id": "tenant-a",
        "x-emprendedos-user-id": "user-a",
        "x-emprendedos-role": "operator"
      },
      { allowDevelopmentContext: true }
    );

    expect(context.tenantId).toBe("tenant-a");
    expect(context.userId).toBe("user-a");
    expect(context.role).toBe("operator");
  });

  it("throws when no bearer token is present and development fallback is disabled", () => {
    expect(() => resolveRequestContext({}, { allowDevelopmentContext: false })).toThrow("Authentication required");
  });

  it("uses bearer token context before development headers", () => {
    const token = signAuthToken(
      { userId: "token-user", tenantId: "token-tenant", role: "owner" },
      { secret: "dev-only-emprendedos-secret" }
    );

    const context = resolveRequestContext(
      {
        authorization: `Bearer ${token}`,
        "x-emprendedos-tenant-id": "tenant-from-header",
        "x-emprendedos-user-id": "user-from-header",
        "x-emprendedos-role": "operator"
      },
      { allowDevelopmentContext: true }
    );

    expect(context).toEqual({ userId: "token-user", tenantId: "token-tenant", role: "owner" });
  });

  it("falls back to owner role when development role header is unsupported", () => {
    const context = resolveRequestContext({ "x-emprendedos-role": "superuser" }, { allowDevelopmentContext: true });

    expect(context.role).toBe("owner");
  });
});
```

- [ ] **Step 2: Run focused test and verify failure**

Run:

```bash
corepack pnpm --filter @emprendedos/api test -- request-context.test.ts
```

Expected: FAIL because `resolveRequestContext` does not accept the second options argument and does not throw when fallback is disabled.

- [ ] **Step 3: Add config flag**

In `apps/api/src/config.ts`, update `getConfig` to return `allowDevelopmentRequestContext`:

```ts
type Env = Partial<Record<string, string>>;

export function getConfig(env: Env = process.env) {
  const requestedDataStore = env.DATA_STORE === "postgres" ? "postgres" : "memory";

  return {
    port: Number(env.API_PORT ?? 3001),
    webOrigin: env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
    dataStore: requestedDataStore,
    databaseUrl: env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/emprendedos",
    authSecret: env.AUTH_SECRET ?? "dev-only-emprendedos-secret",
    demoAuthEmail: env.DEMO_AUTH_EMAIL ?? "demo@emprendedos.local",
    demoAuthPassword: env.DEMO_AUTH_PASSWORD ?? "emprendedos-demo",
    allowDevelopmentRequestContext: env.ALLOW_DEV_REQUEST_CONTEXT !== "false" && env.NODE_ENV !== "production"
  };
}
```

- [ ] **Step 4: Harden request context**

In `apps/api/src/auth/context.ts`, update `resolveRequestContext` to:

```ts
export function resolveRequestContext(headers: RequestHeaders, options?: { allowDevelopmentContext?: boolean }): RequestContext {
  const tokenContext = resolveBearerContext(headers);
  if (tokenContext) return tokenContext;

  const allowDevelopmentContext = options?.allowDevelopmentContext ?? getConfig().allowDevelopmentRequestContext;
  if (!allowDevelopmentContext) {
    throw new Error("Authentication required");
  }

  const demo = getDemoRequestContext();
  return {
    userId: readHeader(headers, "x-emprendedos-user-id") ?? demo.userId,
    tenantId: readHeader(headers, "x-emprendedos-tenant-id") ?? demo.tenantId,
    role: resolveRole(readHeader(headers, "x-emprendedos-role")) ?? demo.role
  };
}
```

- [ ] **Step 5: Map auth errors to 401**

In `apps/api/src/routes/auth.ts`, update `/v1/auth/me`:

```ts
  app.get("/v1/auth/me", async (request, reply) => {
    try {
      return resolveRequestContext(request.headers);
    } catch {
      return reply.code(401).send({ error: "Authentication required" });
    }
  });
```

- [ ] **Step 6: Document env flag**

Add this line to `.env.example`:

```dotenv
ALLOW_DEV_REQUEST_CONTEXT=true
```

In `docs/saas-foundation-runbook.md`, replace the development header paragraph with:

```markdown
## Demo Request Context

The API resolves tenant context from `Authorization: Bearer <token>` first.

For local development only, `ALLOW_DEV_REQUEST_CONTEXT=true` permits fallback to:

- `x-emprendedos-tenant-id`
- `x-emprendedos-user-id`
- `x-emprendedos-role`

Set `ALLOW_DEV_REQUEST_CONTEXT=false` or `NODE_ENV=production` to require bearer tokens. Production must not trust tenant headers from the client.
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
corepack pnpm --filter @emprendedos/api test -- request-context.test.ts auth-routes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add .env.example apps/api/src/config.ts apps/api/src/auth/context.ts apps/api/src/routes/auth.ts apps/api/tests/request-context.test.ts docs/saas-foundation-runbook.md
git commit -m "fix: require explicit development tenant context"
```

---

## Task 3: Onboarding Activation Readiness

**Files:**
- Modify: `apps/web/src/components/onboarding.ts`
- Modify: `apps/web/src/components/onboarding.test.ts`
- Modify: `apps/web/src/components/Dashboard.tsx`

- [ ] **Step 1: Write failing activation tests**

Append to `apps/web/src/components/onboarding.test.ts`:

```ts
import { getActivationStatus } from "./onboarding";

describe("getActivationStatus", () => {
  it("marks the business as ready when all setup steps are complete", () => {
    const status = getActivationStatus({
      ...emptyMetrics,
      operationalCounts: { products: 1, supplies: 1, sales: 1, expenses: 1 }
    });

    expect(status.isReady).toBe(true);
    expect(status.label).toBe("Listo para operar");
    expect(status.nextActionSection).toBeNull();
  });

  it("points to the next setup action when the business is not ready", () => {
    const status = getActivationStatus({
      ...emptyMetrics,
      operationalCounts: { products: 1, supplies: 0, sales: 0, expenses: 0 }
    });

    expect(status.isReady).toBe(false);
    expect(status.label).toBe("Configuracion en progreso");
    expect(status.nextActionSection).toBe("supplies");
  });
});
```

- [ ] **Step 2: Run focused test and verify failure**

Run:

```bash
corepack pnpm --filter @emprendedos/web test -- onboarding
```

Expected: FAIL because `getActivationStatus` is not exported.

- [ ] **Step 3: Implement activation helper**

Append to `apps/web/src/components/onboarding.ts`:

```ts
export function getActivationStatus(metrics: DashboardMetrics) {
  const progress = getOnboardingProgress(metrics);
  const isReady = progress.percent === 100;

  return {
    isReady,
    label: isReady ? "Listo para operar" : "Configuracion en progreso",
    detail: isReady
      ? "Tu emprendimiento ya tiene la base minima para usar Emprendedos como tablero diario."
      : "Completa la base operativa para que el dashboard deje de ser una pantalla vacia y empiece a recomendar acciones.",
    nextActionSection: progress.nextStep?.section ?? null
  };
}
```

- [ ] **Step 4: Use activation helper in dashboard**

In `apps/web/src/components/Dashboard.tsx`, update the import:

```ts
import { getActivationStatus, getOnboardingProgress } from "./onboarding";
```

Inside `Dashboard`, after `const onboardingProgress = getOnboardingProgress(metrics);`, add:

```ts
  const activationStatus = getActivationStatus(metrics);
```

Update the score card status chip:

```tsx
            <span className="status-chip">{activationStatus.label}</span>
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
corepack pnpm --filter @emprendedos/web test -- onboarding
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/web/src/components/onboarding.ts apps/web/src/components/onboarding.test.ts apps/web/src/components/Dashboard.tsx
git commit -m "feat: clarify onboarding activation status"
```

---

## Task 4: Demo Data And Runbook

**Files:**
- Create: `docs/demo-flow.md`
- Modify: `docs/saas-foundation-runbook.md`
- Modify: `apps/api/src/db/seed.ts`
- Modify: `apps/api/src/db/postgres-seed.ts`

- [ ] **Step 1: Create demo flow document**

Create `docs/demo-flow.md`:

```markdown
# Emprendedos Demo Flow

## Credenciales

- URL local: `http://127.0.0.1:5173`
- Email: `demo@emprendedos.local`
- Password: `emprendedos-demo`

## Historia De Demo

Emprendedos ayuda a un emprendimiento de productos fisicos a ver ventas, margen, inventario, gastos y decisiones semanales.

## Recorrido

1. Iniciar sesion con las credenciales demo.
2. Abrir `Mi negocio` y mostrar:
   - salud del negocio,
   - ventas del mes,
   - utilidad bruta,
   - inventario valorizado,
   - gastos del mes,
   - decisiones de la semana.
3. Abrir `Ventas` y registrar una venta.
4. Volver a `Mi negocio` y confirmar que las metricas responden.
5. Abrir `Inventario` y mostrar insumos, kardex y exportacion CSV.
6. Abrir `Recetas` y mostrar la ruta de produccion.
7. Abrir `Plan` y mostrar decisiones guardadas.

## Mensaje Comercial

Emprendedos no intenta reemplazar un ERP. Es una cabina de mando para que el emprendedor sepa que vender, que comprar, que producir y que decision tomar esta semana.
```

- [ ] **Step 2: Align runbook with demo flow**

Append this section to `docs/saas-foundation-runbook.md`:

````markdown
## Demo Flow

Use `docs/demo-flow.md` as the canonical demo script. The demo tenant should always include enough products, supplies, sales, expenses, recipes and production history to make the dashboard meaningful on first login.

## MVP Release Checklist

Before calling a build SaaS MVP ready, run:

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @emprendedos/web build
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
````

- [ ] **Step 3: Review seed data**

Open `apps/api/src/db/seed.ts` and `apps/api/src/db/postgres-seed.ts`. Ensure both demo seeds include:

```ts
// Products:
"Jabon lavanda"
"Shampoo solido romero"
"Balsamo calendula"

// Supplies:
"Aceite coco"
"Manteca karite"
"Envase vidrio 10 ml"
"Etiqueta kraft"

// Sales:
// At least 3 records in June 2026.

// Expenses:
// At least 2 records in June 2026.

// Recipes:
// At least one recipe for shampoo or balm.
```

If any item is missing, add it with tenant id `10000000-0000-0000-0000-000000000001` and realistic COP values.

- [ ] **Step 4: Run API tests**

Run:

```bash
corepack pnpm --filter @emprendedos/api test
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/demo-flow.md docs/saas-foundation-runbook.md apps/api/src/db/seed.ts apps/api/src/db/postgres-seed.ts
git commit -m "docs: add demo flow and release checklist"
```

---

## Task 5: Final Readiness QA

**Files:**
- Modify: `docs/saas-mvp-readiness-checklist.md`

- [ ] **Step 1: Run full automated verification**

Run:

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @emprendedos/web build
```

Expected:

- `corepack pnpm test`: all projects pass.
- `corepack pnpm typecheck`: all projects pass.
- `corepack pnpm --filter @emprendedos/web build`: Vite build succeeds.

- [ ] **Step 2: Verify health endpoint**

With the API running, run:

```bash
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health
```

Expected response includes:

```json
{"ok":true,"service":"emprendedos-api"}
```

- [ ] **Step 3: Browser QA**

Using the in-app browser at `http://127.0.0.1:5173/`, verify:

- Demo login works.
- Dashboard renders without blocking error panel.
- `Ventas` shows `Exportar CSV`.
- `Inventario` shows list export and kardex export state.
- `Recetas` shows production history export state.
- Mobile viewport `390x844` has no incoherent overlap in dashboard, operations and recipes.

- [ ] **Step 4: Mark checklist evidence**

Update `docs/saas-mvp-readiness-checklist.md` with the real hash from the final verification commit:

```markdown
## Bitacora De Cierre

| Fecha | Commit | Resultado |
| --- | --- | --- |
| 2026-06-12 | Hash real del commit final | Auth/contexto, onboarding, demo flow, runbook y QA verificados |
```

Also check the relevant gate checkboxes that were actually verified in this task.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/saas-mvp-readiness-checklist.md
git commit -m "docs: record saas mvp readiness evidence"
```

---

## Self-Review

Spec coverage:

- Architecture readiness: Task 1 and Task 2.
- Auth and tenant readiness: Task 2.
- Onboarding readiness: Task 3.
- Operational readiness: Task 5 browser QA covers existing scope without adding modules.
- Demo readiness: Task 4.
- Deployment readiness: Task 4 and Task 5.
- Quality readiness: Task 5.
- Basic security readiness: Task 2.
- Feature freeze: Task 1 checklist and Task 5 gate.

No intentionally new product feature is included. Billing, reports, integrations, IA, mobile native, multi-bodega, granular permissions and notifications remain out of scope.
