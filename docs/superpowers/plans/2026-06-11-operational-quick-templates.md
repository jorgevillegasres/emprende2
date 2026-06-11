# Operational Quick Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable quick templates to operational capture forms.

**Architecture:** Keep templates in a pure frontend helper, test the template selection contract, and render template chips inside `Operations` that populate existing inputs without submitting.

**Tech Stack:** React, TypeScript, Vitest, CSS.

---

### Task 1: Template Data Helper

**Files:**
- Create: `apps/web/src/components/operationTemplates.ts`
- Create: `apps/web/src/components/operationTemplates.test.ts`

- [ ] Add templates for products, supplies and expenses.
- [ ] Return no templates for sales.
- [ ] Run focused web test.

### Task 2: Operations UI

**Files:**
- Modify: `apps/web/src/components/Operations.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] Render template chips in capture form when available.
- [ ] Fill matching inputs on click without saving.
- [ ] Style chips as compact editable suggestions.

### Task 3: Verification

**Files:**
- All changed files.

- [ ] Run `corepack pnpm test`.
- [ ] Run `corepack pnpm typecheck`.
- [ ] Run `corepack pnpm --filter @emprendedos/web build`.
- [ ] Verify in browser that a template fills a product form.
- [ ] Commit as `feat: add operational quick templates`.
