import { createSeededRepositories } from "./seed.js";
import { getConfig } from "../config.js";
import { createPostgresClient } from "./client.js";
import { createPostgresRepositories } from "./postgres-repositories.js";
import { seedPostgresDemoData } from "./postgres-seed.js";

const repositoriesPromise = createRepositories();

export function getRepositories() {
  return repositoriesPromise;
}

async function createRepositories() {
  const config = getConfig();
  if (config.dataStore === "postgres") {
    const { db } = createPostgresClient(config.databaseUrl);
    await seedPostgresDemoData(db);
    return createPostgresRepositories(db);
  }

  return createSeededRepositories();
}
