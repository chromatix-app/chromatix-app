# Copilot Instructions

## Project Overview

Chromatix is a desktop music player for Plex and Jellyfin, built as a React web app. It connects to self-hosted Plex/Jellyfin servers to browse and play music libraries. It runs as both a web app and an Electron desktop app.

## Tech Stack

- **React 18** (Vite 8) — UI framework
- **React Router v5** — Client-side routing
- **Rematch (Redux)** — Global state management
- **Sass (SCSS)** — Styling, with CSS Modules for component-scoped styles
- **TypeScript 6** — Used for utilities, hooks, config, and new files; legacy components are `.jsx`/`.js`
- **Tanstack Virtual** — Virtualised lists (artists, albums, tracks, queue)
- **Radix UI** — Accessible UI primitives (dialogs, dropdowns, popovers, selects)
- **Axios** — HTTP requests to Plex/Jellyfin APIs
- **Sonner** — Toast notifications
- **clsx** — Conditional class name composition
- **Vercel Analytics** — Usage and error tracking

## Project Structure

```
src/
  index.tsx              # App entry point
  CHANGELOG.md           # User-facing changelog
  css/
    _config/             # SCSS variables, mixins, typography, props
    base/                # Reset, fonts, grid, scrollbars, etc.
    styles.scss          # Master stylesheet (imports all partials)
  js/
    _config/             # App-wide config and static data
      config.ts          # Storage keys, encryption keys, global flags
      platformFeatures.ts # Feature flags per service (plex/jellyfin)
      routes.ts          # Route definitions (defaultRoutes / authRoutes)
      themes.ts          # Colour theme definitions
      whatsNew.ts        # "What's new" modal content
    app/                 # Root app components
      App.jsx            # Root component; layout, auth state, hooks
      BrowserRouteSwitch.jsx
      BrowserRouteValidate.jsx
      Modals.jsx         # Global modal registry
    components/          # Reusable UI components (each in own folder)
    hooks/               # Custom React hooks
    modals/              # Modal content components
    pages/               # Page-level components (one per route)
    services/            # API and playback services
      bridge.js          # Service-agnostic API bridge (Plex + Jellyfin)
      plexTools.js       # Plex API calls
      plexTranspose.js   # Plex API response normalisation
      jellyTools.js      # Jellyfin API calls
      jellyTranspose.js  # Jellyfin API response normalisation
      player.native.ts   # Audio playback (HTMLAudioElement)
    store/               # Rematch global state models
      store.ts           # Store initialisation
      models.app.js      # App state (init, login, errors)
      models.dialog.js   # Dialog/modal state
      models.persistent.js # State persisted to localStorage
      models.player.js   # Playback state and effects
      models.session.js  # Session state (user preferences, current server)
    utils/               # Pure TypeScript utility functions
  types/
    global.d.ts          # Global type declarations
lib/                     # Node scripts for image processing and SVG compression
public/                  # Static assets (served as-is; root index.html is the Vite entry)
index.html               # Vite entry point (at project root)
vite.config.ts           # Vite + Vitest configuration
vitest.setup.ts          # Vitest setup (wires HTMLAudioElement mock)
eslint.config.js         # ESLint 10 flat config
```

## Module Resolution

The `src/` directory is set as `baseUrl` in `tsconfig.json`, so imports use paths relative to `src/`:

```ts
import config from 'js/_config/config';
import { sortList } from 'js/utils';
import style from './Button.module.scss';
```

## State Management

State is managed with **Rematch** (a Redux wrapper). The store has five models:

- `appModel` — Initialisation, login status, server/library errors
- `dialogModel` — Alert and confirmation dialogs
- `persistentModel` — Navigation history; persisted to `localStorage`
- `playerModel` — Playback state and all player effects (play, pause, skip, queue, etc.)
- `sessionModel` — User preferences and current session data; partially persisted to `localStorage`

Access state in components via `useSelector`:

```js
const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
```

Dispatch actions via `useDispatch`:

```js
dispatch.playerModel.playerPlay();
```

## Services

All API calls go through `bridge.js`, which delegates to either `plexTools.js` or `jellyTools.js` based on the active service. Raw API responses are normalised into a consistent internal format by `plexTranspose.js` / `jellyTranspose.js` respectively.

The audio player is implemented in `player.native.ts` (using `HTMLAudioElement`). Playback management logic lives in `models.player.js` in the store.

The Plex API is entirely undocumented and reverse engineered. Plex API fields are explicitly excluded where not needed to reduce payload size.

## Routing

