# Web Auth Session Implementation Plan

## Estado

Implementado el 2026-06-11.

## Pasos

1. Agregar prueba del helper de encabezados autenticados en `apps/web/src/api/client.test.ts`.
2. Extender `apps/web/src/api/client.ts` con `AuthSession`, `login`, `getCurrentUser` y token opcional en dashboard/CRUD.
3. Crear `apps/web/src/components/Login.tsx` con formulario de acceso demo.
4. Actualizar `apps/web/src/App.tsx` para restaurar, validar, persistir y cerrar sesion.
5. Actualizar `apps/web/src/components/Operations.tsx` para leer y guardar recursos con token.
6. Actualizar `apps/web/src/components/Shell.tsx` para mostrar rol y salida.
7. Refinar estilos en `apps/web/src/styles.css`.
8. Verificar con pruebas, typecheck, build y login desde navegador local.

## Verificacion esperada

- `corepack pnpm --filter @emprendedos/web test`
- `corepack pnpm --filter @emprendedos/web typecheck`
- `corepack pnpm --filter @emprendedos/web build`
- `corepack pnpm test`
- `corepack pnpm typecheck`
- Login UI contra API local en `http://127.0.0.1:5173/`
