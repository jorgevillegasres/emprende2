import { createSeededRepositories } from "./seed.js";

const repositoriesPromise = createSeededRepositories();

export function getRepositories() {
  return repositoriesPromise;
}
