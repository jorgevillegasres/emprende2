import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSupplyPurchase,
  calculateDashboardMetrics,
  getLowStockItems,
  getMonthlyExpenseTotal,
  registerSale,
  registerProduction,
} from '../src/domain.js';
import { shouldRefreshStoredState } from '../src/storage.js';

test('addSupplyPurchase recalculates weighted average cost', () => {
  const state = {
    supplies: [{ id: 'oil', name: 'Aceite de coco', stock: 10, averageCost: 1000 }],
    purchases: [],
  };

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
      { id: 'oil', name: 'Aceite de coco', stock: 10, averageCost: 1000 },
      { id: 'fragrance', name: 'Fragancia lavanda', stock: 5, averageCost: 2000 },
    ],
    products: [{ id: 'soap', name: 'Jabon lavanda', stock: 2, unitCost: 4000, price: 9000 }],
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

  assert.equal(result.supplies.find((supply) => supply.id === 'oil').stock, 8);
  assert.equal(result.supplies.find((supply) => supply.id === 'fragrance').stock, 4);
  assert.equal(result.products[0].stock, 6);
  assert.equal(result.products[0].unitCost, 2000);
  assert.equal(result.productions[0].totalCost, 4000);
});

test('registerProduction rejects insufficient supply stock', () => {
  const state = {
    supplies: [{ id: 'oil', name: 'Aceite de coco', stock: 1, averageCost: 1000 }],
    products: [{ id: 'soap', name: 'Jabon lavanda', stock: 0, unitCost: 0, price: 9000 }],
    productions: [],
  };

  assert.throws(
    () =>
      registerProduction(state, {
        id: 'lot1',
        productId: 'soap',
        quantityProduced: 4,
        date: '2026-06-09',
        consumptions: [{ supplyId: 'oil', quantity: 2 }],
      }),
    /Stock insuficiente/,
  );
});

test('registerSale discounts finished stock and records gross margin', () => {
  const state = {
    products: [{ id: 'soap', name: 'Jabon lavanda', stock: 10, unitCost: 3000, price: 9000 }],
    sales: [],
  };

  const result = registerSale(state, {
    id: 'sale1',
    productId: 'soap',
    quantity: 3,
    unitPrice: 10000,
    date: '2026-06-10',
    channel: 'Feria',
  });

  assert.equal(result.products[0].stock, 7);
  assert.equal(result.sales[0].revenue, 30000);
  assert.equal(result.sales[0].cost, 9000);
  assert.equal(result.sales[0].grossProfit, 21000);
});

test('registerSale rejects insufficient finished product stock', () => {
  const state = {
    products: [{ id: 'soap', name: 'Jabon lavanda', stock: 1, unitCost: 3000, price: 9000 }],
    sales: [],
  };

  assert.throws(
    () =>
      registerSale(state, {
        id: 'sale1',
        productId: 'soap',
        quantity: 2,
        unitPrice: 9000,
        date: '2026-06-10',
        channel: 'Instagram',
      }),
    /Stock insuficiente/,
  );
});

test('getLowStockItems returns supplies and products below minimum', () => {
  const alerts = getLowStockItems({
    supplies: [{ name: 'Aceite de coco', stock: 1, minStock: 2, unit: 'L' }],
    products: [{ name: 'Jabon lavanda', stock: 3, minStock: 5, unit: 'un' }],
  });

  assert.deepEqual(
    alerts.map((item) => item.name),
    ['Aceite de coco', 'Jabon lavanda'],
  );
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

test('calculateDashboardMetrics summarizes inventory value and margins', () => {
  const metrics = calculateDashboardMetrics(
    {
      supplies: [{ stock: 10, averageCost: 2000, minStock: 2 }],
      products: [{ id: 'soap', name: 'Jabon', stock: 5, unitCost: 3000, price: 9000, minStock: 1 }],
      expenses: [{ date: '2026-06-09', category: 'Servicios', amount: 7000 }],
      sales: [{ date: '2026-06-09', revenue: 30000, cost: 9000, grossProfit: 21000 }],
      productions: [],
      purchases: [],
    },
    '2026-06-09',
  );

  assert.equal(metrics.supplyInventoryValue, 20000);
  assert.equal(metrics.productInventoryValue, 15000);
  assert.equal(metrics.monthlyExpenses, 7000);
  assert.equal(metrics.monthlyRevenue, 30000);
  assert.equal(metrics.monthlyGrossProfit, 21000);
  assert.equal(metrics.marginLeaders[0].margin, 6000);
});

test('calculateDashboardMetrics builds growth dashboard insights', () => {
  const metrics = calculateDashboardMetrics(
    {
      supplies: [{ name: 'Etiquetas', stock: 5, minStock: 10, averageCost: 300 }],
      products: [
        { id: 'soap', name: 'Jabon', stock: 5, minStock: 3, unitCost: 3000, price: 9000 },
        { id: 'balm', name: 'Balsamo', stock: 1, minStock: 5, unitCost: 7000, price: 9000 },
      ],
      expenses: [
        { date: '2026-06-02', category: 'Servicios', amount: 20000 },
        { date: '2026-06-03', category: 'Publicidad', amount: 30000 },
      ],
      sales: [
        {
          date: '2026-06-01',
          productId: 'soap',
          quantity: 2,
          revenue: 18000,
          cost: 6000,
          grossProfit: 12000,
        },
        {
          date: '2026-06-09',
          productId: 'balm',
          quantity: 1,
          revenue: 9000,
          cost: 7000,
          grossProfit: 2000,
        },
      ],
      productions: [],
      purchases: [],
    },
    '2026-06-10',
  );

  assert.equal(metrics.averageMarginPercent, 51.85);
  assert.equal(metrics.businessHealthScore, 62);
  assert.deepEqual(
    metrics.weeklyRevenue.map((week) => week.revenue),
    [18000, 9000, 0, 0, 0],
  );
  assert.deepEqual(metrics.expensesByCategory, [
    { category: 'Publicidad', amount: 30000 },
    { category: 'Servicios', amount: 20000 },
  ]);
  assert.deepEqual(metrics.topProductsByRevenue[0], {
    productId: 'soap',
    name: 'Jabon',
    quantity: 2,
    revenue: 18000,
    grossProfit: 12000,
  });
  assert.equal(metrics.growthActions.length, 3);
});

test('shouldRefreshStoredState flags stored states without sales collection', () => {
  assert.equal(
    shouldRefreshStoredState({
      supplies: [],
      products: [],
      recipes: [],
      purchases: [],
      productions: [],
      expenses: [],
    }),
    true,
  );

  assert.equal(
    shouldRefreshStoredState({
      supplies: [],
      products: [],
      recipes: [],
      purchases: [],
      productions: [],
      expenses: [],
      sales: [],
    }),
    false,
  );
});
