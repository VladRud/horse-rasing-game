# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-quality Vue 3 + TypeScript + Vite horse racing game. Uses Tailwind CSS v4 with custom theming, shadcn-vue (Reka UI) for UI primitives, and **Pinia** for state management. The codebase is organized by domain modules under `src/modules/` with shared utilities and UI primitives under `src/shared/`.

**Critical:** This is a **production-quality frontend system**, not a demo or prototype. It demonstrates scalable frontend architecture, clean separation of concerns, deterministic simulation, and testable code.

## Commands

### Development

```sh
npm run dev          # Start dev server
npm run build        # Type-check and build for production
npm run preview      # Preview production build
```

### Testing

```sh
npm run test:unit    # Run Vitest unit tests (jsdom environment)
npm run test:e2e     # Run Playwright e2e tests (all browsers)
npm run test:e2e -- --project=chromium  # Run e2e tests on specific browser
npx playwright install                  # Install browsers (first time only)
```

### Code Quality

```sh
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run type-check   # Run vue-tsc type checking
```

## Game Rules (Immutable)

**Do not change these rules unless explicitly instructed:**

### Horses

- **20 total horses** in the game
- Each horse has: `id`, `name`, `color` (may repeat), `condition` (1-100)

### Race Structure

- **6 rounds** per game (sequential execution only)
- Each round: 10 random horses selected from the 20
- Distances per round: 1200m (R1), 1400m (R2), 1600m (R3), 1800m (R4), 2000m (R5), 2200m (R6)
- **One round at a time** - no skipping, rewinding, or parallel execution
- Results revealed only after round completion

## Architectural Requirements

**CRITICAL: These principles are mandatory for all code changes.**

### Separation of Concerns

1. **UI Components** (`src/modules/*/ui/`, `src/layout/`) - Render data only, no business logic
2. **Pinia Stores** (`src/modules/*/store/`) - State management and lifecycle control
3. **Deterministic Logic** (`src/modules/*/utils/`, `src/modules/*/composables/`) - Pure domain logic and animation drivers
4. **Shared Helpers** (`src/shared/utils/`, `src/shared/composables/`) - Stateless utilities used across modules

### Directory Structure

```
src/
  layout/
    header-bar/
    GameLayout.vue
  modules/
    horses/
      ui/
      store/
      horses.const.ts
      horses.types.ts
    race/
      ui/
      store/
      composables/
      utils/
      races.const.ts
      races.types.ts
    session/
      ui/
      store/
      session.types.ts
  shared/
    ui/
    composables/
    utils/
    assets/
  __tests__/
    helpers/
    fixtures/
```

**Constraints:**

- No UI code in deterministic logic layers
- No DOM access in Pinia stores
- No direct state mutation outside Pinia stores
- No race logic in UI components

### State Management (Pinia)

**Horses Store:**

- State: `horses: Horse[]`, `allHorsesMap`
- Responsibilities: Generate horses, provide lookup helpers

**Races Store:**

- State: `rounds: RaceRound[]`, `currentRoundIndex`
- Responsibilities: Generate schedule, manage round lifecycle, update results

**Session Store:**

- State: `sessionStatus: idle | initialized | completed`
- Responsibilities: Initialize session, regenerate, complete session

## Deterministic Logic & Animation

- Schedule generation lives in `src/modules/race/utils/race-generator/`.
- Race animation logic lives in `src/modules/race/composables/use-race-animation/`.
- UI only renders progress and results; it never calculates winners or timing.
- Determinism is required for tests; production randomness remains non-seeded.

## AI Agent Constraints

When working in this codebase:

- **Do NOT** mix UI and business logic
- **Do NOT** bypass Pinia for state changes
- **Do NOT** mutate state directly outside stores
- **Do NOT** add race logic to components
- Decompose by architectural layer, not by UI feature
- Implement logic before UI
- Prefer small, composable functions

## Technical Architecture

### Current Project Structure

- `src/main.ts` - Application entry point, mounts Vue app and Pinia, loads global CSS
- `src/App.vue` - Root component assembling the layout
- `src/layout/` - Layout components
- `src/modules/` - Domain modules (horses, race, session)
- `src/shared/ui/` - shadcn-vue UI primitives
- `src/shared/utils/utils.ts` - Shared utilities (contains `cn()`)
- `src/shared/assets/main.css` - Global Tailwind styles and theme
- `src/__tests__/` - Test helpers and fixtures

### Path Aliases

Import resolution configured in both `vite.config.ts` and `tsconfig.json`:

- `@/` maps to `src/`

Example: `import { cn } from '@/shared/utils/utils'`

### Styling Approach

**Tailwind CSS v4** with inline theme configuration in `shared/assets/main.css`:

- Custom CSS variables for theming (light/dark mode)
- Uses OKLCH color space for all theme colors
- Dark mode via `.dark` class selector (configured with `@custom-variant`)
- Animation utilities from `tw-animate-css` package

### UI Components

Components use **Reka UI** (headless component library) for accessible primitives:

- UI primitives live in `src/shared/ui/`
- Use `cn()` from `src/shared/utils/utils.ts`
- Component folders are kebab-case; files are PascalCase

### Testing Configuration

**Unit Tests (Vitest):**

- Environment: `jsdom`
- Config: `vitest.config.ts` (extends `vite.config.ts`)
- Test files: co-located `*.spec.ts` under `src/modules/**`, `src/layout/**`, `src/shared/**`
- Test helpers and fixtures: `src/__tests__/`

**E2E Tests (Playwright):**

- Config: `playwright.config.ts`
- Test directory: `e2e/`
- Browsers: chromium, firefox, webkit
- Local web server runs on `127.0.0.1:5174` (per Playwright config)
- Use `data-aqa` attributes for stable selectors

### TypeScript Configuration

Project uses TypeScript project references:

- `tsconfig.json` - Base config with path mappings
- `tsconfig.app.json` - Application source code
- `tsconfig.node.json` - Build tooling (Vite, config files)
- `tsconfig.vitest.json` - Test files

Use `vue-tsc` (not `tsc`) for type checking `.vue` files.

### ESLint Configuration

Flat config format (`eslint.config.ts`):

- Vue 3 essential rules + TypeScript support
- Playwright rules for `e2e/**` files
- Vitest rules for test files
- Prettier formatting handled separately (skip formatting rule enabled)
- `vue/multi-word-component-names` disabled

## Development Notes

- **Node.js requirement:** `^20.19.0 || >=22.12.0`
- Playwright starts a local dev server on port `5174` for E2E tests
- Use `data-aqa` attributes for E2E selectors (avoid `data-slot` or text-only selectors)
