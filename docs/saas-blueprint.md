# Emprendedos SaaS Blueprint

Fecha: 2026-06-10

## Vision

Emprendedos es una plataforma SaaS para emprendedores que producen y venden productos fisicos de forma constante. Su promesa central es:

> Haz crecer tu emprendimiento con claridad.

El producto no compite como ERP tradicional. Su posicionamiento es una cabina de mando que ayuda a entender el negocio, controlar inventario, calcular costos reales y tomar decisiones semanales.

## Cliente Inicial

El cliente ideal inicial es un emprendimiento que ya vende de forma recurrente, pero opera con informacion dispersa en hojas de calculo, WhatsApp, cuadernos, memoria y extractos bancarios.

Dolores principales:

- Vende, pero no sabe cuanto gana realmente.
- No sabe si sus precios cubren costos, gastos y margen.
- Se queda sin insumos o producto terminado en momentos criticos.
- Tiene dinero atrapado en inventario sin visibilidad.
- Registra ventas y gastos tarde o de forma incompleta.
- Quiere crecer, pero primero necesita orden.

Segmentos compatibles:

- Cosmetica artesanal y productos naturales.
- Alimentos, reposteria y conservas.
- Velas, aromas y bienestar.
- Ropa, accesorios y pequenos talleres.
- Ceramica, decoracion y regalos.
- Kits o productos ensamblados.

## Propuesta De Valor

Emprendedos ayuda al usuario a responder rapidamente:

- Cuanto vendi este mes.
- Cuanto me queda despues del costo de producto.
- Que gastos estan presionando el negocio.
- Que productos dejan mas margen.
- Que debo producir, comprar o revisar esta semana.
- Cuanto dinero tengo en inventario.
- Que tan sano esta el negocio.

La aplicacion debe hablar en lenguaje de emprendedor, no de contador:

- "Tu negocio este mes".
- "Tus 3 decisiones de esta semana".
- "En que se va el gasto".
- "Lo que mas deja margen".
- "Ojo con esto".

## Producto MVP SaaS

La primera version SaaS debe incluir:

- Registro e inicio de sesion.
- Creacion de emprendimiento.
- Separacion de datos por emprendimiento.
- Dashboard Emprendedos.
- Productos.
- Insumos.
- Compras de insumos.
- Recetas o listas de materiales.
- Produccion por lotes.
- Ventas simples.
- Gastos.
- Alertas de stock bajo.
- Costos por promedio ponderado.
- Recomendaciones semanales.
- Exportacion CSV/Excel basica.
- Plantillas iniciales por tipo de emprendimiento.

Queda fuera del primer SaaS:

- Facturacion electronica.
- Pasarela de pago para ventas del emprendedor.
- Contabilidad formal.
- Integraciones marketplace.
- Inventario multi-bodega avanzado.
- Inteligencia artificial generativa.
- Aplicacion movil nativa.

## Modulos

### Onboarding

Objetivo: evitar una app vacia.

Flujo:

1. Crear cuenta.
2. Crear emprendimiento.
3. Elegir tipo de negocio.
4. Elegir moneda y pais.
5. Agregar productos iniciales.
6. Agregar insumos principales.
7. Elegir canales de venta.
8. Entrar al dashboard con una checklist de configuracion.

Plantillas sugeridas:

- Cosmetica y jabones.
- Reposteria y alimentos.
- Velas y aromas.
- Ropa y accesorios.
- Ceramica y decoracion.
- Otro producto fisico.

### Dashboard

Debe ser la pantalla principal y el producto emocional.

Bloques:

- Salud del negocio.
- Tus 3 decisiones de esta semana.
- Ventas del mes.
- Utilidad bruta.
- Margen promedio.
- Inventario valorizado.
- Gastos del mes.
- Resultado operativo.
- Ventas por semana.
- Gastos por categoria.
- Ranking por margen.
- Alertas.

### Inventario

Debe cubrir:

- Insumos.
- Producto terminado.
- Stock minimo.
- Lotes opcionales.
- Vencimientos opcionales.
- Valor de inventario.
- Movimientos de entrada y salida.

### Costos

Reglas iniciales:

- Costo promedio ponderado para insumos.
- Costo unitario de producto desde produccion.
- Margen estimado por producto.
- Margen real por venta usando costo vigente.

