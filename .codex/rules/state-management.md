# State Management Rules

## 1) State library
- Use Zustand.
- Do not use Redux.

## 2) Scope rules
- Prefer local component state first.
- Use feature-level Zustand stores when state is shared within a feature.
- Keep app-level global store minimal (`src/app/store`).

## 3) Store sizing
- Keep stores small and bounded by use case.
- Avoid one giant global store that aggregates all domains.
- Split stores by concern (filters, UI controls, draft forms, session UI state) when needed.

## 4) Server data handling
- Treat API responses as server state, not global UI state.
- Do not mirror full backend resources in Zustand by default.
- Persist only what improves UX (e.g., table filters, selected tabs, panel state).

## 5) Store design
- Use explicit action names.
- Keep selectors simple and colocated with usage.
- Avoid hidden side effects in setters.

## 6) inferred recommendation
OpenAPI suggests many independent modules.
Inferred recommendation: each feature should own its own store slice(s) rather than sharing cross-feature mutable state.
