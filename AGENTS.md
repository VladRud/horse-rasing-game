# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the Vue 3 app. Entry is `src/main.ts`, root layout is `src/App.vue`.
- `src/layout/` holds shared layout components (e.g., `header-bar/`, `GameLayout.vue`).
- `src/modules/` holds feature modules (`horses/`, `race/`, `session/`) with `ui/`, `store/`, `utils/`, and `composables/` subfolders.
- `src/shared/` contains UI primitives (`shared/ui/`), shared composables, utilities, and global styles (`shared/assets/main.css`).
- `src/__tests__/` contains test helpers and fixtures only.
- Unit tests are co-located next to modules/components as `*.spec.ts`; E2E tests live in `e2e/`.

## Build, Test, and Development Commands

- `npm install` installs dependencies (Node `^20.19.0 || >=22.12.0`).
- `npm run dev` starts the Vite dev server.
- `npm run build` runs `vue-tsc` and builds production assets.
- `npm run preview` serves the production build locally.
- `npm run type-check`, `npm run lint`, `npm run format` run TypeScript, ESLint, and Prettier.
- `npm run test:unit` runs Vitest; `npm run test:e2e` runs Playwright (`npx playwright install` once).

## Coding Style & Naming Conventions

- Indentation: 2 spaces, LF endings, trimmed whitespace (`.editorconfig`).
- Prettier: single quotes, no semicolons, print width 100 (`.prettierrc.json`).
- Use `<script setup lang="ts">` and the Composition API for Vue components.
- Component files use PascalCase (e.g., `Button.vue`); component folders use kebab-case (e.g., `race-track/`); test files use `.spec.ts`.

## Testing Guidelines

- Unit tests: Vitest in jsdom, colocated under module/component folders as `*.spec.ts`.
- E2E tests: Playwright specs under `e2e/` (e.g., `e2e/horse-racing.spec.ts`); use `data-aqa` attributes for stable selectors.

## Commit & Pull Request Guidelines

- Commit messages in history are descriptive, sentence-case summaries (often full sentences). Follow that style instead of conventional-commit prefixes.
- PRs should include a concise summary, tests run, and screenshots/GIFs for UI changes; link any relevant issues or spec updates.

## Architecture & Domain Rules

- Follow the layering rules in `CLAUDE.md`: UI renders only, Pinia stores own state changes, deterministic logic lives in module utils/composables, and shared helpers live in `src/shared/utils/`.

## Active Technologies

- TypeScript ~5.9, Vue 3.5, Pinia 3, Vite 7, Tailwind CSS v4, shadcn-vue (Reka UI)
- Vitest (unit), Playwright (E2E), in-memory only (no persistence)

## Recent Changes

- master: Refactored into module-based structure (`modules/`, `shared/`, `layout/`) with Pinia stores and colocated tests.
