# Frontend Rules

## 1) Required stack
- React + Vite + TypeScript.
- React Router for route definitions and navigation.
- Zustand for client/UI state.
- React Hook Form for form state.
- Zod for form schema validation.
- `zodResolver` to connect Zod with React Hook Form.

## 2) Component placement
- Generic, reusable UI primitives belong in `src/shared/components/ui`.
- Business/domain components belong inside `src/features/<feature>/components`.
- Route containers for a domain belong in `src/features/<feature>/pages`.

## 3) Hooks and utilities
- Domain hooks live in `src/features/<feature>/hooks`.
- Generic hooks live in `src/shared/hooks`.
- Utilities must be small and explicit; keep domain-specific utilities inside the feature.

## 4) Validation and schemas
- Keep schemas close to usage, usually in `src/features/<feature>/schemas`.
- Shared schemas are allowed only if truly cross-domain and stable.
- Prefer one schema file per form or per entity when appropriate.
- Do not implement manual validation if Zod can handle it.
- Form UIs must render validation errors clearly.

## 5) React patterns
- Prefer composition over inheritance and deep abstraction.
- Avoid unnecessary `useEffect`; compute derived state directly when possible.
- Keep components focused; split when a file mixes unrelated responsibilities.

## 6) Routing
- Keep router setup in `src/app/router`.
- Feature routes should be imported from features, not authored in one giant route file.
- Use route-level code splitting for heavy sections.

## 7) inferred recommendation
OpenAPI includes many admin modules (security, catalog, sales, workers, cash).
Inferred recommendation: implement per-module layout shells and route guards to keep UX consistent and access control predictable.

## 8) visual design baseline
- Use a clean, modern, professional style suitable for admin/business apps.
- Purple is the primary accent color for primary actions, focus states, active navigation, links, and key highlights.
- Keep neutral backgrounds, subtle borders, soft shadows, and clear spacing hierarchy.
- Avoid noisy visual effects or flashy styling.
