# Frontend Overview (Estado Actual)

Este documento explica cómo está armado el frontend actualmente, para que puedas ubicarte rápido y continuar sin perder contexto.

## 1. Stack y base

- React + Vite + TypeScript
- React Router
- Zustand (estado de sesión/UI)
- Axios (cliente HTTP)
- TailwindCSS
- React Hook Form + Zod (formularios)

## 2. Flujo de autenticación

### Login

Archivo principal:
- `src/features/auth/pages/login-page.tsx`

Componentes y lógica:
- `src/features/auth/components/login-form.tsx` (UI + RHF + Zod)
- `src/features/auth/schemas/login.schema.ts` (validación)
- `src/features/auth/api/login.ts` (llamada API)
- `src/features/auth/store/auth.store.ts` (estado de sesión)

Endpoint usado:
- `POST /api/v1/auth/login`

Qué guarda el store:
- `token` (access token)
- `refreshToken`
- `user` (si viene, o luego vía `me`)

### Me (perfil actual)

Endpoint:
- `GET /api/v1/auth/me`

Se usa para hidratar el usuario autenticado cuando no vino completo en login o al recargar sesión.

### Refresh automático con Axios

Archivo:
- `src/shared/lib/http.ts`

Cómo funciona:
1. Cada request agrega `Authorization: Bearer <token>` automáticamente.
2. Si una request responde `401`, Axios intenta `refreshSession()`.
3. `refreshSession()` llama `POST /api/v1/auth/refresh` con `refreshToken`.
4. Si refresh funciona, reintenta la request original una sola vez.
5. Si refresh falla, hace `logout()` y limpia sesión.

## 3. Router y layout privado

Archivo:
- `src/app/router/router.tsx`

Capas:
1. `ProtectedRoute`: valida que exista token y ejecuta hidratación de sesión.
2. `AppLayout`: layout compartido para TODAS las rutas privadas.
3. `Outlet`: renderiza la página del módulo activo dentro del layout.

Layout compartido:
- `src/app/layouts/app-layout.tsx`

Incluye:
- Sidebar elegante
- Menús/Submenús del usuario (vienen en `me.permissions`)
- Header de contexto actual
- Logout

## 4. Sidebar, rutas y qué es `workspace`

Archivo de mapeo:
- `src/app/router/navigation.ts`

Función clave:
- `resolveSubMenuPath(menuCode, subMenuCode)`

### Caso A: submenú conocido
Si el `subMenuCode` coincide con mapeos conocidos, navega a rutas reales, por ejemplo:
- `/users`
- `/roles`
- `/products`
- `/sales`
- etc.

### Caso B: submenú no mapeado
Si el código no está mapeado, usa fallback:
- `/workspace/:menuCode/:subMenuCode`

Eso es `workspace`: **una ruta comodín** para no romper navegación mientras aún no existe módulo específico. Te deja entrar y ver contexto/permisos sin bloquear al usuario.

Página fallback:
- `src/pages/workspace-page.tsx`

## 5. Módulos implementados realmente ahora
 
Ya están conectados con API real:

### Users
- Página: `src/features/security-users/pages/users-page.tsx`
- API: `src/features/security-users/api/users.ts`
- Esquemas: `src/features/security-users/schemas/*`
- Componentes: `src/features/security-users/components/*`

Incluye:
- Listado real (`GET /api/v1/users`)
- Filtros (RHF + Zod)
- Crear usuario (`POST /api/v1/users`)
- Tabla y diálogo de creación

### Roles
- Página: `src/features/security-roles/pages/roles-page.tsx`
- API: `src/features/security-roles/api/roles.ts`
- Esquemas: `src/features/security-roles/schemas/*`
- Componentes: `src/features/security-roles/components/*`

Incluye:
- Listado real (`GET /api/v1/roles`)
- Filtros (RHF + Zod)
- Crear rol (`POST /api/v1/roles`)
- Tabla y diálogo de creación

## 6. UI común reutilizable

Componentes base en:
- `src/shared/components/ui/`

Actualmente:
- `button.tsx`
- `input.tsx`
- `card.tsx`
- `dialog.tsx`
- `form-field.tsx`
- `table.tsx`
- `select.tsx` (custom, bonito, con buscador opcional y paginación local/servidor)

## 7. Convenciones para crear cosas nuevas

### Si creas un módulo nuevo
Usa esta estructura:
- `src/features/<feature>/api`
- `src/features/<feature>/components`
- `src/features/<feature>/schemas`
- `src/features/<feature>/types`
- `src/features/<feature>/pages`

### Si agregas formulario nuevo
Siempre:
1. Schema Zod en `schemas/`
2. RHF + `zodResolver`
3. Mostrar errores en UI
4. Evitar validación manual si Zod ya lo cubre

### Si quieres que aparezca en sidebar con ruta fija
1. Agregar mapeo en `src/app/router/navigation.ts` (`subMenuCode -> path`)
2. Asegurar que exista página en `features/.../pages`
3. Registrar ruta en `src/app/router/module-routes.tsx`

## 8. Dónde mirar cuando "algo no funciona"

- Error de auth/401: `src/shared/lib/http.ts` + `src/features/auth/store/auth.store.ts`
- Ruta que no abre: `src/app/router/navigation.ts` + `src/app/router/module-routes.tsx`
- Sidebar raro: `src/app/layouts/app-layout.tsx`
- Formulario con validación rara: schema Zod en `features/.../schemas`

## 9. Resumen corto

- `AppLayout` = marco visual global privado.
- `workspace` = fallback para submenús aún no mapeados.
- `module-routes` = rutas reales de módulos existentes.
- `navigation.resolveSubMenuPath` = traductor de `subMenuCode` a URL.
- Auth usa token + refresh token con interceptors Axios.
