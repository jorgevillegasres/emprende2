import type { FastifyInstance } from "fastify";
import { z } from "zod";
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
    await repositories.products.updateStock(context.tenantId, parsed.data.productId, product.stock - parsed.data.quantity);
    return reply.code(201).send(created);
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
