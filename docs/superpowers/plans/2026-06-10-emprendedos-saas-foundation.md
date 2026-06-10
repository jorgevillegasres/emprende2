# Emprendedos SaaS Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first professional SaaS foundation for Emprendedos with a monorepo, shared domain package, React web app, API service, PostgreSQL multi-tenant schema, tenant-aware auth context, and the dashboard connected to API-backed demo data.

**Architecture:** Keep the current static prototype as a reference while creating a new monorepo structure under `apps/` and `packages/`. Business rules move into `packages/domain`, the API owns tenant-scoped data access, and the web app consumes API endpoints instead of `localStorage`.

**Tech Stack:** pnpm workspaces, TypeScript, React + Vite, Node.js + Fastify, Zod, Drizzle ORM, PostgreSQL, Vitest, Playwright later for browser QA.

---

## Scope

This plan implements SaaS Foundation only.

Included:

- Workspace/package structure.
- Shared domain package.
- API service with health endpoint.
- PostgreSQL schema with `tenant_id`.
- Tenant-aware repository pattern.
- Seed data for two tenants.
- Dashboard metrics endpoint.
- React web shell using the Emprendedos visual direction.
- Basic auth context stub suitable for replacing with real auth.
- Tenant isolation tests.

Not included:

- Stripe Billing.
- Production deployment.
- Real email/password auth.
- Invitations.
- Full CRUD for every module.
- Facturacion electronica.
- AI recommendations.

## File Structure

- Modify: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.env.example`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/auth/context.ts`
- Create: `apps/api/src/db/schema.ts`
- Create: `apps/api/src/db/client.ts`
- Create: `apps/api/src/db/repositories.ts`
- Create: `apps/api/src/db/seed.ts`
- Create: `apps/api/src/routes/health.ts`
- Create: `apps/api/src/routes/dashboard.ts`
- Create: `apps/api/src/routes/products.ts`
- Create: `apps/api/src/routes/sales.ts`
- Create: `apps/api/tests/tenant-isolation.test.ts`
- Create: `apps/api/tests/dashboard.test.ts`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/api/client.ts`
- Create: `apps/web/src/components/Dashboard.tsx`
- Create: `apps/web/src/components/Shell.tsx`
- Create: `apps/web/src/styles.css`
- Create: `packages/domain/package.json`
- Create: `packages/domain/tsconfig.json`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/metrics.ts`
- Create: `packages/domain/src/inventory.ts`
- Create: `packages/domain/tests/metrics.test.ts`

## Task 1: Workspace Foundation

