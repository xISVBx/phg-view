# Frontend Agent Guide

This repository is a React + Vite + TypeScript frontend for an existing backend API.

## Scope and goals
- Build a maintainable admin/business frontend.
- Follow a feature-based architecture.
- Keep code generation predictable for AI agents.
- Keep complexity low and conventions explicit.

## Mandatory stack
- React
- Vite
- TypeScript
- React Router
- Zustand
- React Hook Form
- Zod

## Source of truth
- Backend contract: `http://localhost:8080/swagger/doc.json`.
- Use OpenAPI paths and tags as the primary source for API integration and feature boundaries.
- If UI requirements conflict with OpenAPI, OpenAPI wins unless explicitly overridden by a project decision note.

## API-derived domain map
Derived from OpenAPI tags and paths:
- `auth`: login, refresh, logout, me, permissions, password flows.
- `security`: users, roles, permissions, menus, submenus, user overrides.
- `catalog`: products, categories.
- `customers`: customer CRUD + activation.
- `sales`: sales and sale payments.
- `appointments`: appointment lifecycle.
- `work-orders`: work order lifecycle.
- `workers`: workers + payroll actions.
- `cash`: cash categories and movements.
- `files`: file listing, upload, download, delete.
- `settings`: system settings by key.
- `audit`: audit logs.
- `system`: health/info/backup status and run.

## Initial frontend feature map
API-derived features:
- `features/auth`
- `features/security-users`
- `features/security-roles`
- `features/security-navigation`
- `features/catalog-products`
- `features/catalog-categories`
- `features/customers`
- `features/sales`
- `features/appointments`
- `features/work-orders`
- `features/workers`
- `features/cash`
- `features/files`
- `features/settings`
- `features/audit-logs`
- `features/system`

Inferred recommendation (not directly a backend resource):
- `features/dashboard` for cross-module KPIs and shortcuts.

## Base folder tree to keep
```text
src/
  app/
    providers/
    router/
    store/
    styles/

  shared/
    components/
      ui/
    hooks/
    lib/
    utils/
    types/
    constants/

  features/
    auth/
    dashboard/
    users/

  pages/
  assets/
  main.tsx
```

## Architectural guardrails
- No Redux.
- No giant cross-cutting folders such as root-level `components/`, `hooks/`, or `services/`.
- Keep feature code inside its feature module.
- Keep shared code business-agnostic.
- Prefer explicit naming and small modules.

## Standard feature internals
Each feature should use only what it needs:
- `api/`
- `components/`
- `hooks/`
- `store/`
- `schemas/`
- `types/`
- `pages/`

## State policy
- Zustand is for client/UI state only.
- Server data should not be mirrored into a giant global store.
- Prefer local component state first, then feature Zustand store if state is shared across feature screens.

## Form and validation policy
- All forms must use React Hook Form + Zod.
- Use `zodResolver` for schema-based validation.
- Keep schemas close to features (for example `features/auth/schemas/login.schema.ts`).
- Avoid manual validation logic when Zod can express the rule.
- Show validation errors clearly in the UI.

## API policy
- Keep API clients close to feature ownership.
- Use typed request/response contracts.
- Keep transport DTOs separate from UI view models when transformations are needed.
- Avoid one global `services` layer.

## UI policy
- Build a polished, professional admin look.
- Purple is the brand accent and should be used consistently for primary actions and focus states.
- Keep backgrounds neutral with subtle borders/shadows and strong readability.

## Enforcement
Always apply rules in this order:
1. `rules/architecture.md`
2. `rules/frontend.md`
3. `rules/state-management.md`
4. `rules/api-integration.md`
5. `rules/naming.md`
