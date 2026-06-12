# Render/Vercel Private Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Emprendedos for a private production-like demo deployed from GitHub with Render for API/PostgreSQL and Vercel for the React frontend.

**Architecture:** Keep the current monorepo. Add a production API build path, make API host configurable for Render, and document the exact deployment commands and environment variables for API, database, and web.

**Tech Stack:** pnpm workspaces, TypeScript, Fastify, Drizzle, PostgreSQL, Vite, Render, Vercel.

---

### Task 1: API Build And Runtime Host

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Modify: `apps/api/src/config.ts`
- Modify: `apps/api/src/server.ts`
- Modify: `apps/api/tests/config.test.ts`

- [ ] **Step 1: Write failing config test**

Add expectations that `getConfig({})` exposes `host: "127.0.0.1"`, `getConfig({ API_HOST: "0.0.0.0" })` exposes `host: "0.0.0.0"`, and `.env.example` documents `API_HOST=127.0.0.1`.

- [ ] **Step 2: Run focused test**

Run: `corepack pnpm --filter @emprendedos/api test -- config.test.ts`

Expected: fail because `host` and `API_HOST` are not implemented.

- [ ] **Step 3: Implement build/runtime config**

Add `API_HOST` to config, use it in `server.ts`, create `tsconfig.build.json` that emits `dist`, and add `build: "tsc -p tsconfig.build.json"` to `apps/api/package.json`.

- [ ] **Step 4: Verify focused behavior**

Run: `corepack pnpm --filter @emprendedos/api test -- config.test.ts`

Expected: pass.

### Task 2: Deployment Documentation

**Files:**
- Create: `docs/deployment-render-vercel.md`
- Modify: `docs/saas-foundation-runbook.md`
- Modify: `README.md`

- [ ] **Step 1: Document Render API/Postgres**

Document build command, start command, health check, variables, migration command, and seed command.

- [ ] **Step 2: Document Vercel Web**

Document project root, build command, output directory, and `VITE_API_BASE_URL`.

- [ ] **Step 3: Link docs from runbook and README**

Add deployment doc references so the repo has one obvious path from local development to private demo.

### Task 3: Verification And Commit

**Files:**
- Modify: `docs/saas-mvp-readiness-checklist.md`

- [ ] **Step 1: Run full verification**

Run: `corepack pnpm verify:saas`

Expected: tests, typecheck, and web build pass.

- [ ] **Step 2: Run API production build**

Run: `corepack pnpm --filter @emprendedos/api build`

Expected: `apps/api/dist/server.js` is emitted.

- [ ] **Step 3: Update readiness evidence**

Update test counts if they changed and note that API production build is verified.

- [ ] **Step 4: Commit and push**

Commit message: `chore: prepare render vercel deployment`
