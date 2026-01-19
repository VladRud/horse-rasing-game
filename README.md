# Horse Racing Game App

Frontend-only horse racing simulation built with Vue 3 + TypeScript. The app generates a 20-horse roster, schedules 6 rounds with fixed distances, animates race progress, supports pause/resume, and allows regenerating a session mid-run. All state is in-memory and deterministic under test conditions.

## Features

- Generate a 20-horse roster with randomized attributes
- Fixed 6-round program (1200m → 2200m)
- Auto-advance to the next round on finish
- Pause/resume mid-race
- Regenerate the session at any time
- Deterministic unit and E2E test coverage

## Tech Stack

- Vue 3.5 + TypeScript 5.9
- Pinia 3 (state management)
- Vite 7
- Tailwind CSS v4
- shadcn-vue (Reka UI) primitives
- Vitest (unit tests), Playwright (E2E)

## Project Structure

```
src/
  layout/            # App layout components
  modules/           # Domain modules (horses, race, session)
  shared/            # Shared UI, utils, composables, assets
  __tests__/         # Test helpers and fixtures
```

Module layout example:

```
src/modules/race/
  ui/                # Race UI components
  store/             # Pinia stores
  utils/             # Deterministic logic (e.g., schedule generation)
  composables/       # Animation and shared hooks
```

## Getting Started

```sh
npm install
npm run dev
```

## Build & Preview

```sh
npm run build
npm run preview
```

## Testing

```sh
npm run test:unit
npm run test:e2e
```

Notes:
- Playwright starts a local dev server on `127.0.0.1:5174` by default (see `playwright.config.ts`).
- E2E selectors use `data-aqa` attributes for stability.

## Lint & Format

```sh
npm run lint
npm run format
```

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
