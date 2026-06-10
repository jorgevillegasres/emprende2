import { calculateDashboardMetrics } from "@emprendedos/domain";
import type { FastifyInstance } from "fastify";
import { getDemoRequestContext } from "../auth/context.js";
import { createSeededRepositories } from "../db/seed.js";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const repositories = await createSeededRepositories();

  app.get("/v1/dashboard", async () => {
    const context = getDemoRequestContext();
    const [supplies, products, sales, expenses] = await Promise.all([
      repositories.supplies.listByTenant(context.tenantId),
      repositories.products.listByTenant(context.tenantId),
      repositories.sales.listByTenant(context.tenantId),
      repositories.expenses.listByTenant(context.tenantId)
    ]);

    return calculateDashboardMetrics({ supplies, products, sales, expenses }, "2026-06-10");
  });
}