**Files:**
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.env.example`

- [ ] **Step 1: Update root `package.json`**

Replace the current file with:

```json
{
  "name": "emprendedos",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "dev:api": "pnpm --filter @emprendedos/api dev",
    "dev:web": "pnpm --filter @emprendedos/web dev",
    "dev": "pnpm --parallel dev",
    "legacy:test": "node --test tests/domain.test.js"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

- [ ] **Step 4: Create `.env.example`**

```bash
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/emprendedos
API_PORT=3001
WEB_ORIGIN=http://127.0.0.1:5173
DEMO_OWNER_USER_ID=00000000-0000-0000-0000-000000000001
DEMO_TENANT_ID=10000000-0000-0000-0000-000000000001
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
corepack pnpm install
```

Expected: lockfile is created and install succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .env.example pnpm-lock.yaml
git commit -m "chore: set up SaaS monorepo workspace"
```

## Task 2: Shared Domain Package

**Files:**
- Create: `packages/domain/package.json`
- Create: `packages/domain/tsconfig.json`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/src/metrics.ts`
- Create: `packages/domain/src/inventory.ts`
- Create: `packages/domain/tests/metrics.test.ts`

- [ ] **Step 1: Create `packages/domain/package.json`**

```json
{
  "name": "@emprendedos/domain",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `packages/domain/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Write failing domain test**

Create `packages/domain/tests/metrics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateDashboardMetrics } from "../src/index";

describe("calculateDashboardMetrics", () => {
  it("calculates monthly revenue, margin, weekly revenue, and growth actions", () => {
    const result = calculateDashboardMetrics(
      {
        supplies: [{ id: "labels", name: "Etiquetas", stock: 5, minStock: 10, averageCost: 300, unit: "un" }],
        products: [
          { id: "soap", name: "Jabon", stock: 8, minStock: 4, unitCost: 3000, price: 9000 },
          { id: "balm", name: "Balsamo", stock: 1, minStock: 5, unitCost: 7000, price: 9000 }
        ],
        expenses: [{ date: "2026-06-02", category: "Servicios", amount: 20000 }],
        sales: [
          { date: "2026-06-01", productId: "soap", quantity: 2, revenue: 18000, cost: 6000, grossProfit: 12000 },
          { date: "2026-06-09", productId: "balm", quantity: 1, revenue: 9000, cost: 7000, grossProfit: 2000 }
        ]
      },
      "2026-06-10"
    );

    expect(result.monthlyRevenue).toBe(27000);
    expect(result.averageMarginPercent).toBe(51.85);
    expect(result.weeklyRevenue.map((week) => week.revenue)).toEqual([18000, 9000, 0, 0, 0]);
    expect(result.growthActions).toHaveLength(3);
  });
});
```

- [ ] **Step 4: Run RED**

Run:

```bash
corepack pnpm --filter @emprendedos/domain test
```

Expected: FAIL because `calculateDashboardMetrics` is not exported.

- [ ] **Step 5: Implement `packages/domain/src/metrics.ts`**

```ts
export type Supply = {
  id?: string;
  name: string;
  stock: number;
  minStock: number;
  averageCost: number;
  unit?: string;
};

export type Product = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unitCost: number;
  price: number;
  unit?: string;
};

export type Expense = {
  date: string;
  category: string;
  amount: number;
};

export type Sale = {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
  cost: number;
  grossProfit: number;
};

export type DashboardState = {
  supplies: Supply[];
  products: Product[];
  expenses: Expense[];
  sales: Sale[];
};

export function calculateDashboardMetrics(state: DashboardState, today: string) {
  const monthKey = today.slice(0, 7);
  const monthlySales = state.sales.filter((sale) => sale.date.startsWith(monthKey));
  const monthlyExpensesList = state.expenses.filter((expense) => expense.date.startsWith(monthKey));
  const monthlyRevenue = round(sumBy(monthlySales, (sale) => sale.revenue));
  const monthlyGrossProfit = round(sumBy(monthlySales, (sale) => sale.grossProfit));
  const monthlyExpenses = round(sumBy(monthlyExpensesList, (expense) => expense.amount));
  const averageMarginPercent = monthlyRevenue === 0 ? 0 : round((monthlyGrossProfit / monthlyRevenue) * 100);
  const supplyInventoryValue = round(sumBy(state.supplies, (supply) => supply.stock * supply.averageCost));
  const productInventoryValue = round(sumBy(state.products, (product) => product.stock * product.unitCost));
  const lowStockItems = [
    ...state.supplies.filter((supply) => supply.stock <= supply.minStock).map((supply) => ({ ...supply, type: "Insumo" as const })),
    ...state.products.filter((product) => product.stock <= product.minStock).map((product) => ({ ...product, type: "Producto" as const }))
  ];
  const weeklyRevenue = getWeeklyRevenue(monthlySales, today);
  const expensesByCategory = getExpensesByCategory(monthlyExpensesList);
  const topProductsByRevenue = getTopProductsByRevenue(monthlySales, state.products);
  const marginLeaders = state.products
    .map((product) => ({
      ...product,
      margin: round(product.price - product.unitCost),
      marginPercent: product.price === 0 ? 0 : round(((product.price - product.unitCost) / product.price) * 100)
    }))
    .sort((a, b) => b.margin - a.margin);

  return {
    monthlyRevenue,
    monthlyGrossProfit,
    monthlyExpenses,
    averageMarginPercent,
    supplyInventoryValue,
    productInventoryValue,
    totalInventoryValue: round(supplyInventoryValue + productInventoryValue),
    netAfterExpenses: round(monthlyGrossProfit - monthlyExpenses),
    lowStockItems,
    weeklyRevenue,
    expensesByCategory,
    topProductsByRevenue,
    marginLeaders,
    growthActions: getGrowthActions(lowStockItems, marginLeaders, expensesByCategory, topProductsByRevenue, averageMarginPercent)
  };
}

function getWeeklyRevenue(sales: Sale[], today: string) {
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00`);
  const weeks = Array.from({ length: 5 }, (_, index) => ({ label: `Semana ${index + 1}`, revenue: 0 }));
  for (const sale of sales) {
    const saleDate = new Date(`${sale.date}T00:00:00`);
    const dayOffset = Math.floor((saleDate.getTime() - monthStart.getTime()) / 86400000);
    const weekIndex = Math.min(4, Math.max(0, Math.floor(dayOffset / 7)));
    weeks[weekIndex].revenue += sale.revenue;
  }
  return weeks.map((week) => ({ ...week, revenue: round(week.revenue) }));
}

