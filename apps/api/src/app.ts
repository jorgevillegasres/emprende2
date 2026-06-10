import cors from "@fastify/cors";
import Fastify from "fastify";
import { getConfig } from "./config.js";
import { registerHealthRoutes } from "./routes/health.js";

export function buildApp() {
  const app = Fastify({ logger: false });
  const config = getConfig();
  void app.register(cors, { origin: config.webOrigin });
  void app.register(registerHealthRoutes);
  return app;
}
