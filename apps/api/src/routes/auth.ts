import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getConfig } from "../config.js";
import { getDemoRequestContext, resolveRequestContext } from "../auth/context.js";
import { signAuthToken } from "../auth/tokens.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid login payload", issues: parsed.error.issues });

    const config = getConfig();
    if (parsed.data.email !== config.demoAuthEmail || parsed.data.password !== config.demoAuthPassword) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const context = getDemoRequestContext();
    const token = signAuthToken(context, { secret: config.authSecret });
    return { token, ...context };
  });

  app.get("/v1/auth/me", async (request) => resolveRequestContext(request.headers));
}
