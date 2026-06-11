# Operational CRUD Design

## Goal

Add the first operational management layer for Emprendedos: tenant-aware API endpoints and a React management view for products, supplies, sales, and expenses.

## Scope

This milestone keeps in-memory repositories and demo auth. It does not introduce PostgreSQL runtime persistence yet. The goal is to stabilize API contracts and management UX before wiring a database.

## API

The API exposes `/v1/products`, `/v1/supplies`, `/v1/sales`, and `/v1/expenses`.

Each resource supports:

- `GET`: list records scoped to the demo tenant.
- `POST`: validate input with Zod, attach the active tenant id, insert into the in-memory repository, and return the created record.

The API rejects invalid input with HTTP 400 and keeps tenant scoping inside route handlers and repositories.

## Web

The React app gains a navigation state in `App.tsx`. The dashboard remains the default "Mi negocio" view. Products, inventory, sales, and expenses render an operational panel with a compact form and table.

## Testing

API behavior is covered with Vitest route tests. Workspace typecheck and web build must pass.
