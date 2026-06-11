# Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add login, signed auth tokens, and current-user context endpoints.

**Architecture:** Add focused auth modules for token signing and credential verification. Register `/v1/auth/login` and `/v1/auth/me`; make request context prefer bearer tokens before development headers.

**Tech Stack:** TypeScript, Fastify, Zod, Node crypto, Vitest.

---

## Tasks

- [ ] Add token signing/verifying tests.
- [ ] Implement HMAC signed auth tokens.
- [ ] Add auth route tests for login, invalid login, and `/me`.
- [ ] Implement auth routes and register them in the API app.
- [ ] Update request context to prefer bearer tokens.
- [ ] Document demo auth variables and run full verification.
