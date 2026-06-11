import { createPostgresClient } from "./client.js";
import { seedPostgresDemoData } from "./postgres-seed.js";

const client = createPostgresClient();

try {
  await seedPostgresDemoData(client.db);
  console.log("Postgres demo data seeded.");
} finally {
  await client.close();
}
