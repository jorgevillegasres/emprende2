import { createInMemoryRepositories } from "./repositories.js";

export async function createSeededRepositories() {
  const repositories = createInMemoryRepositories();
  const tenantId = process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001";

  await repositories.supplies.insert({
    tenantId,
    id: "envase-vidrio",
    name: "Envase vidrio 10 ml",
    stock: 30,
    minStock: 40,
    averageCost: 1200,
    unit: "un"
  });
  await repositories.supplies.insert({
    tenantId,
    id: "etiqueta-kraft",
    name: "Etiqueta kraft",
    stock: 66,
    minStock: 80,
    averageCost: 300,
    unit: "un"
  });
  await repositories.products.insert({
    tenantId,
    id: "shampoo-romero",
    name: "Shampoo solido romero",
    stock: 12,
    minStock: 10,
    unitCost: 5200,
    price: 16000,
    unit: "un"
  });
  await repositories.products.insert({
    tenantId,
    id: "balsamo-calendula",
    name: "Balsamo calendula",
    stock: 6,
    minStock: 8,
    unitCost: 4300,
    price: 14000,
    unit: "un"
  });
  await repositories.sales.insert({
    tenantId,
    date: "2026-06-09",
    productId: "shampoo-romero",
    quantity: 3,
    revenue: 48000,
    cost: 15600,
    grossProfit: 32400
  });
  await repositories.sales.insert({
    tenantId,
    date: "2026-06-09",
    productId: "balsamo-calendula",
    quantity: 2,
    revenue: 28000,
    cost: 8600,
    grossProfit: 19400
  });
  await repositories.expenses.insert({ tenantId, date: "2026-06-02", category: "Servicios", amount: 68000 });
  await repositories.expenses.insert({ tenantId, date: "2026-06-05", category: "Herramientas", amount: 78000 });

  return repositories;
}
