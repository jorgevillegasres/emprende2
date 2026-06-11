# Operational CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-aware CRUD endpoints and a first React operational management view.

**Architecture:** Keep the current in-memory repository boundary. Add resource-specific route modules that validate input with Zod and attach the active tenant context. The web app uses a small API client and stateful views to list and create demo records.

**Tech Stack:** TypeScript, Fastify, Zod, Vitest, React, Vite, pnpm workspaces.

---

## Tasks

- [ ] Add API route tests for products, supplies, sales, and expenses.
- [ ] Implement generic repository insert/list behavior and Zod-validated resource routes.
- [ ] Register routes in the API app and verify tests/typecheck.
- [ ] Add web API client methods and an operational management component.
- [ ] Wire navigation in the shell and verify web build.
- [ ] Run full workspace verification and commit.
