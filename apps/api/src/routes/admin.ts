import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { requireSuperAdmin } from "../auth/context.js";
import { hashPassword } from "../auth/passwords.js";
import { getRepositories } from "../db/store.js";

const createUserSchema = z.object({
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessType: z.string().min(2).default("Productos fisicos"),
  country: z.string().min(2).default("CO"),
  currency: z.string().min(3).default("COP")
});

export async function registerAdminRoutes(app: FastifyInstance) {
  const repositories = await getRepositories();

  function ensureAdmin(request: FastifyRequest, reply: FastifyReply): boolean {
    try {
      requireSuperAdmin(request.headers);
      return true;
    } catch {
      reply.code(403).send({ error: "Acceso restringido a administradores" });
      return false;
    }
  }

  app.get("/v1/admin/accounts", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    return repositories.auth.listAccounts();
  });

  app.post("/v1/admin/users", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    const parsed = createUserSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Datos invalidos", issues: parsed.error.issues });

    const existing = await repositories.auth.findByEmail(parsed.data.email);
    if (existing) return reply.code(409).send({ error: "Ese correo ya esta registrado" });

    await repositories.auth.registerOwner({
      userId: randomUUID(),
      userName: parsed.data.ownerName,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      tenantId: randomUUID(),
      tenantName: parsed.data.businessName,
      tenantSlug: createSlug(parsed.data.businessName),
      businessType: parsed.data.businessType,
      country: parsed.data.country,
      currency: parsed.data.currency,
      role: "owner"
    });
    return reply.code(201).send({ ok: true });
  });

  app.post("/v1/admin/users/:userId/suspend", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    const { userId } = request.params as { userId: string };
    const ok = await repositories.auth.setSuspended(userId, true);
    if (!ok) return reply.code(404).send({ error: "Usuario no encontrado" });
    return { ok: true, suspended: true };
  });

  app.post("/v1/admin/users/:userId/reactivate", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    const { userId } = request.params as { userId: string };
    const ok = await repositories.auth.setSuspended(userId, false);
    if (!ok) return reply.code(404).send({ error: "Usuario no encontrado" });
    return { ok: true, suspended: false };
  });
}

function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "emprendimiento"}-${randomUUID().slice(0, 8)}`;
}
