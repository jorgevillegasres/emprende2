import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { resolveRequestContext } from "../auth/context.js";
import { getRepositories } from "../db/store.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const weeklyCaptureSchema = z.object({
  periodStart: z.string().regex(datePattern),
  periodEnd: z.string().regex(datePattern),
  revenue: z.number().nonnegative(),
  cashOut: z.number().nonnegative(),
  note: z.string().max(240).optional()
});

const flagsSchema = z.object({
  quickCapture: z.boolean().optional()
});

export async function registerCaptureRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  // Auto-servicio: el tenant activa/desactiva la captura rapida (opt-in).
  app.post("/v1/tenant/flags", async (request, reply) => {
    let context;
    try {
      context = resolveRequestContext(request.headers);
    } catch {
      return reply.code(401).send({ error: "Authentication required" });
    }
    const parsed = flagsSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid flags" });

    const flags = await repositories.tenantSettings.setFlags(context.tenantId, parsed.data);
    return { featureFlags: flags };
  });

  // Captura semanal gruesa. Gateada por el flag quickCapture: si el tenant no
  // la activo, el endpoint no existe para el.
  app.post("/v1/capture/weekly", async (request, reply) => {
    let context;
    try {
      context = resolveRequestContext(request.headers);
    } catch {
      return reply.code(401).send({ error: "Authentication required" });
    }

    const flags = await repositories.tenantSettings.getFlags(context.tenantId);
    if (!flags.quickCapture) return reply.code(403).send({ error: "Quick capture is not enabled" });

    const parsed = weeklyCaptureSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid capture" });

    const created = await repositories.aggregateEntries.insert({
      tenantId: context.tenantId,
      id: randomUUID(),
      periodStart: parsed.data.periodStart,
      periodEnd: parsed.data.periodEnd,
      revenue: parsed.data.revenue,
      cashOut: parsed.data.cashOut,
      note: parsed.data.note ?? ""
    });

    await repositories.events.record({
      tenantId: context.tenantId,
      name: "weekly_capture_submitted",
      props: { revenue: parsed.data.revenue, cashOut: parsed.data.cashOut }
    });

    return created;
  });
}
