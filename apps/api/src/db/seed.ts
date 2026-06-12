import { createInMemoryRepositories } from "./repositories.js";
import { getConfig } from "../config.js";
import { hashPassword } from "../auth/passwords.js";

export async function createSeededRepositories() {
  const repositories = createInMemoryRepositories();
  const config = getConfig();
  const tenantId = process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001";
  const userId = process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001";

  await repositories.auth.insert({
    userId,
    tenantId,
    email: "demo@emprendedos.local",
    passwordHash: await hashPassword(config.demoAuthPassword),
    role: "owner"
  });

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
  await repositories.supplies.insert({
    tenantId,
    id: "aceite-coco",
    name: "Aceite coco",
    stock: 18,
    minStock: 12,
    averageCost: 22000,
    unit: "kg"
  });
  await repositories.supplies.insert({
    tenantId,
    id: "manteca-karite",
    name: "Manteca karite",
    stock: 8,
    minStock: 10,
    averageCost: 36000,
    unit: "kg"
  });
  await repositories.products.insert({
    tenantId,
    id: "jabon-lavanda",
    name: "Jabon lavanda",
    stock: 24,
    minStock: 18,
    unitCost: 3600,
    price: 12000,
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
  await repositories.recipes.insert({
    tenantId,
    id: "shampoo-romero-base",
    productId: "shampoo-romero",
    name: "Formula base shampoo romero",
    outputQuantity: 10,
    ingredients: [
      { supplyId: "envase-vidrio", quantity: 10 },
      { supplyId: "etiqueta-kraft", quantity: 10 }
    ],
    note: "Receta demo para validar produccion repetible"
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
  await repositories.sales.insert({
    tenantId,
    date: "2026-06-10",
    productId: "jabon-lavanda",
    quantity: 4,
    revenue: 48000,
    cost: 14400,
    grossProfit: 33600
  });
  await repositories.productionOrders.insert({
    tenantId,
    id: "60000000-0000-0000-0000-000000000001",
    productId: "shampoo-romero",
    quantity: 10,
    totalCost: 15000,
    unitCost: 1500,
    recipeId: "shampoo-romero-base",
    note: "Lote demo producido desde receta",
    createdAt: "2026-06-10T09:00:00.000Z"
  });
  await repositories.inventoryMovements.insert({
    tenantId,
    id: "70000000-0000-0000-0000-000000000001",
    itemType: "product",
    itemId: "shampoo-romero",
    movementType: "production",
    quantity: 10,
    stockBefore: 2,
    stockAfter: 12,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Entrada de lote demo",
    createdAt: "2026-06-10T09:00:00.000Z"
  });
  await repositories.inventoryMovements.insert({
    tenantId,
    id: "70000000-0000-0000-0000-000000000002",
    itemType: "supply",
    itemId: "envase-vidrio",
    movementType: "production",
    quantity: -10,
    stockBefore: 40,
    stockAfter: 30,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Consumo de lote demo",
    createdAt: "2026-06-10T09:00:00.000Z"
  });
  await repositories.inventoryMovements.insert({
    tenantId,
    id: "70000000-0000-0000-0000-000000000003",
    itemType: "supply",
    itemId: "etiqueta-kraft",
    movementType: "production",
    quantity: -10,
    stockBefore: 76,
    stockAfter: 66,
    referenceType: "production_order",
    referenceId: "60000000-0000-0000-0000-000000000001",
    note: "Consumo de lote demo",
    createdAt: "2026-06-10T09:00:00.000Z"
  });
  await repositories.expenses.insert({ tenantId, date: "2026-06-02", category: "Servicios", amount: 68000 });
  await repositories.expenses.insert({ tenantId, date: "2026-06-05", category: "Herramientas", amount: 78000 });

  return repositories;
}