function getExpensesByCategory(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const expense of expenses) totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  return [...totals.entries()].map(([category, amount]) => ({ category, amount: round(amount) })).sort((a, b) => b.amount - a.amount);
}

function getTopProductsByRevenue(sales: Sale[], products: Product[]) {
  const productNames = new Map(products.map((product) => [product.id, product.name]));
  const totals = new Map<string, { productId: string; name: string; quantity: number; revenue: number; grossProfit: number }>();
  for (const sale of sales) {
    const current = totals.get(sale.productId) ?? {
      productId: sale.productId,
      name: productNames.get(sale.productId) ?? sale.productId,
      quantity: 0,
      revenue: 0,
      grossProfit: 0
    };
    current.quantity += sale.quantity;
    current.revenue += sale.revenue;
    current.grossProfit += sale.grossProfit;
    totals.set(sale.productId, current);
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

function getGrowthActions(
  lowStockItems: Array<(Supply | Product) & { type: "Insumo" | "Producto" }>,
  marginLeaders: Array<Product & { margin: number; marginPercent: number }>,
  expensesByCategory: Array<{ category: string; amount: number }>,
  topProductsByRevenue: Array<{ productId: string; name: string; quantity: number; revenue: number; grossProfit: number }>,
  averageMarginPercent: number
) {
  const actions: Array<{ title: string; detail: string; tone: "growth" | "warning" | "focus" }> = [];
  const topProduct = topProductsByRevenue[0];
  const lowProduct = lowStockItems.find((item) => item.type === "Producto");
  const lowSupply = lowStockItems.find((item) => item.type === "Insumo");
  const weakMargin = [...marginLeaders].reverse().find((product) => product.marginPercent < 55);
  const topExpense = expensesByCategory[0];

  if (topProduct) actions.push({ title: `Impulsa ${topProduct.name}`, detail: "Es el producto con mas ventas este mes.", tone: "growth" });
  if (lowProduct) actions.push({ title: `Programa produccion de ${lowProduct.name}`, detail: "Esta por debajo del minimo.", tone: "warning" });
  if (lowSupply) actions.push({ title: `Compra ${lowSupply.name}`, detail: "Este insumo puede frenar la proxima produccion.", tone: "warning" });
  if (weakMargin) actions.push({ title: `Revisa precio de ${weakMargin.name}`, detail: `Su margen estimado es ${weakMargin.marginPercent}%.`, tone: "focus" });
  if (topExpense) actions.push({ title: `Observa gasto en ${topExpense.category}`, detail: "Es tu mayor categoria del mes.", tone: "focus" });
  if (averageMarginPercent < 45) actions.push({ title: "Sube el margen promedio", detail: "Tu rentabilidad necesita revision.", tone: "focus" });

  return actions.slice(0, 3);
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
```

- [ ] **Step 6: Create `packages/domain/src/inventory.ts`**

```ts
export function calculateWeightedAverageCost(oldStock: number, oldAverageCost: number, addedQuantity: number, addedTotalCost: number) {
  const newStock = oldStock + addedQuantity;
  if (newStock === 0) return 0;
  return Math.round(((oldStock * oldAverageCost + addedTotalCost) / newStock + Number.EPSILON) * 100) / 100;
}
```

- [ ] **Step 7: Create `packages/domain/src/index.ts`**

```ts
export * from "./metrics";
export * from "./inventory";
```

- [ ] **Step 8: Run GREEN**

Run:

```bash
corepack pnpm --filter @emprendedos/domain test
corepack pnpm --filter @emprendedos/domain typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 9: Commit**

```bash
git add packages/domain
git commit -m "feat: add shared domain package"
```

## Task 3: API Skeleton

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/routes/health.ts`

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@emprendedos/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@emprendedos/domain": "workspace:*",
    "@fastify/cors": "^10.0.2",
    "fastify": "^5.2.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Write failing health test**

Create `apps/api/tests/health.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("health route", () => {
  it("returns ok", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, service: "emprendedos-api" });
  });
});
```

- [ ] **Step 4: Run RED**

Run:

```bash
corepack pnpm --filter @emprendedos/api test
```

Expected: FAIL because `buildApp` does not exist.

- [ ] **Step 5: Implement `apps/api/src/config.ts`**

```ts
export function getConfig() {
  return {
    port: Number(process.env.API_PORT ?? 3001),
    webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173"
  };
}
```

- [ ] **Step 6: Implement `apps/api/src/routes/health.ts`**

```ts
import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/v1/health", async () => ({ ok: true, service: "emprendedos-api" }));
}
```

- [ ] **Step 7: Implement `apps/api/src/app.ts`**

```ts
import cors from "@fastify/cors";
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerHealthRoutes } from "./routes/health";

