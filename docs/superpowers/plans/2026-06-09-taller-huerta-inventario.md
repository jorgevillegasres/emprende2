# Taller De La Huerta Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first web app for managing artisan-product inventory, purchases, production, recipes, costs, expenses, and a dashboard.

**Architecture:** The app is static and runs directly from `index.html`. Business rules live in `src/domain.js`, persistence and demo data live in `src/storage.js`, and DOM/UI orchestration lives in `src/app.js`.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, browser localStorage, Node.js built-in `node --test`.

---

## File Structure

- `package.json`: project scripts for tests.
- `index.html`: application shell and module entry.
- `src/domain.js`: pure functions for inventory, weighted average cost, production, alerts, and metrics.
- `src/storage.js`: localStorage adapter and seed data.
- `src/app.js`: state management, form handling, and rendering.
- `src/styles.css`: responsive dashboard and management UI.
- `tests/domain.test.js`: behavior tests for cost and inventory rules.

## Task 1: Domain Tests

**Files:**
- Create: `tests/domain.test.js`
- Create: `package.json`

- [ ] **Step 1: Write failing tests for weighted average, production, low stock, and expenses**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSupplyPurchase,
  registerProduction,
  getLowStockItems,
  getMonthlyExpenseTotal,
} from '../src/domain.js';

test('addSupplyPurchase recalculates weighted average cost', () => {
  const state = { supplies: [{ id: 'oil', stock: 10, averageCost: 1000 }], purchases: [] };
  const result = addSupplyPurchase(state, {
    id: 'p1',
    supplyId: 'oil',
    quantity: 10,
    totalCost: 30000,
    date: '2026-06-09',
    supplier: 'Proveedor A',
  });

  assert.equal(result.supplies[0].stock, 20);
  assert.equal(result.supplies[0].averageCost, 2000);
  assert.equal(result.purchases.length, 1);
});

test('registerProduction consumes supplies and creates finished product stock', () => {
  const state = {
    supplies: [
      { id: 'oil', stock: 10, averageCost: 1000 },
      { id: 'fragrance', stock: 5, averageCost: 2000 },
    ],
    products: [{ id: 'soap', stock: 2, unitCost: 4000, price: 9000 }],
    productions: [],
  };

  const result = registerProduction(state, {
    id: 'lot1',
    productId: 'soap',
    quantityProduced: 4,
    date: '2026-06-09',
    consumptions: [
      { supplyId: 'oil', quantity: 2 },
      { supplyId: 'fragrance', quantity: 1 },
    ],
  });

  assert.equal(result.supplies.find((s) => s.id === 'oil').stock, 8);
  assert.equal(result.supplies.find((s) => s.id === 'fragrance').stock, 4);
  assert.equal(result.products[0].stock, 6);
  assert.equal(result.products[0].unitCost, 1000);
  assert.equal(result.productions[0].totalCost, 4000);
});

test('getLowStockItems returns supplies and products below minimum', () => {
  const alerts = getLowStockItems({
    supplies: [{ name: 'Aceite de coco', stock: 1, minStock: 2, unit: 'L' }],
    products: [{ name: 'Jabon lavanda', stock: 3, minStock: 5, unit: 'un' }],
  });

  assert.deepEqual(alerts.map((item) => item.name), ['Aceite de coco', 'Jabon lavanda']);
});

test('getMonthlyExpenseTotal sums only matching month expenses', () => {
  const total = getMonthlyExpenseTotal(
    [
      { date: '2026-06-01', amount: 15000 },
      { date: '2026-06-09', amount: 5000 },
      { date: '2026-05-30', amount: 8000 },
    ],
    '2026-06',
  );

  assert.equal(total, 20000);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/domain.test.js`

Expected: FAIL because `src/domain.js` does not exist yet.

## Task 2: Domain Implementation

**Files:**
- Create: `src/domain.js`

- [ ] **Step 1: Implement immutable state helpers and business rules**

Export:

- `addSupplyPurchase(state, purchase)`
- `registerProduction(state, production)`
- `getLowStockItems(state)`
- `getMonthlyExpenseTotal(expenses, monthKey)`
- `formatCurrency(value)`
- `calculateDashboardMetrics(state, today)`

Rules:

- Weighted average cost: `(oldStock * oldAverageCost + purchase.totalCost) / (oldStock + purchase.quantity)`.
- Production supply cost: `consumption.quantity * supply.averageCost`.
- Produced product unit cost: `totalProductionCost / quantityProduced`.
- Product stock cost average: blend existing finished stock value and new produced stock value.
- Throw clear errors when stock is insufficient or referenced records are missing.

- [ ] **Step 2: Run tests to verify GREEN**

Run: `node --test tests/domain.test.js`

Expected: PASS with 4 tests.

## Task 3: Storage And Demo Data

**Files:**
- Create: `src/storage.js`

- [ ] **Step 1: Add localStorage adapter**

Export:

- `createInitialState()`
- `loadState()`
- `saveState(state)`
- `resetState()`

Initial data must include:

- 6 supplies across oils, fragrances, packaging, actives.
- 4 products across soap, shampoo solid, oil, balm.
- 2 recipes.
- 3 purchases.
- 2 productions.
- 4 expenses.

## Task 4: Application Shell

**Files:**
- Create: `index.html`
- Create: `src/app.js`
- Create: `src/styles.css`

- [ ] **Step 1: Build the app shell**

The first viewport shows the dashboard, not a landing page. Navigation sections:

- Dashboard
- Insumos
- Productos
- Recetas
- Produccion
- Compras
- Gastos

- [ ] **Step 2: Wire forms**

Forms required:

- Add supply purchase.
- Add production.
- Add expense.
- Add or edit minimum stock values through compact table inputs.

- [ ] **Step 3: Render tables and cards**

Views required:

- Dashboard metric cards.
- Alert list for low stock and upcoming expiration.
- Supply inventory table.
- Product inventory table.
- Recipe summary.
- Production history.
- Purchase history.
- Expense table and monthly total.

## Task 5: Verification

**Files:**
- Modify as needed.

- [ ] **Step 1: Run automated tests**

Run: `node --test tests/domain.test.js`

Expected: PASS.

- [ ] **Step 2: Manual browser check**

Open: `index.html`

Verify:

- Dashboard renders demo data.
- Registering a purchase updates stock and average cost.
- Registering production consumes supplies and increases finished product stock.
- Registering expense updates monthly expense total.
- Mobile width keeps navigation and tables usable.

- [ ] **Step 3: Commit**

Run:

```bash
git add package.json index.html src tests docs/superpowers/plans/2026-06-09-taller-huerta-inventario.md
git commit -m "Build local inventory management app"
```
