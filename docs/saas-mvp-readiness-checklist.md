# Emprendedos SaaS MVP Readiness Checklist

Fecha: 2026-06-12

## Decision

No se agregan nuevas funcionalidades de producto hasta cerrar este checklist.

## Estado General

| Area | Estado | Evidencia requerida |
| --- | --- | --- |
| Arquitectura multi-tenant | En progreso | Tests de aislamiento tenant y revision de repositorios |
| Auth y contexto | En progreso | Token obligatorio para flujos productivos; fallback dev explicitado |
| Onboarding | En progreso | Progreso de activacion claro y estados vacios accionables |
| Demo | En progreso | Tenant demo reproducible y datos suficientes |
| Despliegue | En progreso | Runbook con variables, migraciones, seed y health check |
| Calidad | En progreso | test, typecheck, build y QA visual |
| Seguridad basica | En progreso | Sin tenantId confiado desde cliente en produccion |

## Congelamiento De Features

Quedan fuera de este cierre:

- Billing y Stripe.
- Reportes PDF avanzados.
- Integraciones externas.
- IA generativa.
- App movil nativa.
- Multi-bodega avanzado.
- Permisos granulares.
- Notificaciones.

## Gate De Release MVP

- [ ] `corepack pnpm test`
- [ ] `corepack pnpm typecheck`
- [ ] `corepack pnpm --filter @emprendedos/web build`
- [ ] API en modo `memory` documentada y probada.
- [ ] API en modo `postgres` documentada.
- [ ] Login demo documentado.
- [ ] Registro de nuevo emprendimiento probado.
- [ ] Dashboard demo con datos utiles.
- [ ] Operacion critica probada: crear producto, crear venta, revisar dashboard.
- [ ] QA desktop en dashboard, operaciones y onboarding.
- [ ] QA mobile en dashboard, operaciones y onboarding.
- [ ] Sin errores bloqueantes de consola en navegador.

## Bitacora De Cierre

| Fecha | Commit | Resultado |
| --- | --- | --- |
| 2026-06-12 | Registrar hash del commit de Task 1 | Checklist creado |
