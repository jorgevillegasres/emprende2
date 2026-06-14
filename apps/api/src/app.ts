import cors from "@fastify/cors";
import Fastify from "fastify";
import { getConfig } from "./config.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerOperationRoutes } from "./routes/operations.js";

export function buildApp() {
  const app = Fastify({ logger: false });
  const config = getConfig();
  void app.register(cors, { origin: config.webOrigins });
  void app.register(registerAuthRoutes);
  void app.register(registerHealthRoutes);
  void app.register(registerDashboardRoutes);
  void app.register(registerOperationRoutes);
  void app.register(registerAdminRoutes);
  return app;
}
