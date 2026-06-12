# Emprendedos Private Demo Deployment

Fecha: 2026-06-12

## Decision

La demo privada inicial se despliega con:

- Render: API Fastify y PostgreSQL administrado.
- Vercel: frontend React/Vite.
- GitHub: fuente central del codigo.

Esta ruta mantiene infraestructura simple y permite validar el SaaS con pocos emprendedores antes de agregar billing con Wompi.

## 1. Render PostgreSQL

Crear una base PostgreSQL administrada en Render.

Guardar estos valores:

- Internal Database URL: usarla como `DATABASE_URL` para la API en Render.
- External Database URL: reservarla solo para tareas administrativas locales si se necesita.

## 2. Render API

Crear un Web Service conectado al repositorio de GitHub.

Configuracion recomendada:

- Root Directory: dejar vacio.
- Runtime: Node.
- Build Command: `corepack enable && corepack pnpm install --frozen-lockfile && corepack pnpm --filter @emprendedos/api build`
- Start Command: `corepack pnpm --filter @emprendedos/api start`
- Health Check Path: `/v1/health`

Variables de entorno:

```bash
NODE_ENV=production
DATA_STORE=postgres
DATABASE_URL=<Render Internal Database URL>
API_HOST=0.0.0.0
API_PORT=3001
WEB_ORIGIN=<Vercel frontend URL>
AUTH_SECRET=<secret largo generado fuera del repo>
DEMO_AUTH_EMAIL=demo@emprendedos.local
DEMO_AUTH_PASSWORD=<password demo privado>
ALLOW_DEV_REQUEST_CONTEXT=false
```

Despues del primer deploy, ejecutar desde Render Shell o un job manual:

```bash
corepack pnpm db:migrate
corepack pnpm db:seed
```

Verificacion:

```bash
curl https://<render-api-url>/v1/health
```

Respuesta esperada:

```json
{"ok":true,"service":"emprendedos-api"}
```

## 3. Vercel Web

Crear un proyecto en Vercel conectado al mismo repositorio.

Configuracion recomendada:

- Framework Preset: Vite.
- Root Directory: `apps/web`
- Install Command: `corepack enable && corepack pnpm install --frozen-lockfile`
- Build Command: `corepack pnpm --filter @emprendedos/web build`
- Output Directory: `dist`

Variable de entorno:

```bash
VITE_API_BASE_URL=https://<render-api-url>
```

Luego volver a Render y actualizar:

```bash
WEB_ORIGIN=https://<vercel-frontend-url>
```

## 4. Demo Smoke Test

Antes de compartir la demo privada:

1. Abrir la URL de Vercel.
2. Iniciar sesion con el usuario demo.
3. Confirmar que el dashboard carga.
4. Abrir Inventario.
5. Abrir Recetas.
6. Registrar una venta de prueba.
7. Confirmar que el dashboard cambia.
8. Revisar que no existan errores de consola.

## 5. Production Safety Notes

- No subir secretos al repositorio.
- Mantener `ALLOW_DEV_REQUEST_CONTEXT=false` en Render.
- Usar `AUTH_SECRET` distinto al de `.env.example`.
- Usar `DATABASE_URL` interna de Render para la API.
- Mantener Postgres con backups habilitados antes de abrir beta.
- Wompi queda fuera de este despliegue inicial; se agrega cuando la demo privada este estable.

## References

- Render Node deploy docs: https://render.com/docs/deploy-node-express-app
- Render PostgreSQL docs: https://render.com/docs/databases
- Vercel Vite docs: https://vercel.com/docs/frameworks/vite
