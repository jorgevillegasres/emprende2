# Emprendedos SaaS MVP Readiness Design

Fecha: 2026-06-12

## Decision

Congelar temporalmente nuevas funcionalidades de producto y enfocar el trabajo en dejar Emprendedos listo como SaaS MVP profesional. El objetivo no es agregar mas modulos, sino cerrar la base para que el producto pueda demostrarse, desplegarse y mantenerse con confianza.

## Contexto Actual

Emprendedos ya cuenta con una base SaaS funcional:

- Aplicacion web React/TypeScript en `apps/web`.
- API Node/TypeScript en `apps/api`.
- Reglas de negocio compartidas en `packages/domain`.
- Registro, login y sesion con token.
- Tenants, memberships y datos operativos asociados a tenant.
- Repositorios tenant-aware y pruebas de aislamiento.
- Persistencia en memoria para demo y PostgreSQL/Drizzle para entorno real.
- Dashboard con metricas, recomendaciones y plan de accion.
- Operaciones principales: productos, insumos, ventas, gastos, compras, ajustes, produccion, recetas y exportaciones CSV.
- Runbook de fundacion SaaS y blueprint de producto.

Esta base es suficiente para pasar de construccion de features a cierre de plataforma.

## Objetivo Del Cierre SaaS MVP

Al terminar este bloque, Emprendedos debe poder presentarse como un SaaS MVP para emprendedores, con una experiencia completa de punta a punta:

1. Un usuario crea o accede a su cuenta.
2. El sistema identifica su emprendimiento.
3. El usuario completa una configuracion inicial minima.
4. El dashboard muestra datos utiles o una ruta clara para obtenerlos.
5. El usuario registra operacion diaria.
6. Los datos quedan aislados por tenant.
7. El sistema puede ejecutarse localmente, probarse y prepararse para despliegue sin conocimiento tribal.

## Alcance Incluido

### 1. Readiness De Arquitectura

- Confirmar que las entidades de negocio usan `tenantId`.
- Revisar que endpoints operativos resuelvan tenant desde token o contexto validado.
- Reducir dependencias en headers de desarrollo para flujos productivos.
- Documentar claramente los modos `memory` y `postgres`.
- Alinear migraciones, schema y repositorios.

### 2. Readiness De Autenticacion Y Tenant

- Mantener roles simples: owner, admin, operator y viewer.
- Asegurar que `/auth/me` entregue usuario, tenant activo y rol.
- Validar que ningun flujo de negocio pueda operar sin tenant activo.
- Agregar pruebas donde falten accesos cruzados entre tenants.

### 3. Readiness De Onboarding

- Convertir el onboarding en una ruta de activacion clara, no solo una checklist visual.
- Definir criterios de negocio configurado:
  - emprendimiento creado,
  - moneda/pais/tipo de negocio,
  - al menos un producto o insumo,
  - primera venta, gasto o movimiento opcional segun avance.
- Mostrar estados vacios accionables en dashboard y operaciones.

### 4. Readiness Operativo

- Mantener las funciones actuales como scope final del MVP:
  - productos,
  - insumos,
  - ventas,
  - gastos,
  - compras/reposiciones,
  - ajustes,
  - produccion,
  - recetas,
  - dashboard,
  - plan de accion,
  - exportaciones CSV.
- Revisar consistencia de errores, cargas, estados vacios y botones deshabilitados.
- Evitar agregar reportes nuevos hasta cerrar plataforma.

### 5. Readiness De Demo

- Crear o consolidar un tenant demo con datos realistas.
- Documentar credenciales y flujo de demo.
- Asegurar que el dashboard inicial tenga suficientes datos para comunicar valor.
- Mantener el demo separado del flujo de registro real.

### 6. Readiness De Despliegue

- Completar `.env.example` y documentar variables obligatorias.
- Documentar comandos de migracion y seed.
- Verificar health check de API.
- Confirmar build de web y API.
- Definir checklist de release manual:
  - instalar dependencias,
  - migrar base,
  - seed opcional,
  - ejecutar tests,
  - ejecutar typecheck,
  - compilar web,
  - probar login,
  - probar dashboard,
  - probar una operacion critica.

### 7. Readiness De Calidad

- Mantener las pruebas existentes en verde.
- Cubrir brechas criticas:
  - aislamiento tenant,
  - auth,
  - operaciones principales,
  - calculos de margen,
  - inventario,
  - dashboard.
- Hacer QA responsive en dashboard, operaciones y onboarding.
- Revisar logs de consola en navegador.

### 8. Readiness De Seguridad Basica

- No confiar en `tenantId` enviado por el cliente para datos de negocio.
- Validar inputs relevantes en endpoints.
- Evitar errores que filtren informacion interna.
- Documentar limitaciones de auth demo y que falta para produccion real.
- Preparar camino para rate limiting y auditoria, sin implementarlos si no son bloqueantes del MVP.

## Fuera De Alcance Hasta Cerrar MVP SaaS

Quedan congelados como fases posteriores:

- Billing y Stripe.
- Planes pagos y limites por plan.
- Reportes PDF avanzados.
- Integraciones con marketplaces, facturacion electronica o contabilidad.
- IA generativa.
- App movil nativa.
- Multi-bodega avanzado.
- Permisos granulares.
- Notificaciones por email o WhatsApp.

## Criterios De Listo

El bloque se considera terminado cuando:

- `corepack pnpm test` pasa completo.
- `corepack pnpm typecheck` pasa completo.
- `corepack pnpm --filter @emprendedos/web build` pasa.
- La API puede correr en modo memory y postgres documentado.
- Existe un flujo demo reproducible.
- Existe un checklist de despliegue actualizado.
- Las vistas principales no tienen errores de consola bloqueantes.
- Dashboard, onboarding y operaciones funcionan en desktop y mobile.
- No hay feature nueva pendiente dentro del cierre SaaS MVP.

## Enfoque De Implementacion

La implementacion debe hacerse en fases cortas:

1. Auditoria tecnica y checklist de brechas.
2. Cierre de auth/tenant/contexto.
3. Cierre de onboarding y estados vacios.
4. Cierre de demo data y runbook.
5. QA, build, pruebas y limpieza final.

Cada fase debe terminar con verificacion y commit. Si aparece una idea nueva de producto, se documenta en backlog, pero no se implementa dentro de este bloque.

## Riesgos

- Seguir agregando features y no cerrar el producto.
- Subestimar aislamiento multi-tenant.
- Tener demo atractiva pero despliegue fragil.
- Mezclar headers de desarrollo con auth real.
- No documentar comandos y variables necesarias.

## Decision De Producto

Emprendedos no necesita mas funcionalidades para parecer mas grande. Necesita sentirse confiable, claro y listo para que otro emprendedor lo use sin que estemos al lado explicandolo. Ese sera el foco hasta cerrar el SaaS MVP.
