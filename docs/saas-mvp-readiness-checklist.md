# Emprendedos SaaS MVP Readiness Checklist

Fecha: 2026-06-12

## Decision

No se agregan nuevas funcionalidades de producto hasta cerrar este checklist.

## Estado General

| Area | Estado | Evidencia requerida |
| --- | --- | --- |
| Arquitectura multi-tenant | Verificado | Tests de aislamiento tenant y revision de repositorios |
| Auth y contexto | Verificado | Token obligatorio para flujos productivos; fallback dev explicitado |
| Onboarding | Verificado | Progreso de activacion claro y estados vacios accionables |
| Demo | Verificado | Tenant demo reproducible y datos suficientes |
| Despliegue | Verificado | Runbook con variables, migraciones, seed y health check |
| Calidad | Verificado | test, typecheck, build y QA visual |
| Seguridad basica | Verificado | Sin tenantId confiado desde cliente en produccion |

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

- [x] `corepack pnpm test`
- [x] `corepack pnpm typecheck`
- [x] `corepack pnpm --filter @emprendedos/web build`
- [x] API en modo `memory` documentada y probada.
- [x] API en modo `postgres` documentada.
- [x] Login demo documentado.
- [x] Registro de nuevo emprendimiento probado por tests de auth.
- [x] Dashboard demo con datos utiles.
- [x] Operacion critica probada por tests de operaciones: crear producto, crear venta, revisar metricas.
- [x] QA desktop en dashboard, operaciones y onboarding.
- [x] QA mobile en dashboard, operaciones y onboarding.
- [x] Sin errores bloqueantes de consola en navegador.

## Evidencia De Verificacion

- `corepack pnpm test`: 20 archivos de test, 78 tests passing.
- `corepack pnpm typecheck`: web, api y domain passing.
- `corepack pnpm --filter @emprendedos/web build`: build Vite passing.
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3001/v1/health`: HTTP 200 con `{"ok":true,"service":"emprendedos-api"}`.
- Browser QA desktop: dashboard, Ventas, Inventario y Recetas sin paneles de error; exportaciones CSV visibles segun estado de datos.
- Browser QA mobile `390x844`: dashboard, Ventas, Inventario y Recetas sin paneles de error ni errores de consola; la navegacion horizontal movil conserva overflow esperado.

## Bitacora De Cierre

| Fecha | Commit | Resultado |
| --- | --- | --- |
| 2026-06-12 | 1549661 | Checklist creado |
| 2026-06-12 | d54c0e5 | Auth/contexto endurecido con fallback de desarrollo explicito |
| 2026-06-12 | 155c4b2 | Estado de activacion de onboarding clarificado |
| 2026-06-12 | 12493f6 | Demo flow, runbook y datos demo actualizados |
| 2026-06-12 | Este commit | QA final automatizado y navegador verificados |
