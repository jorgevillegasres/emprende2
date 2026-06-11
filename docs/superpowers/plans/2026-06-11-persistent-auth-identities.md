# Persistent Auth Identities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace config-only demo login with persisted user identities and password hashes.

**Architecture:** Add a password utility, extend repository contracts with an auth identity lookup, seed memory/Postgres with a hashed demo user, and update auth routes to validate through repositories. Tokens and request context stay unchanged.

**Tech Stack:** TypeScript, Fastify, Vitest, Drizzle ORM, PostgreSQL schema, Node `crypto.scrypt`.

---

### Task 1: Password Hashing

**Files:**
- Create: `apps/api/src/auth/passwords.ts`
- Create: `apps/api/tests/passwords.test.ts`

- [ ] Write a failing test that `hashPassword` does not return the raw password and `verifyPassword` accepts the right password.
- [ ] Run `corepack pnpm --filter @emprendedos/api test -- passwords.test.ts` and confirm the import/function failure.
- [ ] Implement `hashPassword` and `verifyPassword` using `node:crypto` scrypt with `scrypt:<salt>:<hash>`.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Auth Repository

**Files:**
- Modify: `apps/api/src/db/repositories.ts`
- Modify: `apps/api/src/db/seed.ts`
- Modify: `apps/api/src/db/postgres-repositories.ts`
- Modify: `apps/api/src/db/postgres-seed.ts`
- Modify: `apps/api/src/db/schema.ts`
- Create: `apps/api/drizzle/0002_users_password_hash.sql`

- [ ] Add `AuthIdentityRecord` and `AuthRepository` with `insert` and `findByEmail`.
- [ ] Seed memory demo identity with `hashPassword(config.demoAuthPassword)`.
- [ ] Add `passwordHash` to the Drizzle users table and SQL migration.
- [ ] Update Postgres seed to store the demo password hash.
- [ ] Update Postgres repository to join `users` and `memberships` for login identity.

### Task 3: Auth Route Integration

**Files:**
- Modify: `apps/api/src/routes/auth.ts`
- Modify: `apps/api/tests/auth-routes.test.ts`

- [ ] Add a failing route test proving invalid password is rejected through persisted identity.
- [ ] Update `/v1/auth/login` to load repositories, find identity by email, verify password, and sign token from identity.
- [ ] Keep `/v1/auth/me` behavior unchanged.
- [ ] Run API tests.

### Task 4: Verification and Commit

**Files:**
- All changed files above.

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm --filter @emprendedos/web build`.
- [ ] Commit as `feat: persist auth identities`.
