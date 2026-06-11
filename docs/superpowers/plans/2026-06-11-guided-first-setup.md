# Guided First Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a focused first-setup guide when a new tenant has no operational data.

**Architecture:** Add a pure helper that detects empty dashboard metrics, render an onboarding band in `Dashboard`, and pass section navigation from `App`. Reuse existing operations screens for data entry.

**Tech Stack:** React, TypeScript, Vitest, CSS.

---

### Task 1: Empty Business Detection

**Files:**
- Create: `apps/web/src/components/onboarding.ts`
- Create: `apps/web/src/components/onboarding.test.ts`

- [ ] Add `isNewBusiness(metrics)` for zero revenue, zero expenses, zero inventory and empty operational lists.
- [ ] Add Vitest coverage for empty and non-empty metrics.
- [ ] Run `corepack pnpm --filter @emprendedos/web test`.

### Task 2: Dashboard Onboarding Band

**Files:**
- Modify: `apps/web/src/components/Dashboard.tsx`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] Render the first-setup band only when `isNewBusiness(metrics)` is true.
- [ ] Add three action buttons that navigate to products, supplies and expenses.
- [ ] Style the band responsively with stable card dimensions.

### Task 3: Verification

**Files:**
- All changed files.

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm --filter @emprendedos/web build`.
- [ ] Verify in browser using a newly registered account or empty tenant.
- [ ] Commit as `feat: guide first setup`.
