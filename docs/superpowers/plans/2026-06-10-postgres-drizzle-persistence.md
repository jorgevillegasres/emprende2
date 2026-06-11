# PostgreSQL Drizzle Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostgreSQL/Drizzle persistence as a configurable API data store while preserving the current memory demo mode.

**Architecture:** Define Drizzle tables in `apps/api/src/db/schema.ts`, add a Postgres client/repository implementation, and route all API data access through a store selector. Tests keep using memory mode and verify configuration behavior.

**Tech Stack:** TypeScript, Fastify, Drizzle ORM, postgres-js, Zod, Vitest, pnpm.

---

## Tasks

- [ ] Add dependencies: `drizzle-orm`, `postgres`, and `drizzle-kit`.
- [ ] Extend API config with `dataStore` and `databaseUrl`.
- [ ] Replace schema placeholder with typed Drizzle schema.
- [ ] Add Postgres client and repository implementation.
- [ ] Update store selector to use memory by default and Postgres when configured.
- [ ] Add tests for config/store behavior.
- [ ] Update runbook with Postgres mode instructions.
- [ ] Run full workspace verification and commit.
