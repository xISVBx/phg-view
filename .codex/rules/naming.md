# Naming Rules

## 1) General principles
- Use explicit, predictable names.
- Prefer domain terms from OpenAPI resources and tags.
- Avoid vague names like `data`, `helpers`, `manager`, `commonStuff`.

## 2) Folder naming
- Feature folders: kebab-case aligned with domain (`work-orders`, `audit-logs`, `security-roles`).
- Internal feature folders: fixed names (`api`, `components`, `hooks`, `store`, `schemas`, `types`, `pages`).
- Shared folders: fixed names under `src/shared`.

## 3) File naming
- Components: `PascalCase.tsx` (example: `UsersTable.tsx`).
- Hooks: `useXxx.ts` (example: `useUsersFilters.ts`).
- Store files: `<feature>Store.ts` or `use<Feature>Store.ts` (pick one pattern and keep it consistent).
- API modules: `<resource>Api.ts` (example: `usersApi.ts`, `salesPaymentsApi.ts`).
- Schemas: `<entity>Schema.ts`.
- Types: `<entity>.types.ts` or `<entity>Types.ts` (pick one pattern and keep it consistent).

## 4) Route and page naming
- Route segments should mirror domain terms (`/users`, `/roles`, `/work-orders`).
- Page components should include intent (`UsersListPage`, `UserDetailsPage`, `EditRolePage`).

## 5) State/action naming
- Store actions should be verb-first (`setFilters`, `toggleSidebar`, `resetDraft`).
- Boolean state should read as booleans (`isOpen`, `isDirty`, `hasPermission`).

## 6) inferred recommendation
Because AI agents will extend this codebase, enforce one naming pattern per artifact type and avoid synonyms (`member` vs `user`, `item` vs `product`) unless backend terminology requires it.
