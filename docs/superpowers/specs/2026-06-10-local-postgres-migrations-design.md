# Local PostgreSQL Migrations Design

## Goal

Make the Postgres pathway runnable locally by adding Docker Compose, Drizzle migration scripts, and a versioned initial migration.

## Scope

This milestone does not force the app to run in Postgres mode by default. Developers can keep using `DATA_STORE=memory`, or opt into `DATA_STORE=postgres` after starting Docker and applying migrations.

## Design

- `docker-compose.yml` defines a local Postgres 16 service on `127.0.0.1:5432`.
- Root `package.json` exposes `db:generate` and `db:migrate` scripts.
- Drizzle migrations live under `apps/api/drizzle`.
- The runbook documents the exact local sequence.