Routes are defined in `js/_config/routes.ts` as arrays of route objects:

- `defaultRoutes` — Routes shown when logged out
- `authRoutes` — Routes shown when logged in (redirects unauthenticated users)

Route components are resolved by string name and lazy-loaded via `BrowserRouteSwitch.jsx`.

## Components

Each component lives in its own folder under `src/js/components/` with a matching `.module.scss` file for styles:

```
components/
  Button/
    Button.jsx
    Button.module.scss
```

Components and hooks are barrel-exported from `components/index.js` and `hooks/index.js` respectively.

Use `clsx` for conditional class composition. Use CSS Modules for component-specific styles.

## TypeScript Migration

The codebase is partially migrated to TypeScript. New utilities and hooks should be written in TypeScript (`.ts`/`.tsx`). Existing `.js`/`.jsx` files do not need to be converted unless directly touched. The store models remain in JavaScript for now.

## Testing

Tests are colocated with the file they cover using the `.test.ts` suffix (e.g. `sortList.ts` / `sortList.test.ts`). All utility functions should have thorough tests. Follow the existing naming convention:

```ts
// Generated using GitHub Copilot

import functionName from './functionName';

describe('Testing "functionName" function', () => {
  test('Test description', () => { ... });
});
```

Vitest manual mocks for browser APIs unavailable in jsdom (e.g. `HTMLAudioElement`) live in `__mocks__/` at the root. The setup file is `vitest.setup.ts` at the project root.

Tests use **Vitest** with `globals: true` — no need to import `describe`, `test`, `expect`, `vi`, etc.

- Run tests in watch mode with `npm run test`
- Run all tests once with `npm run test:all`

## Key Scripts

- `npm start` / `npm run dev` — Start dev server (port 4000)
- `npm run build` — Production build (output to `build/`)
- `npm run lint` — Run ESLint
- `npm run lint:fix` — Run ESLint with auto-fix
- `npm run prettier` — Check formatting
- `npm run prettier:fix` — Auto-format all files
- `npm run typecheck` — Run TypeScript type check without emitting
- `npm run knip` — Dead code detection
- `npm run check` — Run knip, lint, prettier, and typecheck in sequence
- `npm run test` / `npm run test:all` — Run tests (watch / once)
- `npm run images:convert:new` — Convert new images to WebP
- `npm run images:tinify:new` — Compress new images via Tinify
- `npm run svg:compress` — Compress new SVGs

## Environment Variables

Set via `import.meta.env` (Vite convention, prefixed `VITE_`):

- `VITE_VERSION` — App version (injected from `package.json` at build time)
- `VITE_DATE` — Build timestamp (Unix seconds)
- `VITE_ENV` — Environment identifier (`local`, `preview`, `production`)

## Coding Conventions

- ESLint 10 (flat config at `eslint.config.js`), Prettier, and EditorConfig enforce code style
- `package.json` has `"type": "module"` — the project is ESM-native
- Husky + lint-staged run ESLint and Prettier checks on staged files at pre-commit; knip, typecheck, and tests also run pre-commit
- Knip is used for dead code detection — avoid unused exports, imports, and files
- Use `clsx` for all conditional class name composition (not string concatenation)
- Use CSS Modules for component-scoped styles; import as `style` and reference as `style.className`
- Use `getEnvironment()` from `js/utils` as the single source of truth for environment, browser, OS, and Electron info — do not access `import.meta.env` or `navigator` directly for these
- Use `getLocalStorage` / `setLocalStorage` from `js/utils` for all localStorage access
- Use `safeEncodeURIComponent` / `safeDecodeURIComponent` from `js/utils` rather than the native globals
- Section comments use a consistent three-line banner style — a divider, a title, then a closing divider:
  ```
  // ======================================================================
  // SECTION TITLE
  // ======================================================================
  ```
- SVG components use the Vite-native `?react` import suffix: `import FooIcon from './foo.svg?react'`
- Do **not** use Prettier as an ESLint plugin — run `npm run prettier` separately; `eslint-config-prettier` disables conflicting formatting rules

## Response Style

- Be concise and direct — prefer short answers unless complexity warrants detail
- Don't repeat back what the user said before answering
- Skip unnecessary preamble like "Great question!" or "Certainly!"
- Don't add summaries at the end of responses

## Maintaining These Instructions

These instructions are for AI agents (including Copilot). When you make changes to this project, keep this file up to date. If you introduce a new pattern, convention, component type, third-party integration, or architectural decision, update the relevant section or add a new one. Outdated guidance is worse than none.
