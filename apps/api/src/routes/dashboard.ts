import { calculateDashboardMetrics } from "@emprendedos/domain";
import type { FastifyInstance } from "fastify";
import { resolveRequestContext } from "../auth/context.js";
import { getRepositories } from "../db/store.js";

// Resuelve la fecha de referencia para las metricas. Sin parametro usa hoy
// (mes en curso); con ?month=YYYY-MM usa el ultimo dia de ese mes para que el
// bucketing semanal y la proyeccion cubran el mes completo. No permite futuro.
function resolveReferenceDate(monthParam?: string): string {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const currentMonth = todayIso.slice(0, 7);

  if (!monthParam || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) || monthParam >= currentMonth) {
    return todayIso;
  }

  const [year, month] = monthParam.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthParam}-${String(lastDay).padStart(2, "0")}`;
}

export async function registerDashboardRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  app.get<{ Querystring: { month?: string } }>("/v1/dashboard", async (request) => {
    const context = resolveRequestContext(request.headers);
    const referenceDate = resolveReferenceDate(request.query.month);
    const [supplies, products, sales, expenses] = await Promise.all([
      repositories.supplies.listByTenant(context.tenantId),
      repositories.products.listByTenant(context.tenantId),
      repositories.sales.listByTenant(context.tenantId),
      repositories.expenses.listByTenant(context.tenantId)
    ]);

    return calculateDashboardMetrics({ supplies, products, sales, expenses }, referenceDate);
  });
}
