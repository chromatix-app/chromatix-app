# Agent Instructions

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
- **dash.js** — DASH manifest playback for Plex transcoded tracks

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
      devThemes.ts       # Edge-case themes for /dev/components and the colour audit
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
      player.ts          # Player router — dispatches to native or DASH player
      player.native.ts   # Native audio playback (HTMLAudioElement)
      player.dash.ts     # DASH playback via dash.js (Plex transcoded tracks)
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

The audio player has three layers: `player.ts` is the router that selects the active backend; `player.native.ts` handles native `HTMLAudioElement` playback (MP3, FLAC, AAC, Ogg, and Jellyfin transcoded streams); `player.dash.ts` handles DASH playback via dash.js (used for Plex tracks whose codec requires transcoding, e.g. WMA, FLAC on unsupported browsers). Playback management logic (queue, skip, shuffle, repeat) lives in `models.player.js` in the store.

The Plex API is entirely undocumented and reverse engineered. Plex API fields are explicitly excluded where not needed to reduce payload size.

Jellyfin requests authenticate with the standard `Authorization: MediaBrowser …` header, built by the `getJellyAuthHeader` util (via `getRequestHeaders` in `jellyTools.js`). Never use the legacy `X-Emby-*` headers: newer servers ignore them and Jellyfin 12.0 removes them, which breaks login. The header's `DeviceId` is a random per-install ID from `getEnvironment()`, kept in localStorage (and kept on logout), since Jellyfin logs out a user's other sessions that share a device ID. Audio elements can't send headers, so stream URLs carry the token as `ApiKey`, plus the legacy `api_key` for older servers. `jellyTranspose` builds them without a token, since the play queue is saved to localStorage and restored on login; `withPlaybackSrc` in `models.player.js` adds the current token when a track loads, via the `getJellyStreamSrc` util (and builds Plex's `dashSrc` the same way, via `getDashSrc`), so a saved queue never plays with a stale token. Any new token-bearing URL parameter must also be added to `REDACTED_PARAMS` there.

Never send the server access token over plain `http` while an `https` route might work — `getBestConnection` in `plexTools.js` races every `https` address (local, remote, then relay, staggered via the `raceStaggered` util) and only tries `http` addresses once all of them have failed. Keep this guarantee when changing how connections are chosen.

## Routing

Routes are defined in `js/_config/routes.ts` as arrays of route objects:

- `defaultRoutes` — Routes shown when logged out
- `authRoutes` — Routes shown when logged in (redirects unauthenticated users)

Route components are resolved by string name and lazy-loaded via `BrowserRouteSwitch.jsx`.

`/dev/*` routes (component, icon, modal, settings and tag previews) are only added outside production. `/dev/components` also has quick toggles for environment, logged-in display, focus highlighting, contrast and theme, plus buttons to trigger each kind of toast, for checking the UI across variations.

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

The logged-in layout in `AppMain` (`app/App.jsx`) uses ARIA landmarks: `nav` (sidebar), a labelled `section` (control bar), `main` (`#content`) and `aside` (queue); the full-page player is its own `main`, and the sidebar search has `role="search"`. Keep them when changing the layout, and don't nest another `main` inside `#content`. `TitleHeading`'s sticky duplicate of the page title is `aria-hidden`.

Render artwork thumbnails with `ArtworkImage` rather than a plain `<img>`: it renders nothing when `src` is empty or fails to load, so the parent's `artwork-placeholder` shows instead of a broken image. It remembers the failed `src` rather than a flag, so an element reused for a new row (virtual lists key by index) shows the new artwork.

`PlaybackButton` renders the core-coloured playback buttons (play/pause/resume, shuffle) used in `TitleHeading`. It's presentational only: the parent passes `isPlaying`, `isLoaded` and `onClick` (and handles play/pause/resume itself). Its `variant` prop picks an entry from the `variants` map in the component (`play` by default, with a Play/Pause/Resume label; `shuffle`, icon-only), so add new variants there.

## Colour Theme

