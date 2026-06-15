import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getConfig } from "../config.js";
import { isSuperAdminEmail, resolveRequestContext } from "../auth/context.js";
import { hashPassword, verifyPassword } from "../auth/passwords.js";
import { signAuthToken } from "../auth/tokens.js";
import { getRepositories } from "../db/store.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  country: z.string().min(2).default("CO"),
  currency: z.string().min(3).default("COP")
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/v1/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid register payload", issues: parsed.error.issues });

    const repositories = await getRepositories();
    const existingIdentity = await repositories.auth.findByEmail(parsed.data.email);
    if (existingIdentity) return reply.code(409).send({ error: "Email already registered" });

    const identity = await repositories.auth.registerOwner({
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
    return signSession(identity);
  });

  app.post("/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid login payload", issues: parsed.error.issues });

    const repositories = await getRepositories();
    const identity = await repositories.auth.findByEmail(parsed.data.email);
    const isValidPassword = identity ? await verifyPassword(parsed.data.password, identity.passwordHash) : false;

    if (!identity || !isValidPassword) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    if (identity.suspended) {
      return reply.code(403).send({ error: "Cuenta suspendida. Contacta al administrador." });
    }

    return signSession(identity);
  });

  app.get("/v1/auth/me", async (request, reply) => {
    try {
      const context = resolveRequestContext(request.headers);
      const repositories = await getRepositories();
      const featureFlags = await repositories.tenantSettings.getFlags(context.tenantId);
      return { ...context, featureFlags };
    } catch {
      return reply.code(401).send({ error: "Authentication required" });
    }
  });

  // Acceso publico de demostracion: emite un token para el tenant demo
  // (datos de ejemplo sembrados). Sirve el boton "Ver demo" del landing.
  app.post("/v1/auth/demo", async () => {
    const demoContext = {
      userId: process.env.DEMO_OWNER_USER_ID ?? "00000000-0000-0000-0000-000000000001",
      tenantId: process.env.DEMO_TENANT_ID ?? "10000000-0000-0000-0000-000000000001",
      role: "owner" as const
    };
    const token = signAuthToken(demoContext, { secret: getConfig().authSecret });
    return { token, ...demoContext };
  });
}

function signSession(identity: { userId: string; tenantId: string; role: "owner" | "admin" | "operator" | "viewer"; email: string }) {
  const context = {
    userId: identity.userId,
    tenantId: identity.tenantId,
    role: identity.role,
    superAdmin: isSuperAdminEmail(identity.email)
  };
  const token = signAuthToken(context, { secret: getConfig().authSecret });
  return { token, ...context };
}

function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "emprendimiento"}-${randomUUID().slice(0, 8)}`;
}
