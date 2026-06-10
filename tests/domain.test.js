import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSupplyPurchase,
  calculateDashboardMetrics,
  getLowStockItems,
  getMonthlyExpenseTotal,
  registerProduction,
} from '../src/domain.js';

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
      products: [{ name: 'Jabon', stock: 5, unitCost: 3000, price: 9000, minStock: 1 }],
      expenses: [{ date: '2026-06-09', amount: 7000 }],
      productions: [],
      purchases: [],
    },
    '2026-06-09',
  );

  assert.equal(metrics.supplyInventoryValue, 20000);
  assert.equal(metrics.productInventoryValue, 15000);
  assert.equal(metrics.monthlyExpenses, 7000);
  assert.equal(metrics.marginLeaders[0].margin, 6000);
});
