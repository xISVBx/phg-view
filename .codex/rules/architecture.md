# Architecture Rules

## 1) Core architecture
- Use feature-based architecture under `src/features`.
- Keep `src/app` for bootstrap concerns only.
- Keep `src/shared` for business-agnostic reusable code only.
- Keep `src/pages` for route-level page composition only when a page spans multiple features.

## 2) Allowed top-level src structure
```text
src/
  app/
  shared/
  features/
  pages/
  assets/
  main.tsx
```

## 3) app responsibilities (strict)
`src/app` may contain only:
- `providers/`
- `router/`
- `store/` (minimal app-wide UI/session state)
- `styles/`

Do not place business domain code in `src/app`.

## 4) shared responsibilities (strict)
`src/shared` may contain only business-agnostic building blocks:
- UI primitives
- generic hooks
- utilities
- constants
- shared types
- low-level HTTP helpers

Do not place domain logic or resource-specific API modules in `src/shared`.

## 5) feature responsibilities (strict)
Each feature owns its domain logic and should keep API, state, UI, and schemas together.
Preferred internal structure:
```text
features/<feature-name>/
  api/
  components/
  hooks/
  store/
  schemas/
  types/
  pages/
```

## 6) prohibited patterns
- No Redux.
- No giant global `services` folder.
- No root-level `src/components`, `src/hooks`, or `src/services`.
- No one-file mega-modules.

## 7) inferred recommendation
From the OpenAPI surface, this project is a medium/large admin system.
Inferred recommendation: keep features aligned to backend resources/tags to reduce coupling and simplify parallel work.
