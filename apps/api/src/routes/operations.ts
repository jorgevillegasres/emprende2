import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { calculateWeightedAverageCost } from "@emprendedos/domain";
import { resolveRequestContext } from "../auth/context.js";
import { getRepositories } from "../db/store.js";

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stock: z.number().nonnegative(),
  minStock: z.number().nonnegative(),
  unitCost: z.number().nonnegative(),
  price: z.number().nonnegative(),
  unit: z.string().min(1).optional()
});

const supplySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stock: z.number().nonnegative(),
  minStock: z.number().nonnegative(),
  averageCost: z.number().nonnegative(),
  unit: z.string().min(1).optional()
});

const saleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  productId: z.string().min(1),
  quantity: z.number().positive(),
  revenue: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  grossProfit: z.number()
});

const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1),
  amount: z.number().nonnegative()
});

const inventoryAdjustmentSchema = z.object({
  itemType: z.literal("product"),
  itemId: z.string().min(1),
  stockAfter: z.number().nonnegative(),
  note: z.string().min(1).max(240)
});

const inventoryPurchaseSchema = z.object({
  itemType: z.enum(["product", "supply"]),
  itemId: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative().optional(),
  note: z.string().min(1).max(240)
});

const productionOrderSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().positive(),
    supplies: z.array(z.object({ supplyId: z.string().min(1), quantity: z.number().positive() })).min(1),
    note: z.string().min(1).max(240)
  })
  .refine((order) => new Set(order.supplies.map((supply) => supply.supplyId)).size === order.supplies.length, {
    message: "Supply lines must be unique",
    path: ["supplies"]
  });

const productionFromRecipeSchema = z.object({
  recipeId: z.string().min(1),
  quantity: z.number().positive(),
  note: z.string().min(1).max(240)
});

const recipeSchema = z
  .object({
    id: z.string().min(1),
    productId: z.string().min(1),
    name: z.string().min(1),
    outputQuantity: z.number().positive(),
    ingredients: z.array(z.object({ supplyId: z.string().min(1), quantity: z.number().positive() })).min(1),
    note: z.string().max(240).optional()
  })
  .refine((recipe) => new Set(recipe.ingredients.map((ingredient) => ingredient.supplyId)).size === recipe.ingredients.length, {
    message: "Ingredient supply lines must be unique",
    path: ["ingredients"]
  });