### Produccion

Debe permitir:

- Producto con receta.
- Producto sin receta.
- Consumo automatico propuesto.
- Ajuste de consumo real.
- Registro de lote.
- Costo de lote.
- Costo unitario.

### Ventas

Debe permitir:

- Registrar venta simple.
- Producto.
- Cantidad.
- Precio unitario.
- Canal.
- Fecha.
- Nota opcional.
- Descuento de stock.
- Ingreso, costo vendido y utilidad bruta.

### Gastos

Debe permitir:

- Categoria.
- Fecha.
- Descripcion.
- Monto.
- Resumen mensual.
- Ranking de categorias.

## Arquitectura Recomendada

### Enfoque

La arquitectura SaaS inicial debe ser multi-tenant con una sola aplicacion y una base de datos compartida, separando datos por `tenant_id`.

AWS SaaS Lens describe el aislamiento de tenant como un tema fundacional para SaaS: cada tenant debe estar impedido de acceder a recursos de otro tenant, y cruzar ese limite seria un evento grave para el negocio.

Referencia: https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/tenant-isolation.html

### Stack Recomendado

Frontend:

- React.
- TypeScript.
- Vite o Next.js.
- CSS modules o Tailwind con design tokens.
- Recharts o Tremor para graficas si se quiere acelerar.

Backend:

- Node.js.
- TypeScript.
- API REST o tRPC.
- Validacion con Zod.
- ORM: Prisma o Drizzle.

Base de datos:

- PostgreSQL.
- `tenant_id` en todas las tablas de negocio.
- Indices compuestos por `tenant_id`.
- Row-Level Security como defensa adicional.

Infraestructura inicial:

- Vercel, Render, Railway, Fly.io o AWS Amplify/App Runner.
- Base de datos administrada.
- Backups diarios.
- Logs centralizados.

Autenticacion:

- Auth.js, Clerk, Supabase Auth o Cognito.
- Sesion con usuario y tenant activo.
- Invitaciones a equipo.

Pagos:

- Stripe Billing para suscripciones.
- Stripe documenta suscripciones como pagos recurrentes para acceder a un producto e incluye manejo de ciclo de vida, trials, descuentos, facturacion y portal de autoservicio.

Referencia: https://docs.stripe.com/billing/subscriptions/overview

## Multi-Tenancy

### Entidades Principales

- `users`
- `tenants`
- `memberships`
- `products`
- `supplies`
- `purchases`
- `recipes`
- `recipe_items`
- `production_batches`
- `production_consumptions`
- `sales`
- `expenses`
- `inventory_movements`
- `dashboard_snapshots`

### Regla De Oro

Toda consulta de datos de negocio debe filtrarse por `tenant_id`.

Ejemplo conceptual:

```sql
SELECT *
FROM products
WHERE tenant_id = :current_tenant_id;
```

### Row-Level Security

PostgreSQL permite politicas de seguridad por fila que restringen que filas puede leer o modificar un usuario. La documentacion indica que, al habilitar RLS, el acceso normal a filas debe estar permitido por una politica; sin politica aplica default-deny.

Referencia: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

Estrategia:

- Todas las tablas de negocio incluyen `tenant_id`.
- La API establece el tenant activo en el contexto de la consulta.
- RLS valida que `tenant_id` coincida con el tenant autorizado.
- Las pruebas deben intentar acceso cruzado entre tenants.

## Seguridad

Riesgos principales:

- Acceso cruzado entre tenants.
- Broken Object Level Authorization.
- Usuarios editando recursos que no pertenecen a su emprendimiento.
- Exportaciones filtrando datos de otro tenant.
- Webhooks de pago mal validados.

OWASP API Security Top 10 2023 ubica Broken Object Level Authorization como API1, un riesgo critico cuando una API permite acceder a objetos manipulando identificadores.

Referencia: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/

Controles iniciales:

- Autorizacion por tenant en cada endpoint.
- Nunca confiar solo en ids del cliente.
- Middleware que resuelve `user_id`, `tenant_id` y rol.
- Validacion de input.
- Auditoria de movimientos criticos.
- Rate limiting basico.
- Logs de acceso.
- Pruebas de aislamiento.

## Roles

Primera version:

