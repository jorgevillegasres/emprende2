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

export async function registerOperationRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

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

  app.get("/v1/expenses", async (request) => repositories.expenses.listByTenant(resolveRequestContext(request.headers).tenantId));
  app.post("/v1/expenses", async (request, reply) => {
    const context = resolveRequestContext(request.headers);
    const parsed = expenseSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid expense payload", issues: parsed.error.issues });
    const created = await repositories.expenses.insert({ ...parsed.data, tenantId: context.tenantId });
    return reply.code(201).send(created);
  });
}
