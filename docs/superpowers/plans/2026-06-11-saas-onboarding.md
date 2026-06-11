# SaaS Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add self-service registration that creates a tenant, owner user, membership, and authenticated session.

**Architecture:** Extend the auth repository with `registerOwner`, reuse password hashing and token signing, then add frontend registration mode to the existing login screen. Keep the response shape identical to login.

**Tech Stack:** TypeScript, Fastify, Vitest, Drizzle ORM, React, Vite.

---

### Task 1: Backend Registration

**Files:**
- Modify: `apps/api/tests/auth-routes.test.ts`
- Modify: `apps/api/src/db/repositories.ts`
- Modify: `apps/api/src/db/postgres-repositories.ts`
- Modify: `apps/api/src/routes/auth.ts`

- [ ] Write a failing route test for `POST /v1/auth/register`.
- [ ] Run `corepack pnpm --filter @emprendedos/api test -- auth-routes.test.ts` and verify 404.
- [ ] Add repository support for tenant + owner registration.
- [ ] Add route validation and token response.
- [ ] Re-run focused API auth tests.

### Task 2: Frontend Registration

**Files:**
- Modify: `apps/web/src/api/client.ts`
- Modify: `apps/web/src/components/Login.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/src/api/client.test.ts`

- [ ] Add `RegisterPayload` and `registerOwner`.
- [ ] Add a registration mode to the login screen.
- [ ] Wire `onRegister` in `App.tsx` to persist session and load dashboard.
- [ ] Add focused client test for registration payload path.
- [ ] Run web tests and typecheck.

### Task 3: Verification

**Files:**
- All changed files.

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm --filter @emprendedos/web build`.
- [ ] Verify registration in browser when local API is running.
- [ ] Commit as `feat: add saas onboarding`.
