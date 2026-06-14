import { createInMemoryRepositories } from "./repositories.js";
import { getConfig } from "../config.js";
import { hashPassword } from "../auth/passwords.js";
import {
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  demoExpenses,
  demoInventoryMovements,
  demoProductionOrders,
  demoProducts,
  demoRecipes,
  demoSales,
  demoSupplies
} from "./demo-data.js";

export async function createSeededRepositories() {
  const repositories = createInMemoryRepositories();
  const config = getConfig();
  const tenantId = DEMO_TENANT_ID;
  const userId = DEMO_USER_ID;

  await repositories.auth.insert({
    userId,
    tenantId,
    email: config.demoAuthEmail,
    passwordHash: await hashPassword(config.demoAuthPassword),
    role: "owner"
  });

  for (const supply of demoSupplies) {
    await repositories.supplies.insert({ tenantId, ...supply });
  }
  for (const product of demoProducts) {
    await repositories.products.insert({ tenantId, ...product });
  }
  for (const recipe of demoRecipes) {
    await repositories.recipes.insert({
      tenantId,
      id: recipe.id,
      productId: recipe.productId,
      name: recipe.name,
      outputQuantity: recipe.outputQuantity,
      note: recipe.note,
      ingredients: recipe.ingredients.map((ingredient) => ({ supplyId: ingredient.supplyId, quantity: ingredient.quantity }))
    });
  }
  for (const sale of demoSales) {
    await repositories.sales.insert({
      tenantId,
      date: sale.date,
      productId: sale.productId,
      quantity: sale.quantity,
      revenue: sale.revenue,
      cost: sale.cost,
      grossProfit: sale.grossProfit
    });
  }
  for (const order of demoProductionOrders) {
    await repositories.productionOrders.insert({ tenantId, ...order });
  }
  for (const movement of demoInventoryMovements) {
    await repositories.inventoryMovements.insert({ tenantId, ...movement });
  }
  for (const expense of demoExpenses) {
    await repositories.expenses.insert({ tenantId, date: expense.date, category: expense.category, amount: expense.amount });
  }

  return repositories;
}