export function buildApp() {
  const app = Fastify({ logger: false });
  const config = getConfig();
  void app.register(cors, { origin: config.webOrigin });
  void app.register(registerHealthRoutes);
  return app;
}
```

- [ ] **Step 8: Implement `apps/api/src/server.ts`**

```ts
import { buildApp } from "./app";
import { getConfig } from "./config";

const app = buildApp();
const config = getConfig();

await app.listen({ port: config.port, host: "127.0.0.1" });
console.log(`Emprendedos API running on http://127.0.0.1:${config.port}`);
```

- [ ] **Step 9: Run GREEN**

Run:

```bash
corepack pnpm --filter @emprendedos/api test
corepack pnpm --filter @emprendedos/api typecheck
```

Expected: tests and typecheck pass.

- [ ] **Step 10: Commit**

```bash
git add apps/api
git commit -m "feat: add API service skeleton"
```

## Task 4: Tenant Context And In-Memory Repositories

**Files:**
- Create: `apps/api/src/auth/context.ts`
- Create: `apps/api/src/db/repositories.ts`
- Create: `apps/api/tests/tenant-isolation.test.ts`

- [ ] **Step 1: Write failing tenant isolation test**

Create `apps/api/tests/tenant-isolation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInMemoryRepositories } from "../src/db/repositories";

