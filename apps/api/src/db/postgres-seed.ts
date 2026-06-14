import type { createPostgresClient } from "./client.js";
import { expenses, inventoryMovements, memberships, productionOrders, products, recipeIngredients, recipes, sales, supplies, tenants, users } from "./schema.js";
import { getConfig } from "../config.js";
import { hashPassword } from "../auth/passwords.js";
import {
  DEMO_MEMBERSHIP_ID,
  DEMO_TENANT_ID,
  DEMO_USER_ID,
  demoExpenses,
  demoInventoryMovements,
  demoProductionOrders,
  demoProducts,
  demoRecipes,
  demoSales,
  demoSupplies,
  demoTenant,
  demoUserName
} from "./demo-data.js";

type Db = ReturnType<typeof createPostgresClient>["db"];

export async function seedPostgresDemoData(db: Db) {
  const config = getConfig();
  const demoPasswordHash = await hashPassword(config.demoAuthPassword);
  const tenantId = DEMO_TENANT_ID;

  await db
    .insert(tenants)
    .values({
      id: demoTenant.id,
      name: demoTenant.name,
      slug: demoTenant.slug,
      businessType: demoTenant.businessType,
      country: demoTenant.country,
      currency: demoTenant.currency
    })
    .onConflictDoNothing();

  await db
    .insert(users)
    .values({ id: DEMO_USER_ID, email: config.demoAuthEmail, name: demoUserName, passwordHash: demoPasswordHash })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: config.demoAuthEmail, name: demoUserName, passwordHash: demoPasswordHash }
    });

  await db
    .insert(memberships)
    .values({ id: DEMO_MEMBERSHIP_ID, tenantId, userId: DEMO_USER_ID, role: "owner" })
    .onConflictDoNothing();

  await db.insert(supplies).values(demoSupplies.map((supply) => ({ tenantId, ...supply }))).onConflictDoNothing();

  await db.insert(products).values(demoProducts.map((product) => ({ tenantId, ...product }))).onConflictDoNothing();

  await db
    .insert(recipes)
    .values(
      demoRecipes.map((recipe) => ({
        id: recipe.id,
        tenantId,
        productId: recipe.productId,
        name: recipe.name,
        outputQuantity: recipe.outputQuantity,
        note: recipe.note
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(recipeIngredients)
    .values(
      demoRecipes.flatMap((recipe) =>
        recipe.ingredients.map((ingredient) => ({
          id: ingredient.id,
          tenantId,
          recipeId: recipe.id,
          supplyId: ingredient.supplyId,
          quantity: ingredient.quantity
        }))
      )
    )
    .onConflictDoNothing();

  await db
    .insert(sales)
    .values(
      demoSales.map((sale) => ({
        id: sale.id,
        tenantId,
        date: sale.date,
        productId: sale.productId,
        quantity: sale.quantity,
        revenue: sale.revenue,
        cost: sale.cost,
        grossProfit: sale.grossProfit
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(productionOrders)
    .values(
      demoProductionOrders.map((order) => ({
        id: order.id,
        tenantId,
        productId: order.productId,
        quantity: order.quantity,
        totalCost: order.totalCost,
        unitCost: order.unitCost,
        recipeId: order.recipeId,
        note: order.note,
        createdAt: new Date(order.createdAt)
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(inventoryMovements)
    .values(
      demoInventoryMovements.map((movement) => ({
        id: movement.id,
        tenantId,
        itemType: movement.itemType,
        itemId: movement.itemId,
        movementType: movement.movementType,
        quantity: movement.quantity,
        stockBefore: movement.stockBefore,
        stockAfter: movement.stockAfter,
        referenceType: movement.referenceType,
        referenceId: movement.referenceId,
        note: movement.note,
        createdAt: new Date(movement.createdAt)
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(expenses)
    .values(demoExpenses.map((expense) => ({ id: expense.id, tenantId, date: expense.date, category: expense.category, amount: expense.amount })))
    .onConflictDoNothing();
}
