type Env = Partial<Record<string, string>>;

export function getConfig(env: Env = process.env) {
  const requestedDataStore = env.DATA_STORE === "postgres" ? "postgres" : "memory";

  return {
    port: Number(env.API_PORT ?? 3001),
    webOrigin: env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
    dataStore: requestedDataStore,
    databaseUrl: env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/emprendedos",
    authSecret: env.AUTH_SECRET ?? "dev-only-emprendedos-secret",
    demoAuthEmail: env.DEMO_AUTH_EMAIL ?? "demo@emprendedos.local",
    demoAuthPassword: env.DEMO_AUTH_PASSWORD ?? "emprendedos-demo"
  };
}
