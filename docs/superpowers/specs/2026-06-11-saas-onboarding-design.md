# SaaS Onboarding Design

## Objetivo

Permitir que un nuevo emprendedor cree su cuenta y su emprendimiento desde Emprendedos, reciba una sesion valida y entre directo al dashboard.

## Alcance

- Endpoint `POST /v1/auth/register`.
- Creacion atomica de tenant, usuario owner y membership.
- Hash de contrasena usando el mecanismo existente.
- Respuesta compatible con `AuthSession`: `token`, `userId`, `tenantId`, `role`.
- Prevencion de emails duplicados.
- Formulario frontend con dos modos: iniciar sesion y crear cuenta.

## Datos De Registro

- Nombre del emprendedor.
- Email.
- Contrasena.
- Nombre del emprendimiento.
- Tipo de negocio.
- Pais y moneda con valores por defecto `CO` y `COP`.

## Fuera De Alcance

- Billing.
- Invitaciones de equipo.
- Verificacion de email.
- Recuperacion de contrasena.
- Seleccion de multiples tenants.

## Experiencia

La pantalla de acceso conserva la marca actual. El formulario agrega un modo de registro enfocado en el primer logro del usuario: crear su espacio y llegar al dashboard sin pasos intermedios.
