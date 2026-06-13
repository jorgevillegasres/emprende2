import { buildApp } from "./app.js";
import { getConfig } from "./config.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const config = getConfig();

if (config.dataStore === "postgres") {
  const migrationClient = postgres(config.databaseUrl, { max: 1 });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./drizzle",
  });
  await migrationClient.end();
}

const app = buildApp();

await app.listen({ port: config.port, host: config.host });
console.log(`Emprendedos API running on http://${config.host}:${config.port}`);
