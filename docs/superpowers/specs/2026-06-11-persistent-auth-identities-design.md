# Persistent Auth Identities Design

## Objetivo

Mover el login de Emprendedos desde credenciales demo comparadas por configuracion hacia identidades persistidas por tenant. Este bloque prepara el producto para SaaS sin abrir todavia registro publico ni administracion completa de usuarios.

## Alcance

- Guardar `password_hash` en `users`.
- Usar hashing de contrasena con sal por usuario.
- Sembrar el usuario demo con hash, tenant y membership.
- Agregar un repositorio de autenticacion que encuentre usuario, tenant y rol por email.
- Hacer que `/v1/auth/login` valide contra el repositorio y emita el mismo token actual.
- Mantener el contrato de `/v1/auth/me` y el aislamiento por tenant existente.

## Decisiones

- El password hash sera `scrypt:<salt>:<hash>` usando `node:crypto`, suficiente para desarrollo serio sin introducir dependencias externas todavia.
- El primer membership del usuario sera usado como contexto de login. La seleccion de multiples emprendimientos queda fuera de este bloque.
- El modo memory y Postgres tendran el mismo contrato de repositorio.

## Fuera de alcance

- Registro publico de cuentas.
- Reset de contrasena.
- Invitaciones de equipo.
- MFA.
- Seleccion interactiva de tenant.

## Verificacion

La implementacion debe probar hashing/verify, login exitoso con usuario persistido, rechazo de password incorrecto y suite completa de API/web/domain.
