import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getConfig } from "../config.js";
import { schema } from "./schema.js";

export function createPostgresClient(databaseUrl = getConfig().databaseUrl) {
  const sql = postgres(databaseUrl, { max: 5 });
  const db = drizzle(sql, { schema });

  return {
    db,
    async close() {
      await sql.end();
    }
  };
}
