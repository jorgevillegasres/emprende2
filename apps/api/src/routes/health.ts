import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/v1/health", async () => ({ ok: true, service: "emprendedos-api" }));
}
