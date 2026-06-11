import { calculateDashboardMetrics } from "@emprendedos/domain";
import type { FastifyInstance } from "fastify";
import { resolveRequestContext } from "../auth/context.js";
import { getRepositories } from "../db/store.js";

export async function registerDashboardRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  app.get("/v1/dashboard", async (request) => {
    const context = resolveRequestContext(request.headers);
    const [supplies, products, sales, expenses] = await Promise.all([
      repositories.supplies.listByTenant(context.tenantId),
      repositories.products.listByTenant(context.tenantId),
      repositories.sales.listByTenant(context.tenantId),
      repositories.expenses.listByTenant(context.tenantId)
    ]);

    return calculateDashboardMetrics({ supplies, products, sales, expenses }, "2026-06-10");
  });
}
