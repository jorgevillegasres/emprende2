# Local PostgreSQL Migrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local Postgres infrastructure and the first Drizzle migration for the SaaS persistence layer.

**Architecture:** Keep Postgres optional. Docker Compose provides local infrastructure, Drizzle owns migrations, and the API selects Postgres only when `DATA_STORE=postgres`.

**Tech Stack:** Docker Compose, PostgreSQL 16, Drizzle Kit, TypeScript, pnpm.

---

## Tasks

- [ ] Create `docker-compose.yml` with a local Postgres service and named volume.
- [ ] Add root scripts for Drizzle migration generation and migration execution.
- [ ] Generate and version the first Drizzle migration.
- [ ] Update runbook with local Postgres commands.
- [ ] Run tests, typecheck, web build, and Drizzle generation check.
