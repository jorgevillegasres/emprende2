import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getConfig } from "../config.js";
import { resolveRequestContext } from "../auth/context.js";
import { verifyPassword } from "../auth/passwords.js";
import { signAuthToken } from "../auth/tokens.js";
import { getRepositories } from "../db/store.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid login payload", issues: parsed.error.issues });

    const repositories = await getRepositories();
    const identity = await repositories.auth.findByEmail(parsed.data.email);
    const isValidPassword = identity ? await verifyPassword(parsed.data.password, identity.passwordHash) : false;

    if (!identity || !isValidPassword) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const config = getConfig();
    const context = {
      userId: identity.userId,
      tenantId: identity.tenantId,
      role: identity.role
    };
    const token = signAuthToken(context, { secret: config.authSecret });
    return { token, ...context };
  });

  app.get("/v1/auth/me", async (request) => resolveRequestContext(request.headers));
}
