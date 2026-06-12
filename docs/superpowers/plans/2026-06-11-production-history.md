# Production History Implementation Plan

## Steps

1. Add API tests for production order history from manual and recipe-driven production.
2. Add web client test for the production order list endpoint helper.
3. Add production order record types and repository methods.
4. Add in-memory and Postgres persistence.
5. Add Drizzle schema table and SQL migration.
6. Persist production order summaries inside the shared production helper.
7. Add `GET /v1/production-orders`.
8. Add web client types/helpers.
9. Show recent production lots on `Recetas`.
10. Run focused tests, full tests, typecheck, build, browser checks, and commit.
