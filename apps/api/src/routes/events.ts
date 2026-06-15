import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { resolveRequestContext } from "../auth/context.js";
import { getRepositories } from "../db/store.js";

// Allowlist de eventos: evita que el endpoint se use para guardar cualquier cosa.
const ALLOWED_EVENTS = new Set([
  "calculator_used",
  "register_completed",
  "demo_opened",
  "dashboard_viewed",
  "weekly_capture_submitted",
  "quick_capture_enabled"
]);

const eventSchema = z.object({
  name: z.string().min(1).max(64),
  props: z.record(z.unknown()).optional()
});

export async function registerEventRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  // Instrumentacion. Auth opcional: hay eventos pre-auth (calculadora publica).
  app.post("/v1/events", async (request, reply) => {
    const parsed = eventSchema.safeParse(request.body);
    if (!parsed.success || !ALLOWED_EVENTS.has(parsed.data.name)) {
      return reply.code(400).send({ error: "Invalid event" });
    }

    let tenantId: string | null = null;
    try {
      tenantId = resolveRequestContext(request.headers).tenantId;
    } catch {
      tenantId = null;
    }

    await repositories.events.record({ tenantId, name: parsed.data.name, props: parsed.data.props ?? {} });
    return reply.code(202).send({ ok: true });
  });
}
