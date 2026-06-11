# PostgreSQL Drizzle Persistence Design

## Goal

Introduce a professional persistence layer for Emprendedos using PostgreSQL and Drizzle while keeping the current demo experience stable without a local database.

## Approach

The API gets a configurable data store mode:

- `DATA_STORE=memory`: current seeded in-memory repositories, used by default for tests and local demo.
- `DATA_STORE=postgres`: Drizzle repositories backed by PostgreSQL through `DATABASE_URL`.

This lets the application move toward production persistence without making every developer run Postgres immediately.

## Database Boundary

`apps/api/src/db/schema.ts` becomes the Drizzle schema source for tenants, users, memberships, products, supplies, sales, and expenses. `docs/database-schema.sql` remains the readable SQL draft and operational reference.

Repository interfaces remain stable: each resource exposes `insert(record)` and `listByTenant(tenantId)`. Routes do not know whether the data source is memory or Postgres.

## Testing

Automated tests run against memory mode. Additional tests cover config parsing and repository store selection so the Postgres pathway is wired without requiring a live database in CI/local.