export async function registerOperationRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  async function executeProductionOrder(tenantId: string, order: z.infer<typeof productionOrderSchema>) {
    const product = await repositories.products.findByTenantAndId(tenantId, order.productId);
    if (!product) return { statusCode: 404, body: { error: "Product not found" } };

    const supplyRecords = [];
    for (const line of order.supplies) {
      const supply = await repositories.supplies.findByTenantAndId(tenantId, line.supplyId);
      if (!supply) return { statusCode: 404, body: { error: "Supply not found", supplyId: line.supplyId } };
      supplyRecords.push({ ...line, supply });
    }

    const insufficient = supplyRecords.find((line) => line.supply.stock < line.quantity);
    if (insufficient) {
      return {
        statusCode: 409,
        body: {
          error: "Insufficient supply stock",
          supplyId: insufficient.supplyId,
          availableStock: insufficient.supply.stock
        }
      };
    }

    const orderId = randomUUID();
    const totalCost = supplyRecords.reduce((sum, line) => sum + line.quantity * line.supply.averageCost, 0);
    const unitCost = Math.round((totalCost / order.quantity + Number.EPSILON) * 100) / 100;
    const productStockBefore = product.stock;
    const productStockAfter = productStockBefore + order.quantity;
    const productUnitCost = calculateWeightedAverageCost(productStockBefore, product.unitCost, order.quantity, totalCost);
    const movements = [];

    for (const line of supplyRecords) {
      const stockBefore = line.supply.stock;
      const stockAfter = stockBefore - line.quantity;
      await repositories.supplies.updateStockAndAverageCost(tenantId, line.supplyId, stockAfter, line.supply.averageCost);
      movements.push(
        await repositories.inventoryMovements.insert({
          id: randomUUID(),
          tenantId,
          itemType: "supply",
          itemId: line.supplyId,
          movementType: "production",
          quantity: -line.quantity,
          stockBefore,
          stockAfter,
          referenceType: "production-order",
          referenceId: orderId,
          note: order.note
        })
      );
    }

    await repositories.products.updateStockAndUnitCost(tenantId, order.productId, productStockAfter, productUnitCost);
    movements.push(
      await repositories.inventoryMovements.insert({
        id: randomUUID(),
        tenantId,
        itemType: "product",
        itemId: order.productId,
        movementType: "production",
        quantity: order.quantity,
        stockBefore: productStockBefore,
        stockAfter: productStockAfter,
        referenceType: "production-order",
        referenceId: orderId,
        note: order.note
      })
    );

    return {
      statusCode: 201,
      body: {
        id: orderId,
        productId: order.productId,
        quantity: order.quantity,
        totalCost,
        unitCost,
        movements
      }
    };
  }

  app.get("/v1/products", async (request) => repositories.products.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/products", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid product payload", issues: parsed.error.issues });
    const created = await repositories.products.insert({ ...parsed.data, tenantId: context.tenantId });
    return reply.code(201).send(created);
  });

  app.get("/v1/supplies", async (request) => repositories.supplies.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/supplies", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = supplySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid supply payload", issues: parsed.error.issues });
    const created = await repositories.supplies.insert({ ...parsed.data, tenantId: context.tenantId });
    return reply.code(201).send(created);
  });

  app.get("/v1/sales", async (request) => repositories.sales.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/sales", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = saleSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid sale payload", issues: parsed.error.issues });
    const product = await repositories.products.findByTenantAndId(context.tenantId, parsed.data.productId);
    if (!product) return reply.code(404).send({ error: "Product not found" });
    if (product.stock < parsed.data.quantity) {
      return reply.code(409).send({ error: "Insufficient product stock", availableStock: product.stock });
    }
    const created = await repositories.sales.insert({ ...parsed.data, tenantId: context.tenantId });
    const stockBefore = product.stock;
    const stockAfter = stockBefore - parsed.data.quantity;
    await repositories.products.updateStock(context.tenantId, parsed.data.productId, stockAfter);
    await repositories.inventoryMovements.insert({
      id: randomUUID(),
      tenantId: context.tenantId,
      itemType: "product",
      itemId: parsed.data.productId,
      movementType: "sale",
      quantity: -parsed.data.quantity,
      stockBefore,
      stockAfter,
      referenceType: "sale",
      referenceId: randomUUID(),
      note: `Venta registrada el ${parsed.data.date}`
    });
    return reply.code(201).send(created);
  });

  app.get("/v1/inventory-movements", async (request) => repositories.inventoryMovements.listByTenant(resolveRequestContext(request.headers).tenantId));

  app.get("/v1/recipes", async (request) => repositories.recipes.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/recipes", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = recipeSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid recipe payload", issues: parsed.error.issues });

    const product = await repositories.products.findByTenantAndId(context.tenantId, parsed.data.productId);
    if (!product) return reply.code(404).send({ error: "Product not found" });

    for (const ingredient of parsed.data.ingredients) {
      const supply = await repositories.supplies.findByTenantAndId(context.tenantId, ingredient.supplyId);
      if (!supply) return reply.code(404).send({ error: "Supply not found", supplyId: ingredient.supplyId });
    }

    const created = await repositories.recipes.insert({
      tenantId: context.tenantId,
      id: parsed.data.id,
      productId: parsed.data.productId,
      name: parsed.data.name,
      outputQuantity: parsed.data.outputQuantity,
      ingredients: parsed.data.ingredients,
      note: parsed.data.note ?? ""
    });

    return reply.code(201).send(created);
  });

  app.post("/v1/inventory-adjustments", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = inventoryAdjustmentSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid inventory adjustment payload", issues: parsed.error.issues });

    const product = await repositories.products.findByTenantAndId(context.tenantId, parsed.data.itemId);
    if (!product) return reply.code(404).send({ error: "Product not found" });

    const stockBefore = product.stock;
    const stockAfter = parsed.data.stockAfter;
    await repositories.products.updateStock(context.tenantId, parsed.data.itemId, stockAfter);
    const movement = await repositories.inventoryMovements.insert({
      id: randomUUID(),
      tenantId: context.tenantId,
      itemType: parsed.data.itemType,
      itemId: parsed.data.itemId,
      movementType: "adjustment",
      quantity: stockAfter - stockBefore,
      stockBefore,
      stockAfter,
      referenceType: "manual-adjustment",
      referenceId: randomUUID(),
      note: parsed.data.note
    });

    return reply.code(201).send(movement);
  });
  app.post("/v1/inventory-purchases", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = inventoryPurchaseSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid inventory purchase payload", issues: parsed.error.issues });

    if (parsed.data.itemType === "product") {
      const product = await repositories.products.findByTenantAndId(context.tenantId, parsed.data.itemId);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      const stockBefore = product.stock;
      const stockAfter = stockBefore + parsed.data.quantity;
      await repositories.products.updateStock(context.tenantId, parsed.data.itemId, stockAfter);
      const movement = await repositories.inventoryMovements.insert({
        id: randomUUID(),
        tenantId: context.tenantId,
        itemType: "product",
        itemId: parsed.data.itemId,
        movementType: "purchase",
        quantity: parsed.data.quantity,
        stockBefore,
        stockAfter,
        referenceType: "inventory-purchase",
        referenceId: randomUUID(),
        note: parsed.data.note
      });
      return reply.code(201).send(movement);
    }

    const supply = await repositories.supplies.findByTenantAndId(context.tenantId, parsed.data.itemId);
    if (!supply) return reply.code(404).send({ error: "Supply not found" });
    const stockBefore = supply.stock;
    const stockAfter = stockBefore + parsed.data.quantity;
    const addedTotalCost = parsed.data.quantity * (parsed.data.unitCost ?? supply.averageCost);
    const averageCost = calculateWeightedAverageCost(stockBefore, supply.averageCost, parsed.data.quantity, addedTotalCost);
    await repositories.supplies.updateStockAndAverageCost(context.tenantId, parsed.data.itemId, stockAfter, averageCost);
    const movement = await repositories.inventoryMovements.insert({
      id: randomUUID(),
      tenantId: context.tenantId,
      itemType: "supply",
      itemId: parsed.data.itemId,
      movementType: "purchase",
      quantity: parsed.data.quantity,
      stockBefore,
      stockAfter,
      referenceType: "inventory-purchase",
      referenceId: randomUUID(),
      note: parsed.data.note
    });
    return reply.code(201).send(movement);
  });

  app.post("/v1/production-orders", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = productionOrderSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid production order payload", issues: parsed.error.issues });

    const result = await executeProductionOrder(context.tenantId, parsed.data);
    return reply.code(result.statusCode).send(result.body);
  });

  app.post("/v1/production-orders/from-recipe", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = productionFromRecipeSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid production from recipe payload", issues: parsed.error.issues });

    const recipe = await repositories.recipes.findByTenantAndId(context.tenantId, parsed.data.recipeId);
    if (!recipe) return reply.code(404).send({ error: "Recipe not found" });

    const scale = parsed.data.quantity / recipe.outputQuantity;
    const result = await executeProductionOrder(context.tenantId, {
      productId: recipe.productId,
      quantity: parsed.data.quantity,
      note: parsed.data.note,
      supplies: recipe.ingredients.map((ingredient) => ({
        supplyId: ingredient.supplyId,
        quantity: Math.round((ingredient.quantity * scale + Number.EPSILON) * 100) / 100
      }))
    });

    return reply.code(result.statusCode).send(result.body);
  });

  app.get("/v1/expenses", async (request) => repositories.expenses.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/expenses", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = expenseSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid expense payload", issues: parsed.error.issues });
    const created = await repositories.expenses.insert({ ...parsed.data, tenantId: context.tenantId });
    return reply.code(201).send(created);
  });
}