- Owner: administra emprendimiento, usuarios, plan y datos.
- Admin: gestiona operacion y reportes.
- Operador: registra compras, produccion, ventas y gastos.
- Lectura: ve dashboard y reportes.

No implementar permisos granulares al inicio. Basta con roles simples.

## Planes Comerciales

### Gratis / Trial

Objetivo: validar valor.

- 14 dias de prueba.
- Datos demo.
- 1 emprendimiento.
- 1 usuario.
- Limite de productos y movimientos.

### Emprendedor

Para negocios pequenos.

- 1 emprendimiento.
- 2 usuarios.
- Inventario, ventas, gastos, produccion.
- Exportacion basica.

### Crecimiento

Para negocios con equipo.

- 1 emprendimiento.
- Hasta 5 usuarios.
- Roles.
- Reportes avanzados.
- Plantillas.
- Alertas avanzadas.

### Pro

Futuro.

- Multi-sucursal.
- Integraciones.
- API.
- Soporte prioritario.

## Roadmap

### Fase 1: SaaS Foundation

- Convertir app a React/TypeScript.
- Backend API.
- PostgreSQL.
- Auth.
- Tenants y memberships.
- Migrar entidades actuales.
- Dashboard conectado a API.
- Seed demo.

### Fase 2: Producto Usable

- Onboarding.
- CRUD completo de productos e insumos.
- Compras.
- Produccion.
- Ventas.
- Gastos.
- Exportacion CSV.
- Dashboard con recomendaciones.

### Fase 3: Monetizacion

- Stripe Billing.
- Trials.
- Planes.
- Pantalla de billing.
- Limites por plan.
- Portal de autoservicio.

### Fase 4: Inteligencia De Crecimiento

- Reglas avanzadas de recomendaciones.
- Alertas configurables.
- Precio sugerido.
- Punto de equilibrio.
- Forecast simple de stock.
- Comparativo mensual.

### Fase 5: Escala

- Auditoria.
- Backups y restore.
- Observabilidad.
- Integraciones.
- Internacionalizacion.
- App movil o PWA avanzada.

## Modelo De Datos Inicial

### tenants

- id
- name
- slug
- business_type
- country
- currency
- created_at

### memberships

- id
- tenant_id
- user_id
- role
- created_at

### products

- id
- tenant_id
- name
- category
- unit
- stock
- min_stock
- unit_cost
- price
- lot
- expires_at
- created_at
- updated_at

### supplies

- id
- tenant_id
- name
- category
- unit
- stock
- min_stock
- average_cost
- lot
- expires_at
- created_at
- updated_at

### purchases

- id
- tenant_id
- supply_id
- supplier
- date
- quantity
- total_cost
- lot
- expires_at
- created_by

### sales

- id
- tenant_id
- product_id
- date
- quantity
- unit_price
- unit_cost
- revenue
- cost
- gross_profit
- channel
- note
- created_by

### expenses

- id
- tenant_id
- date
- category
- description
- amount
- created_by

### production_batches

- id
- tenant_id
- product_id
- date
- quantity_produced
- lot
- expires_at
- labor_cost
- direct_cost
- total_cost
- unit_cost
- created_by

## Principios De Producto

- Mostrar claridad antes que complejidad.
- Convertir datos en decisiones.
- Usar lenguaje humano.
- No exigir contabilidad formal.
- Empezar con pocos campos y permitir profundidad opcional.
- Hacer que el usuario sienta progreso en la primera sesion.

## Riesgos

- Intentar construir un ERP completo demasiado pronto.
- Sobrecomplicar permisos.
- Depender de recomendaciones sin suficiente data.
- No resolver bien onboarding.
- No aislar tenants correctamente.
- No definir limites de plan desde el inicio.

## Siguiente Paso Recomendado

Crear una nueva arquitectura de aplicacion SaaS en paralelo al prototipo actual:

1. Mantener el prototipo local como referencia visual y funcional.
2. Crear `apps/web` con React/TypeScript.
3. Crear `apps/api` con Node/TypeScript.
4. Crear `packages/domain` para reglas de negocio compartidas.
5. Crear PostgreSQL schema multi-tenant.
6. Migrar primero dashboard, productos, insumos, ventas y gastos.

Esto evita reescribir a ciegas y permite llevar la app actual hacia un producto profesional por etapas.