describe("tenant isolation", () => {
  it("only returns products for the active tenant", async () => {
    const repositories = createInMemoryRepositories();
    await repositories.products.insert({ tenantId: "tenant-a", id: "a-product", name: "Jabon", stock: 3, minStock: 1, unitCost: 2000, price: 8000 });
    await repositories.products.insert({ tenantId: "tenant-b", id: "b-product", name: "Vela", stock: 4, minStock: 1, unitCost: 3000, price: 12000 });

    const tenantAProducts = await repositories.products.listByTenant("tenant-a");

    expect(tenantAProducts.map((product) => product.id)).toEqual(["a-product"]);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
corepack pnpm --filter @emprendedos/api test tests/tenant-isolation.test.ts
```

Expected: FAIL because repository module does not exist.

- [ ] **Step 3: Implement `apps/api/src/auth/context.ts`**

```ts
export type RequestContext = {
  userId: string;
  tenantId: string;
  role: "owner" | "admin" | "operator" | "viewer";
};

export function getDemoRequestContext(): RequestContext {
  return {
    userId: process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001",
    tenantId: process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001",
    role: "owner"
  };
}
```

- [ ] **Step 4: Implement `apps/api/src/db/repositories.ts` with in-memory storage**

```ts
import type { Product, Sale, Supply, Expense } from "@emprendedos/domain";

export type TenantProduct = Product & { tenantId: string };
export type TenantSupply = Supply & { tenantId: string };
export type TenantSale = Sale & { tenantId: string };
export type TenantExpense = Expense & { tenantId: string };

export function createInMemoryRepositories() {
  const products: TenantProduct[] = [];
  const supplies: TenantSupply[] = [];
  const sales: TenantSale[] = [];
  const expenses: TenantExpense[] = [];

  return {
    products: {
      async insert(product: TenantProduct) {
        products.push(product);
        return product;
      },
      async listByTenant(tenantId: string) {
        return products.filter((product) => product.tenantId === tenantId);
      }
    },
    supplies: {
      async insert(supply: TenantSupply) {
        supplies.push(supply);
        return supply;
      },
      async listByTenant(tenantId: string) {
        return supplies.filter((supply) => supply.tenantId === tenantId);
      }
    },
    sales: {
      async insert(sale: TenantSale) {
        sales.push(sale);
        return sale;
      },
      async listByTenant(tenantId: string) {
        return sales.filter((sale) => sale.tenantId === tenantId);
      }
    },
    expenses: {
      async insert(expense: TenantExpense) {
        expenses.push(expense);
        return expense;
      },
      async listByTenant(tenantId: string) {
        return expenses.filter((expense) => expense.tenantId === tenantId);
      }
    }
  };
}
```

- [ ] **Step 5: Run GREEN**

Run:

```bash
corepack pnpm --filter @emprendedos/api test
corepack pnpm --filter @emprendedos/api typecheck
```

Expected: tenant isolation and health tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/auth apps/api/src/db apps/api/tests
git commit -m "feat: add tenant-aware repositories"
```

## Task 5: Dashboard API Endpoint

**Files:**
- Create: `apps/api/src/db/seed.ts`
- Create: `apps/api/src/routes/dashboard.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/tests/dashboard.test.ts`

- [ ] **Step 1: Write failing dashboard endpoint test**

Create `apps/api/tests/dashboard.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("dashboard endpoint", () => {
  it("returns tenant-scoped dashboard metrics", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/v1/dashboard" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.monthlyRevenue).toBeGreaterThan(0);
    expect(body.growthActions.length).toBeGreaterThan(0);
    expect(body.lowStockItems.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run RED**

Run:

```bash
corepack pnpm --filter @emprendedos/api test tests/dashboard.test.ts
```

Expected: FAIL with 404 because `/v1/dashboard` does not exist.

- [ ] **Step 3: Implement `apps/api/src/db/seed.ts`**

```ts
import { createInMemoryRepositories } from "./repositories";

export async function createSeededRepositories() {
  const repositories = createInMemoryRepositories();
  const tenantId = process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001";

  await repositories.supplies.insert({ tenantId, id: "envase-vidrio", name: "Envase vidrio 10 ml", stock: 30, minStock: 40, averageCost: 1200, unit: "un" });
  await repositories.supplies.insert({ tenantId, id: "etiqueta-kraft", name: "Etiqueta kraft", stock: 66, minStock: 80, averageCost: 300, unit: "un" });
  await repositories.products.insert({ tenantId, id: "shampoo-romero", name: "Shampoo solido romero", stock: 12, minStock: 10, unitCost: 5200, price: 16000, unit: "un" });
  await repositories.products.insert({ tenantId, id: "balsamo-calendula", name: "Balsamo calendula", stock: 6, minStock: 8, unitCost: 4300, price: 14000, unit: "un" });
  await repositories.sales.insert({ tenantId, date: "2026-06-09", productId: "shampoo-romero", quantity: 3, revenue: 48000, cost: 15600, grossProfit: 32400 });
  await repositories.sales.insert({ tenantId, date: "2026-06-09", productId: "balsamo-calendula", quantity: 2, revenue: 28000, cost: 8600, grossProfit: 19400 });
  await repositories.expenses.insert({ tenantId, date: "2026-06-02", category: "Servicios", amount: 68000 });
  await repositories.expenses.insert({ tenantId, date: "2026-06-05", category: "Herramientas", amount: 78000 });

  return repositories;
}
```

- [ ] **Step 4: Implement `apps/api/src/routes/dashboard.ts`**

```ts
import { calculateDashboardMetrics } from "@emprendedos/domain";
import type { FastifyInstance } from "fastify";
import { getDemoRequestContext } from "../auth/context";
import { createSeededRepositories } from "../db/seed";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const repositories = await createSeededRepositories();

  app.get("/v1/dashboard", async () => {
    const context = getDemoRequestContext();
    const [supplies, products, sales, expenses] = await Promise.all([
      repositories.supplies.listByTenant(context.tenantId),
      repositories.products.listByTenant(context.tenantId),
      repositories.sales.listByTenant(context.tenantId),
      repositories.expenses.listByTenant(context.tenantId)
    ]);

    return calculateDashboardMetrics({ supplies, products, sales, expenses }, "2026-06-10");
  });
}
```

- [ ] **Step 5: Register route in `apps/api/src/app.ts`**

```ts
import cors from "@fastify/cors";
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerDashboardRoutes } from "./routes/dashboard";
import { registerHealthRoutes } from "./routes/health";

export function buildApp() {
  const app = Fastify({ logger: false });
  const config = getConfig();
  void app.register(cors, { origin: config.webOrigin });
  void app.register(registerHealthRoutes);
  void app.register(registerDashboardRoutes);
  return app;
}
```

- [ ] **Step 6: Run GREEN**

Run:

```bash
corepack pnpm --filter @emprendedos/api test
corepack pnpm --filter @emprendedos/api typecheck
```

Expected: all API tests pass.

- [ ] **Step 7: Commit**

```bash
git add apps/api
git commit -m "feat: add dashboard API endpoint"
```

## Task 6: Database Schema Draft

**Files:**
- Create: `apps/api/src/db/schema.ts`
- Create: `docs/database-schema.sql`

- [ ] **Step 1: Create `docs/database-schema.sql`**

```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  business_type text NOT NULL,
  country text NOT NULL,
  currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE products (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  unit text NOT NULL DEFAULT 'un',
  stock numeric(12, 2) NOT NULL DEFAULT 0,
  min_stock numeric(12, 2) NOT NULL DEFAULT 0,
  unit_cost numeric(14, 2) NOT NULL DEFAULT 0,
  price numeric(14, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_tenant_id_idx ON products(tenant_id);

CREATE TABLE supplies (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  unit text NOT NULL DEFAULT 'un',
  stock numeric(12, 2) NOT NULL DEFAULT 0,
  min_stock numeric(12, 2) NOT NULL DEFAULT 0,
  average_cost numeric(14, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplies_tenant_id_idx ON supplies(tenant_id);

CREATE TABLE sales (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  product_id uuid NOT NULL REFERENCES products(id),
  date date NOT NULL,
  quantity numeric(12, 2) NOT NULL,
  unit_price numeric(14, 2) NOT NULL,
  unit_cost numeric(14, 2) NOT NULL,
  revenue numeric(14, 2) NOT NULL,
  cost numeric(14, 2) NOT NULL,
  gross_profit numeric(14, 2) NOT NULL,
  channel text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sales_tenant_date_idx ON sales(tenant_id, date);

CREATE TABLE expenses (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX expenses_tenant_date_idx ON expenses(tenant_id, date);
```

- [ ] **Step 2: Add RLS draft to `docs/database-schema.sql`**

Append:

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_products_policy ON products
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_supplies_policy ON supplies
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_sales_policy ON sales
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_expenses_policy ON expenses
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

- [ ] **Step 3: Create `apps/api/src/db/schema.ts`**

```ts
export const databaseSchemaVersion = "2026-06-10-saas-foundation";
```

This placeholder module exists so API imports have a stable schema boundary until Drizzle migrations are introduced.

- [ ] **Step 4: Commit**

```bash
git add docs/database-schema.sql apps/api/src/db/schema.ts
git commit -m "docs: add tenant database schema draft"
```

## Task 7: React Web App Skeleton

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/api/client.ts`
- Create: `apps/web/src/components/Shell.tsx`
- Create: `apps/web/src/components/Dashboard.tsx`
- Create: `apps/web/src/styles.css`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@emprendedos/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `apps/web/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Emprendedos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `apps/web/src/api/client.ts`**

```ts
export type DashboardMetrics = {
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyExpenses: number;
  averageMarginPercent: number;
  totalInventoryValue: number;
  netAfterExpenses: number;
  businessHealthScore?: number;
  weeklyRevenue: Array<{ label: string; revenue: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  growthActions: Array<{ title: string; detail: string; tone: string }>;
  lowStockItems: Array<{ name: string; type: string; stock: number; minStock: number; unit?: string }>;
  topProductsByRevenue: Array<{ name: string; quantity: number; revenue: number; grossProfit: number }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/v1/dashboard`);
  if (!response.ok) throw new Error("No se pudo cargar el dashboard");
  return response.json();
}
```

- [ ] **Step 5: Create `apps/web/src/components/Shell.tsx`**

```tsx
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">e</span>
          <div>
            <strong>
              emprende<span>dos</span>
            </strong>
            <small>Crece con claridad</small>
          </div>
        </div>
        <nav className="nav">
          <button className="nav-item active">Mi negocio</button>
          <button className="nav-item">Productos</button>
          <button className="nav-item">Inventario</button>
          <button className="nav-item">Ventas</button>
          <button className="nav-item">Gastos</button>
        </nav>
        <div className="top-actions">
          <span className="today-pill">Junio 2026</span>
          <button className="primary-action">+ Registrar venta</button>
        </div>
      </header>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Create `apps/web/src/components/Dashboard.tsx`**

```tsx
import type { DashboardMetrics } from "../api/client";

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function Dashboard({ metrics }: { metrics: DashboardMetrics }) {
  const score = metrics.businessHealthScore ?? 60;
  const circumference = 389.56;
  const offset = circumference - (score / 100) * circumference;

  return (
    <main>
      <section className="hero-grid">
        <article className="card score-card">
          <div className="card-head">
            <h2>Salud del negocio</h2>
            <span>Buen pulso</span>
          </div>
          <div className="gauge">
            <svg viewBox="0 0 160 160">
              <circle className="gauge-track" cx="80" cy="80" r="62" fill="none" strokeWidth="16" />
              <circle className="gauge-fill" cx="80" cy="80" r="62" fill="none" strokeWidth="16" strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="gauge-value">
              <strong>{score}</strong>
              <span>de 100</span>
            </div>
          </div>
        </article>
        <article className="card decisions-card">
          <div className="decisions-head">
            <div>
              <h2>Tus 3 decisiones de esta semana</h2>
              <p>
                Vendiste <b>{money(metrics.monthlyRevenue)}</b> con margen de {metrics.averageMarginPercent}%.
              </p>
            </div>
          </div>
          <div className="decision-list">
            {metrics.growthActions.slice(0, 3).map((action) => (
              <article className={`decision d-${action.tone}`} key={action.title}>
                <span>{action.tone === "focus" ? "Revisar" : action.tone === "warning" ? "Comprar" : "Producir"}</span>
                <strong>{action.title}</strong>
                <p>{action.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <div className="metric-grid">
        <Metric label="Ventas del mes" value={money(metrics.monthlyRevenue)} detail="Ingresos registrados" />
        <Metric label="Utilidad bruta" value={money(metrics.monthlyGrossProfit)} detail={`${metrics.averageMarginPercent}% margen`} />
        <Metric label="Inventario valorizado" value={money(metrics.totalInventoryValue)} detail="Insumos + productos" />
        <Metric label="Gastos del mes" value={money(metrics.monthlyExpenses)} detail="Operacion registrada" />
        <Metric label="Resultado operativo" value={money(metrics.netAfterExpenses)} detail="Utilidad menos gastos" />
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
```

- [ ] **Step 7: Create `apps/web/src/App.tsx`**

```tsx
import { useEffect, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics } from "./api/client";
import { Dashboard } from "./components/Dashboard";
import { Shell } from "./components/Shell";

export function App() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardMetrics().then(setMetrics).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Error cargando dashboard");
    });
  }, []);

  return (
    <Shell>
      {error ? <div className="card">{error}</div> : null}
      {!metrics && !error ? <div className="card">Cargando Emprendedos...</div> : null}
      {metrics ? <Dashboard metrics={metrics} /> : null}
    </Shell>
  );
}
```

- [ ] **Step 8: Create `apps/web/src/main.tsx`**

```tsx
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **Step 9: Create `apps/web/src/styles.css`**

```css
:root {
  --bg: #f7f8fa;
  --surface: #ffffff;
  --ink: #15202b;
  --muted: #8694a0;
  --line: #e8ecf0;
  --green: #0ea866;
  --green-soft: #e3f6ed;
  --coral: #f0573e;
  --coral-soft: #fdeae6;
  --blue: #2d6bf0;
  --yellow: #f5a623;
  --yellow-soft: #fdf3df;
  --shadow: 0 1px 2px rgba(21, 32, 43, 0.04), 0 10px 30px rgba(21, 32, 43, 0.07);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Segoe UI", "Trebuchet MS", sans-serif;
}

button {
  font: inherit;
  cursor: pointer;
}

.shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.topbar {
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--green), var(--blue));
  color: #fff;
  font-weight: 900;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong span {
  color: var(--green);
}

.brand small {
  color: var(--muted);
}

.nav {
  display: flex;
  gap: 4px;
  margin-left: 18px;
  overflow-x: auto;
}

.nav-item {
  min-height: 38px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  padding: 8px 14px;
  white-space: nowrap;
}

.nav-item.active {
  background: var(--ink);
  color: #fff;
  font-weight: 700;
}

.top-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.today-pill,
.primary-action {
  min-height: 38px;
  border-radius: 999px;
  padding: 8px 16px;
  border: 1px solid var(--line);
  background: var(--surface);
  font-weight: 700;
}

.primary-action {
  border: 0;
  color: #fff;
  background: var(--coral);
  box-shadow: 0 8px 20px rgba(240, 87, 62, 0.28);
}

.hero-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 18px;
  margin: 12px 0 24px;
}

.card,
.metric-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 22px;
}

.card-head,
.decisions-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.score-card {
  display: grid;
  justify-items: center;
  text-align: center;
}

.gauge {
  position: relative;
  width: 172px;
  height: 172px;
}

.gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gauge-track {
  stroke: #eef1f4;
}

.gauge-fill {
  stroke: var(--green);
  stroke-linecap: round;
}

.gauge-value {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
}

.gauge-value strong {
  font-size: 2.75rem;
  line-height: 0.96;
  font-weight: 900;
}

.decision-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.decision {
  display: grid;
  gap: 10px;
  border-radius: 14px;
  padding: 16px;
  background: var(--green-soft);
}

.decision.d-warning {
  background: var(--yellow-soft);
}

.decision.d-focus {
  background: var(--coral-soft);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  border-left: 4px solid var(--blue);
}

.metric-card strong {
  display: block;
  margin: 8px 0;
  font-size: 2rem;
}

@media (max-width: 900px) {
  .topbar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
  }

  .hero-grid,
  .decision-list,
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 10: Run web checks**

Run:

```bash
corepack pnpm --filter @emprendedos/web typecheck
corepack pnpm --filter @emprendedos/web build
```

Expected: typecheck and build pass.

- [ ] **Step 11: Commit**

```bash
git add apps/web
git commit -m "feat: add React web dashboard shell"
```

## Task 8: Local End-to-End Smoke Check

**Files:**
- Modify only if verification exposes issues.

- [ ] **Step 1: Start API**

Run:

```bash
corepack pnpm --filter @emprendedos/api dev
```

Expected: API listens on `http://127.0.0.1:3001`.

- [ ] **Step 2: Start web app**

Run in another terminal:

```bash
corepack pnpm --filter @emprendedos/web dev -- --port 5173
```

Expected: web app listens on `http://127.0.0.1:5173`.

- [ ] **Step 3: Verify health and dashboard**

Run:

```bash
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/dashboard
```

Expected: both return HTTP 200.

- [ ] **Step 4: Browser smoke test**

Open `http://127.0.0.1:5173`.

Verify:

- Brand says `emprendedos`.
- Dashboard loads without error.
- Health score is visible.
- Weekly decisions are visible.
- KPI cards show non-zero demo values.

- [ ] **Step 5: Run full checks**

Run:

```bash
corepack pnpm test
corepack pnpm typecheck
```

Expected: all workspace tests and typechecks pass.

- [ ] **Step 6: Commit any smoke fixes**

If no fixes are needed, do not create an empty commit.

## Task 9: SaaS Foundation Documentation

**Files:**
- Create: `docs/saas-foundation-runbook.md`
- Modify: `README.md` or create if absent.

- [ ] **Step 1: Create `docs/saas-foundation-runbook.md`**

```md
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
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/dashboard`

## Tenant Safety

All business data must be read through tenant-aware repositories. Never query business records without passing the active `tenantId`.

## Current Limitations

- Demo auth only.
- In-memory repositories for first SaaS foundation milestone.
- PostgreSQL schema is drafted but not wired to runtime yet.
- Billing is not implemented.
```

- [ ] **Step 2: Create or update `README.md`**

```md
# Emprendedos

Emprendedos is a SaaS product for entrepreneurs who produce and sell physical goods. It helps them understand sales, margin, inventory, expenses, and weekly growth decisions.

## Current Workstreams

- `index.html` and `src/`: legacy local-first prototype.
- `apps/api`: SaaS API foundation.
- `apps/web`: SaaS React web app.
- `packages/domain`: shared business rules.

## Run SaaS Foundation

See `docs/saas-foundation-runbook.md`.
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/saas-foundation-runbook.md
git commit -m "docs: add SaaS foundation runbook"
```

## Self-Review Checklist

- [ ] Workspace setup supports `apps/*` and `packages/*`.
- [ ] Domain rules are testable without API or UI.
- [ ] API exposes health and dashboard endpoints.
- [ ] Repository layer requires tenant id for business data.
- [ ] Tenant isolation is covered by tests.
- [ ] React app consumes API dashboard data.
- [ ] PostgreSQL schema draft includes `tenant_id` and RLS policies.
- [ ] Runbook explains local development and current limitations.
- [ ] Static prototype remains intact as product reference.

## Execution Recommendation

Use **Inline Execution** for Task 1 and Task 2 because they establish the workspace and shared domain. After that, use **Subagent-Driven** for parallel work:

- Worker A: API skeleton and tenant repositories.
- Worker B: React web app shell.
- Worker C: database schema and runbook.

Review after each task and keep commits small.
