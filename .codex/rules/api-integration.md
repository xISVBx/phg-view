# API Integration Rules

## 1) Contract-first policy
- OpenAPI at `http://localhost:8080/swagger/doc.json` is the source of truth.
- Endpoints, payload shapes, and security requirements must follow the contract.

## 2) Module boundaries from API
Use OpenAPI tags/resources to define feature ownership:
- `auth`
- `security` (users, roles, permissions, menus, submenus, overrides)
- `catalog` (products, categories)
- `customers`
- `sales`
- `appointments`
- `work-orders`
- `workers`
- `cash`
- `files`
- `settings`
- `audit`
- `system`

## 3) API code placement
- Keep API calls close to consuming features in `src/features/<feature>/api`.
- Shared HTTP client helpers may live in `src/shared/lib`.
- Do not create one global `src/services` API layer.

## 4) Typing and models
- Use typed request/response contracts for every endpoint integration.
- Recommended: generate API types from OpenAPI and expose feature-local typed wrappers.
- Keep transport DTOs separate from UI/domain models when transformations are needed.

## 5) Auth and security handling
- Apply Bearer token handling centrally in shared HTTP transport.
- Keep auth session bootstrap in `src/app/providers` or `src/app/store`.
- Keep permission resolution close to auth/security features.

## 6) Error and response conventions
- Normalize API errors in shared transport helpers.
- Keep feature-specific mapping and messaging inside feature modules.
- Avoid leaking backend response envelopes directly into UI components.

## 7) inferred recommendation
Some endpoints expose action-style flows (`activate`, `deactivate`, `pay-salary`, `backup/run`).
Inferred recommendation: model these as explicit command functions (verbs) in feature APIs, not generic CRUD helpers.
