# Emprendedos Web Auth Session Design

## Objetivo

Conectar el frontend de Emprendedos con la base de autenticacion ya disponible en la API. El primer resultado esperado es que un emprendedor vea una pantalla de acceso, inicie sesion con credenciales demo, mantenga su token en el navegador y consulte dashboard/operaciones enviando `Authorization: Bearer <token>`.

## Alcance

- Pantalla inicial de login con marca Emprendedos y credenciales demo precargadas.
- Persistencia de sesion en `localStorage` para mantener el acceso despues de recargar.
- Validacion de sesion al abrir la app usando `/v1/auth/me`.
- Cierre de sesion desde el topbar.
- Envio del token en dashboard, productos, insumos, ventas y gastos.

## Fuera de alcance

- Registro publico de nuevos emprendedores.
- Recuperacion de contrasena.
- Roles avanzados o permisos granulares.
- Pantalla de seleccion de tenant.

## Flujo

1. La app busca una sesion guardada en `localStorage`.
2. Si existe token, lo valida contra `/v1/auth/me`.
3. Si la sesion es valida, carga el dashboard con el token.
4. Si no hay sesion o el token expiro, muestra login.
5. Al iniciar sesion, guarda la respuesta de `/v1/auth/login` y carga el dashboard.
6. Al cerrar sesion, borra almacenamiento local y vuelve al login.

## Pruebas

La unidad critica es el cliente API: debe producir encabezados vacios cuando no hay token y `Authorization: Bearer <token>` cuando si existe. La verificacion adicional cubre typecheck, build y login real desde navegador local.
