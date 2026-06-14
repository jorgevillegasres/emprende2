type Env = Partial<Record<string, string>>;

export function getConfig(env: Env = process.env) {
  const requestedDataStore = env.DATA_STORE === "postgres" ? "postgres" : "memory";
  const defaultWebOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];
  const webOrigins = env.WEB_ORIGIN
    ? env.WEB_ORIGIN.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : defaultWebOrigins;

  return {
    port: Number(env.API_PORT ?? 3001),
    host: env.API_HOST ?? "127.0.0.1",
    webOrigins,
    dataStore: requestedDataStore,
    databaseUrl: env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/emprendedos",
    authSecret: env.AUTH_SECRET ?? "dev-only-emprendedos-secret",
    demoAuthEmail: env.DEMO_AUTH_EMAIL ?? "demo@emprendedos.local",
    demoAuthPassword: env.DEMO_AUTH_PASSWORD ?? "emprendedos-demo",
    allowDevelopmentRequestContext: env.ALLOW_DEV_REQUEST_CONTEXT !== "false" && env.NODE_ENV !== "production",
    superAdminEmails: (env.SUPERADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  };
}
