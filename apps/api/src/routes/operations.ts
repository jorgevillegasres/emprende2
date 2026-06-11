import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDemoRequestContext } from "../auth/context.js";
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

  app.get("/v1/products", async () => repositories.products.listByTenant(getDemoRequestContext().tenantId));
  app.post("/v1/products", async (request, reply) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid product payload", issues: parsed.error.issues });
    const created = await repositories.products.insert({ ...parsed.data, tenantId: getDemoRequestContext().tenantId });
    return reply.code(201).send(created);
  });

  app.get("/v1/supplies", async () => repositories.supplies.listByTenant(getDemoRequestContext().tenantId));
  app.post("/v1/supplies", async (request, reply) => {
    const parsed = supplySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid supply payload", issues: parsed.error.issues });
    const created = await repositories.supplies.insert({ ...parsed.data, tenantId: getDemoRequestContext().tenantId });
    return reply.code(201).send(created);
  });

  app.get("/v1/sales", async () => repositories.sales.listByTenant(getDemoRequestContext().tenantId));
  app.post("/v1/sales", async (request, reply) => {
    const parsed = saleSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid sale payload", issues: parsed.error.issues });
    const created = await repositories.sales.insert({ ...parsed.data, tenantId: getDemoRequestContext().tenantId });
    return reply.code(201).send(created);
  });

  app.get("/v1/expenses", async () => repositories.expenses.listByTenant(getDemoRequestContext().tenantId));
  app.post("/v1/expenses", async (request, reply) => {
    const parsed = expenseSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid expense payload", issues: parsed.error.issues });
    const created = await repositories.expenses.insert({ ...parsed.data, tenantId: getDemoRequestContext().tenantId });
    return reply.code(201).send(created);
  });
}