Theme colours are CSS custom properties computed by the pure `getColorTokens` util and applied at runtime by `useColorTheme`, and scaled by the contrast setting; every value that changes with contrast lives in its exported `contrastLevels`, which the audit also reads. Surface fills (secondary, tertiary) scale more gently with contrast (`surfaceMultiplier`) than their borders, hovers and active states, so text on them stays readable at higher contrast. `npm run test:colors` generates and opens an HTML report (`test-results/colors/audit.html`) of WCAG contrast ratios for key token pairs across every dev theme and contrast level (normal test runs skip writing it); check it when changing colour values. The same test file's `guardrails` list enforces minimum ratios on every dev theme (skipping themes whose own text-on-background is below 4.5), so add a guardrail for any new colour rule. In logged-in UI, use these tokens rather than hardcoded colours or raw `opacity` values, and prefer a token named for the role (e.g. `--color-button-on-primary-bg`) over a raw surface token.

Role tokens are named `--color-<role>-on-<surface>-<prop or state>` (e.g. `--color-button-on-primary-hover`, `--color-item-on-secondary-hover`), and in `getColorTokens` they alias base surface values, or consts derived from them (e.g. light/dark picks, which roles may share), never other role tokens. Text inputs, select triggers and similar fields use `--color-field-on-<surface>-*` and look identical: no hover state, just `focus-border` on focus; any light/dark difference belongs in `getColorTokens`, not in `html[data-theme='light']` overrides. Core text (`--color-core-on-<surface>-text`) is the surface colour, switching to the text colour when that falls below the level's `coreTextContrast` (3, 4 or 4.5) against core and the text colour reads better (a higher level's target applies only when the text colour reaches it, otherwise the default's does); both surfaces switch together when the text colour beats both, so a theme stays consistent. Focus borders and hovers are solved with `mixAtContrast` to reach a minimum contrast against their background (focus borders 3, 3.5 or 4 by contrast level; hovers 1.15, 1.2 or 1.25), falling back to the colour they mix towards when the theme's colours can't reach it; button borders then move just far enough to stay visible against the hover. Core's hover shifts core further (darker on light themes, lighter on dark) where needed to reach the hover contrast, and its border shifts at least 1.5 times as far. The sidebar's search field, release banner and user menu trigger are controls: they use `--color-control-on-secondary-*` so they look identical and share a `focus-border`; only the user menu trigger uses `hover`. Checkboxes and radios use `--color-checkbox-on-primary-border` and have no hover state. Core used as a fill on a surface is a core accent (`colorCoreAccentOn<Surface>`): core, shifted by `shiftAtContrast` (darker or lighter in Lab, keeping its hue) just far enough to reach the level's `focusContrast` against that surface, or the text colour when no shift can. Checked checkboxes and radios fill with it (`--color-checkbox-on-primary-checked-bg`, with the primary background as the `-checked-tick`), as do slider fills (`--color-slider-on-<surface>-fill`, picked by `RangeSlider`'s `color` prop; the control bar passes `primary` in the full-page player). Core on rows that can also be hovered or active is shifted against every row state (`shiftAtContrast` takes several backgrounds) to the gentler `itemAccentContrast` (2.5, 2.75 or 3), so it stays close to core: selected items in FormSelect and FormTheme popups (`--color-select-on-secondary-checked-text`), and active control bar buttons, the current user menu item and the sidebar's active link (`--color-item-on-<surface>-active-text`, on primary in the full-page player). Other plain core accents (links, the playing track, favourites) stay as the user's core. Disabled states use the unscaled `--opacity-disabled` (whole element), `--color-disabled-text`, `--color-button-disabled-*` and `--opacity-disabled-icon` tokens, which don't change with the contrast setting, so disabled items stay clearly disabled at high contrast. Loading spinners use the `spinner($size, $color, $width)` mixin, an SVG mask filled with the text colour (`currentColor` by default), rather than images. Missing artwork shows the `artwork-placeholder` mixin, a music note SVG mask on `:before` filled with `--color-opacity-025` by default; the artwork needs to be positioned to sit above it, and thumbs showing their own icon set `:before` to `content: none`. `Button`'s `color` variants are named after their tokens (`core`, `mono`, `onPrimary`, `onSecondary`, `outlineOnPrimary`, `outlineOnSecondary`). Logged-out pages use the static `$color-*` variables in `_vars.scss`, which mirror the token names; any value that deliberately differs from the default theme is commented.

## Context Menus

Right-click/"more options" menus share one entry schema and renderer (`MenuEntry` in `components/MenuEntries/`), consumed by both `ContextMenu` (Radix context-menu, right-click) and `ActionMenu` (Radix dropdown-menu, click-triggered "..." button). An entry is `{ variant: 'action' | 'checkbox' | 'submenu' | 'divider' | 'sectionHeading', ... }` — see the header comment in `MenuEntries.jsx` for the per-variant fields. `ActionSort` also builds on the same dropdown-menu primitive and reuses `MenuEntries.module.scss`'s shared popup/item styling, but renders its own entries directly rather than going through `MenuEntry`, since a sort option isn't one of the variant shapes above.

Each entity type (album, artist, playlist, collection, track) has a `useContextMenu<Entity>` hook that builds its entries array from a plain object shaped like the entity's list/grid row, plus a thin `ContextMenu<Entity>` wrapper component. Follow the existing hooks for conventions such as: omitting a `link` field to suppress a "Go to X" entry on that entity's own detail page, and showing a "Remove from X" entry only when the relevant parent ID (e.g. `collectionId`) is present on the entity object.

## Action Components

The `Action*` components are the toolbar controls shown above list/grid views. Their shared trigger/icon/label CSS lives in `components/Action/_shared.scss` as Sass mixins (`@include action.trigger`, etc.) — this is a plain `.scss` partial, not a `.module.scss`, since Sass's `@use` resolution won't find a `.module.scss` file and it's never imported as a style object from JS, only `@use`'d from other Sass.

`ActionSort` combines a sort-field select with direction (asc/desc) into one control: selecting a new option sets it ascending; re-selecting the active option toggles direction. It's built on `@radix-ui/react-dropdown-menu` rather than `react-select`, since Select suppresses `onValueChange` when re-selecting the already-active value and always closes on select — neither of which this component wants. Each `useGet<Entity>Array`/`useGet<Entity>Items` hook's `setSort<Entity>(sort, order?)` setter accepts an optional second `order` argument so `ActionSort` can update both fields in one dispatch; calling `setSort` and `setOrder` as two separate dispatches back-to-back will clobber the sort field, because `setOrder` re-writes it from a stale closure value to guard against sorting by a hidden field.

## Form Fields

`FormInput` and `FormSelect` are standalone, size-matched text-input and select-field components (plain `value`/`onChange`/`options`/`disabled` props, no store dependency) — use them anywhere a form field is needed. `FormInput` also takes a `color` prop (`primary` default, `secondary`) to match the background it's placed on — e.g. modals pass `color="secondary"` since they sit on a secondary surface, while `SettingsList` relies on the `primary` default since it only ever renders on the primary main-content background. `FormSelect` has no `color` prop yet, since nothing currently renders it outside a primary-background context. `SettingsList`'s `text` and `select` entry types are thin wrappers around them that additionally dispatch to `sessionModel` by `key`. A `checkbox` or `radio` entry can pass `onChange(value)` to handle the change itself instead of dispatching (e.g. dev-only toggles that aren't session state). `FormTheme` is a separate, larger Radix Select styled specifically for theme swatches and isn't a general-purpose select.

`FormInput`'s `error` prop only displays a message (announced to screen readers) — it doesn't stop the value being saved. `SettingsList` text entries write every keystroke to `sessionModel`, so any code that reads a validated setting must re-run its validator (e.g. `validateHttpsUrl`) and use the trimmed value, rather than trusting the stored string.

## Modals

Modal content components live as flat files directly under `js/modals/` (no per-modal folder), sharing one stylesheet (`modals.module.scss`). Open one via `dispatch.dialogModel.showModal('Name')` or `showModal({ modal: 'Name', data: {...} })`; the modal reads `dialogModel.currentModalData` via `useSelector`. Confirmations use `dispatch.dialogModel.showConfirm({...})` instead (see `models.dialog.js`) rather than a dedicated modal component.

Name-entry modals (playlists, collections) validate inline using `validateEntityName` from `js/utils` — trims whitespace, rejects unsafe characters, and checks for a case-insensitive duplicate against the relevant list already in the store. Follow this pattern for any other user-named entity.

## Home Page and Metadata

The logged-out `/` route renders `PageHome` (the marketing page with download links) in the browser and `PageLanding` (just the intro and login buttons) in Electron — see `pages/Home.jsx`. `PageLanding` reuses `PageHome.module.scss`, so keep the shared intro, image, social and footer markup in sync between the two when changing either. Outside production, `PageLanding` can also be viewed in the browser at `/landing` (used for its E2E snapshot).

The product description lives in several places: `index.html` (meta description and Open Graph tags), `public/manifest.json` and `README.md` all use the full "Chromatix is a desktop music player for…" sentence, while the visible intro on both pages drops the "Chromatix is" (the H1 already names it). Update them all together when the supported services or wording change.

## TypeScript Migration

The codebase is partially migrated to TypeScript. New utilities and hooks should be written in TypeScript (`.ts`/`.tsx`). Existing `.js`/`.jsx` files do not need to be converted unless directly touched. The store models remain in JavaScript for now.

## Testing

Tests are colocated with the file they cover using the `.test.ts` suffix (e.g. `sortList.ts` / `sortList.test.ts`). This applies to all modules — utilities, services, hooks, etc. All utility functions should have thorough tests. Follow the existing naming convention:

```ts
// Tests generated using AI

import functionName from './functionName';

describe('Testing "functionName" function', () => {
  test('Test description', () => { ... });
});
```

Shared test fixtures live in `__fixtures__/` folders colocated with the tests that use them (e.g. `js/utils/__fixtures__/`).

Vitest manual mocks for browser APIs unavailable in jsdom (e.g. `HTMLAudioElement`) live in `__mocks__/` at the root. The setup file is `vitest.setup.ts` at the project root.

Tests use **Vitest** with `globals: true` — no need to import `describe`, `test`, `expect`, `vi`, etc.

- Run tests in watch mode with `npm run test`
- Run all tests once with `npm run test:all`

## E2E Testing

Visual regression tests use **Playwright** with Chromium. Snapshots are stored in `tests/snapshots/`. Auth session files live in `tests/.auth/` (gitignored).

Test files live in `tests/pages/`. Shared helpers (`waitForContent`, `checkForRateLimit`) are in `tests/utils.ts`. Config is in `playwright.config.ts`.

Each test navigates once then loops over viewports with `page.setViewportSize()` for full-page screenshots — no separate browser context per breakpoint. Logged-in pages scroll inside `#content` rather than the page, so `fullPage` alone only captures one viewport; pass `{ fullContent: true }` to `snapshotPage` / `snapshotAtViewports` to grow the viewport height until `#content` no longer scrolls.

Run `npm run test:e2e:login` once to authenticate before running auth tests. The setup test must run before library tests to generate `tests/.auth/library-id.json`.

## Key Scripts

- `npm start` / `npm run dev` — Start dev server (port 4000)
- `npm run build` — Production build (output to `build/`)
- `npm run check` — Run knip, lint, prettier, and typecheck in sequence
- `npm run test` / `npm run test:all` — Run Vitest tests (watch / once)
- `npm run test:colors` — Generate and open the colour contrast audit report, which can compare against a saved `original` or `baseline` snapshot (`test-results/colors/*.json`); `test:colors:baseline` also saves the current ratios as the baseline
- `npm run test:e2e:login` — Manual Plex login; run once before auth tests
- `npm run test:e2e:*` — E2E snapshot tests; `:update` variants regenerate snapshots
- `npm run images:convert:new` — Convert new images to WebP
- `npm run images:tinify:new` — Compress new images via Tinify
- `npm run svg:compress:new` — Compress new SVGs
- `npm run css:sort` — Sort CSS/SCSS property order via PostCSS

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
- Never remove existing `console.log` debug statements, even if they look temporary — they're intentional
- Use `clsx` for all conditional class name composition (not string concatenation)
- Use CSS Modules for component-scoped styles; import as `style` and reference as `style.className`
- Use `getEnvironment()` from `js/utils` as the single source of truth for environment, browser, OS, and Electron info — do not access `import.meta.env` or `navigator` directly for these, except plain `import.meta.env.VITE_*` reads used only to gate build-time config (e.g. `routes.ts`'s `isProduction`), which are fine directly
- Outside production, the "Environment" select on `/dev/components` can simulate another environment (e.g. Electron on Windows) by overriding the display fields `getEnvironment()` returns. Use `isElectron` for anything visual; use `isRealElectron` for behaviour that genuinely needs the Electron runtime (e.g. direct IP connections, `chromatix://` local files), so a simulated environment can't trigger it. Simulated Electron on Windows or Linux also shows the app menu, filled with the dummy `devElectronMenu` (`_config/devElectronMenu.ts`), since there's no main process to send the real one
- Use `getLocalStorage` / `setLocalStorage` from `js/utils` for all localStorage access
- Use `safeEncodeURIComponent` / `safeDecodeURIComponent` from `js/utils` (not the native globals) for values embedded in React Router route paths/params (e.g. genre, tag, collection IDs) — their placeholder scheme exists specifically to survive React Router's own decoding, and only makes sense paired on both ends of that round-trip. For values that never pass through React Router (e.g. a `chromatix://` protocol URL read directly by Electron), use the native `encodeURIComponent` / `decodeURIComponent`
- All top-level exports in `js/hooks/` and `js/utils/` must have a clear, succinct JSDoc comment. Keep descriptions brief and factual — one sentence for simple functions, a few lines for complex ones. Include `@param` and `@returns` tags only when they add meaningful clarity beyond what the types convey. Wrap JSDoc lines to stay under 100 characters
- Section comments use a consistent three-line banner style — a divider, a title, then a closing divider:
  ```
  // ======================================================================
  // SECTION TITLE
  // ======================================================================
  ```
- SVG components use the Vite-native `?react` import suffix: `import FooIcon from './foo.svg?react'`
- See **Adding Icons** below for the full icon workflow
- Do **not** use Prettier as an ESLint plugin — run `npm run prettier` separately; `eslint-config-prettier` disables conflicting formatting rules

## Adding Icons

1. Place the raw SVG in `src/js/components/Icon/icons/general-original/` (or `site-original/` for service logos)
2. Conform the SVG to the project format before compressing:
   - Root `<svg>` must have `fill="none"`
   - Remove all hardcoded `stroke` colour attributes (e.g. `stroke="white"`)
   - Remove all inline `style` attributes from paths
   - Remove `stroke-width` attributes from paths
   - Remove `<g clip-path>` wrappers and `<defs>` / `<clipPath>` blocks
   - Every path must have `stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"`
3. Run `npm run svg:compress:new` — this writes the optimised file to `general-compressed/` (skipping already-compressed files; delete the compressed copy first if you need to re-compress)
4. Add the import to `Icon.jsx`, importing from `general-compressed/`, in alphabetical order
5. Register the component in the `generalIcons` object (or `siteIcons` for site logos) in alphabetical order

## Response Style

- Be concise and direct — prefer short answers unless complexity warrants detail
- Don't repeat back what the user said before answering
- Skip unnecessary preamble like "Great question!" or "Certainly!"
- Don't add summaries at the end of responses

## Maintaining These Instructions

These instructions are for AI agents (including Copilot). When you make changes to this project, keep this file up to date. If you introduce a new pattern, convention, component type, third-party integration, or architectural decision, update the relevant section or add a new one. Outdated guidance is worse than none.
