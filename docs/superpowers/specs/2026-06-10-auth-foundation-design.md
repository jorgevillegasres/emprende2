# Auth Foundation Design

## Goal

Add the first authentication layer for Emprendedos: login, signed tokens, and a `/v1/auth/me` endpoint.

## Scope

This milestone keeps demo credentials configurable through environment variables. It does not implement password reset, invitations, refresh tokens, or database-backed user credentials yet.

## Design

- `POST /v1/auth/login` accepts email and password.
- Valid demo credentials return a signed bearer token and current user context.
- `GET /v1/auth/me` resolves the current user from bearer token, development headers, or demo fallback.
- Business routes continue working without frontend login, but they now can resolve tenant context from signed tokens.

## Security Notes

Tokens are HMAC-signed with `AUTH_SECRET`. This is suitable as a development foundation. Production auth must store password hashes in Postgres and verify tenant memberships server-side.
