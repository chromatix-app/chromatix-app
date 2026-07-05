# 0.66.0 (2026-07-05)

Features:

- Jellyfin playlist management — create, edit, and delete playlists directly within Chromatix, matching the existing Plex functionality.
- Added a note to playback settings explaining the current status of gapless playback support.

<!-- CHANGELOG SPLIT MARKER -->

# 0.65.0 (2026-07-01)

Features:

- Artist thumbnail cards now have a play button, matching the behaviour of album and playlist cards.
- Added a GitHub Sponsors link.
- Minor tweaks and fixes throughout.

<!-- CHANGELOG SPLIT MARKER -->

# 0.64.0 (2026-06-19)

Features:

- Tracks that couldn't be played due to codec incompatibility are now automatically transcoded.
  - Plex: unsupported formats (e.g. WMA, certain FLAC variants) are streamed via DASH and transcoded on the fly.
  - Jellyfin: unsupported formats are routed through Jellyfin's universal endpoint for server-side transcoding.
- Settings pages have been tweaked (again) for clarity and consistency.

<!-- CHANGELOG SPLIT MARKER -->

# 0.63.0 (2026-06-16)

Features:

- Changed URLs to be more consistent and (hopefully) future-proof.
  - (Sorry for breaking any bookmarks - temporary redirects have been added!)
- New keyboard settings page — control whether media keys, the space bar, and left/right arrow keys are used to control playback.
- New option in general settings: when playing from an artist page, the app can now automatically switch to track view and highlight the currently playing track.
- Range sliders now support touch events, improving usability on touch screens.
- Various responsive layout improvements throughout, with better spacing and padding across different window sizes.

Code changes:

- Added Playwright end-to-end tests with visual regression screenshot comparisons across multiple viewports.

<!-- CHANGELOG SPLIT MARKER -->

# 0.62.0 (2026-06-09)

Features:

- Plex playlist management — create, edit, and delete playlists directly within Chromatix.
- Tracks can be added and removed from any playlist via the new context menu.
- Drag and drop playlist tracks to reorder them.
- Chromatix is now available as a native desktop app for Linux.
- Improvements to the app menu on Windows and Linux.

Code changes:

- Removed `fast-xml-parser` and replaced `moment` with `dayjs` for a smaller bundle size.

<!-- CHANGELOG SPLIT MARKER -->

# 0.61.0 (2026-05-20)

Features:

- Improved light theme design with updated colours, shadows, gradients, and artwork outlines throughout.
- New theme selector added.
- Colour themes have been renamed and given label descriptions for clarity.
- Release notes now adapt their colour mode to match the active theme text colour.
- Various settings pages updated with improved controls and layout.

<!-- CHANGELOG SPLIT MARKER -->

# 0.60.0 (2026-05-09)

Features:

- Play button added to artist detail pages, with the same behaviour as album and playlist play buttons.
- The play button on album, playlist, and artist detail pages now toggles play/pause/resume.
- Filter controls on artist detail pages are now icon-only, matching the design of album and playlist detail pages.

Code changes:

- Migrated build tooling from Create React App (CRA) to Vite 8.
- Upgraded TypeScript from v4 to v6.
- Upgraded ESLint from v8 to v10.
- Replaced Jest (via `react-scripts`) with Vitest as the test runner.
- JS bundle split: Radix UI extracted into a separate chunk for better long-term caching.
- `@types/react` and `@types/react-dom` pinned to v18 to match the React 18 runtime.
- Added `isStoreReady()` guard to all bridge functions to prevent premature API calls during Vite HMR before the Redux store has been hydrated from localStorage.

<!-- CHANGELOG SPLIT MARKER -->

# 0.59.0 (2026-03-25)

Just very minor tweaks, bug fixes, and maintenance tasks.

<!-- CHANGELOG SPLIT MARKER -->

# 0.58.0 (2026-01-23)

Features:

- Clicking the album art thumbnail in the header of artist, album, playlist and collection detail pages now opens a full screen modal with a larger version of the artwork.

Code changes:

- Removed all classes and styes from the html element, and replaced these with data attributes for better clarity, and dynamically updated style tags for dynamic styles such as theme variables.

<!-- CHANGELOG SPLIT MARKER -->

# 0.57.0 (2026-01-19)

Features:

- Added Plex Home user switching support. Users with multiple Plex Home users enabled can now switch between different Plex Home users directly within Chromatix.
- Added additional settings to control visibility of information and buttons in the control bar.

<!-- CHANGELOG SPLIT MARKER -->

# 0.56.0 (2025-11-12)

Features:

- Updated buttons in the "browse settings" section to be much clearer using segmented controls.

<!-- CHANGELOG SPLIT MARKER -->

# 0.55.0 (2025-11-11)

Features:

- Added star ratings and favourites to the control bar playing information.
- Created a new "controls" settings page to allow hiding and showing of these new fields.

<!-- CHANGELOG SPLIT MARKER -->

# 0.54.0 (2025-11-11)

Features:

- Updated the expanded sidebar playing information with additional details and options to show and hide specific elements.

<!-- CHANGELOG SPLIT MARKER -->

# 0.53.0 (2025-10-31)

Code changes:

- Added a universal getEnvironment utility function to act as a single source of truth for all information about the app environment, including browser and OS info, version info, build info and Electron app info.

<!-- CHANGELOG SPLIT MARKER -->

# 0.52.0 (2025-09-02)

Features:

- Login with Jellyfin! Chromatix now supports Jellyfin as well as Plex.
  - Note that right now you can only log into one service at a time, and settings are not shared between accounts. We hope to add multiple account support soon.

<!-- CHANGELOG SPLIT MARKER -->

# 0.51.0 (2025-08-21)

Features:

- Brand new full screen player mode, with customisation options.
- New release banner in the sidebar to highlight new features and updates.
  - This can be permanently disabled in the settings.
- "What's new" modal detailing recent updates, which can be accessed by clicking the release banner, and from the settings menu.

Code changes:

- Prevented playlist artwork from being regenerated every time the user navigates to a different playlist.

<!-- CHANGELOG SPLIT MARKER -->

# 0.50.0 (2025-08-18)

Code changes:

- Touch events added to RangeSlider component, to improve touch screen support.

<!-- CHANGELOG SPLIT MARKER -->

# 0.49.0 (2025-08-17)

Features:

- Minor colour theme updates.
- Modal functionality has been added for alerts, confirmations, and other important messages (although these are not used yet).

<!-- CHANGELOG SPLIT MARKER -->

# 0.48.0 (2025-07-26)

Features:

- All data is now continuously re-fetched in the background (as required) to ensure content is always up to date.
  - This means that the app will no longer need to be refreshed to see changes made in Plex.
- Improved handling when browsing non-existent items via the URL.
- Star ratings are now always shown when hovering on a row in list view.
- Better sorting of playlists in the sidebar (consistent with other sections and user preferences).

<!-- CHANGELOG SPLIT MARKER -->

# 0.47.0 (2025-07-25)

Features:

- Added option to only allow setting whole star ratings.
- Tweaked some of the settings pages for clarity and consistency.
- Improved handling when browsing non-existent items via the URL.

<!-- CHANGELOG SPLIT MARKER -->

# 0.46.0 (2025-07-12)

Features:

- Added scrollbar styling options (Windows only).

<!-- CHANGELOG SPLIT MARKER -->

# 0.45.0 (2025-07-10)

Features:

- Home page amends for mobile.
- Added error messaging when visiting URLs for items that do not exist.

Code changes:

- Updated error logging.
- Updated release-it configuration for automated deployments.

<!-- CHANGELOG SPLIT MARKER -->

# 0.44.0 (2025-07-05)

Features:

- Home page redesigned for a more consistent look and feel.
- Improved tracking of errors so that they can be investigated and fixed.
- Various minor fixes, tweaks and improvements throughout.

Refactor:

- The codebase has been refactored to handle multiple services in the future (i.e. not just Plex).
- Files have also been reorganised and renamed for better clarity and consistency going forward.

<!-- CHANGELOG SPLIT MARKER -->

# 0.43.0 (2025-06-17)

Features:

- Performance tweaks when browsing in grid view.
  - Grid view has been entirely rebuilt to use a virtualised list.
    - This should prevent the UI from slowing down when browsing large libraries.
- Improved handling of unplayable tracks, including visible error messages and automatically moving on to the next track.
- Leading articles ("A", "An", "The") are now ignored when sorting items alphabetically.
  - This can be optionally disabled in general settings.

<!-- CHANGELOG SPLIT MARKER -->

# 0.42.0 (2025-05-12)

Features:

- Redesigned and rebuilt user menu, using Radix UI for better accessibility and future proofing.
- Add a setting to toggle sorting numbers before/after letters when sorting alphabetically.
- Generally made alphabetical sorting more consistent throughout.

<!-- CHANGELOG SPLIT MARKER -->

# 0.41.0 (2025-05-11)

Features:

- Added track view to artist pages, for viewing and playing all tracks by an artist.
- Redesigned filter dropdowns for clarity and consistency.
- Minor tweaks to the queue.
- Minor tweaks and fixes throughout.

<!-- CHANGELOG SPLIT MARKER -->

# 0.40.0 (2025-05-08)

Features:

- Added options for configuring the "repeat one" behaviour.
- Minor visual tweaks to the queue.

<!-- CHANGELOG SPLIT MARKER -->

# 0.39.0 (2025-04-21)

Features:

- Added "repeat one" functionality to loop a single track. Press the repeat button twice to enable.

<!-- CHANGELOG SPLIT MARKER -->

# 0.38.0 (2025-04-16)

Features:

- Added a new hook for communicating with the Electron app.
  - This will allow for displaying player controls in the Windows taskbar.

<!-- CHANGELOG SPLIT MARKER -->

# 0.37.0 (2025-04-13)

Features:

- List view columns can now be toggled on and off, using a new "options" menu.
  - Additional list view columns have been added in a few places, such as audio codec and bitrate.
  - Default list view columns have been configured with sensible defaults.
- Grid view ratings can now be toggled on and off, using a new "options" menu.
- Globally toggling star rating visibility has been deprecated now that individual toggles are available.
  - However, new buttons to toggle star ratings on and off for all sections have been added to the settings page.

Code changes:

- Minor Plex API performance improvements by omitting unnecessary fields.
- Larger artwork in header sections, if the viewport is large enough.
- Tweaked some icon sizes for filter buttons.
- Made star ratings very slightly larger (they should have been that way from the start).
- Updated various dependencies.

<!-- CHANGELOG SPLIT MARKER -->

# 0.36.0 (2025-03-30)

Features:

- Performance updates for the queue.
  - The queue has been entirely rebuilt to use a virtualised list.
    - (Note that virtualisation is only used when more than a certain number of items are in the queue.)
    - This should prevent the UI from slowing down when browsing large queues.
- Minor behavioural tweaks to the Queue.

<!-- CHANGELOG SPLIT MARKER -->

# 0.35.0 (2025-03-23)

Features:

- Added list view for artist albums.
  - (Note that this completes the adding of list views to all sections.)
- Added buttons to globally toggle between grid and list view within the general settings section.
- Moved accessibility settings into the general settings section for simplicity.

<!-- CHANGELOG SPLIT MARKER -->

# 0.34.0 (2025-03-17)

Refactor:

- Plex API code tidying and consistency improvements.

Other:

- Various small tweaks and fixes.

<!-- CHANGELOG SPLIT MARKER -->

# 0.33.0 (2025-03-02)

Features:

- Performance tweaks when browsing in list view.
  - List view has been entirely rebuilt to use a virtualised list.
    - (Note that virtualisation is only used when more than a certain number of items are in the list.)
  - This should prevent the UI from slowing down when browsing large libraries.
  - This will also allow more flexibility in future for customising column visibility.
- Updated and consistent placeholder icon for missing artwork.

Deprecations:

- Sadly, the "always show full titles" option is incompatible with the new virtualised list view.
  - This option has been disabled and marked as deprecated in the settings page.
  - This may be revisited in future if a solution can be found.

<!-- CHANGELOG SPLIT MARKER -->

# 0.32.0 (2025-02-22)

Features:

- Volume and mute state is now saved in session storage.
- Email link for getting in touch added to settings page.

<!-- CHANGELOG SPLIT MARKER -->

# 0.31.0 (2025-02-08)

Features:

- Added better error handling and messaging.
- Added network detection and messaging.

Refactor:

- Tidied up a bunch of Plex API code.

<!-- CHANGELOG SPLIT MARKER -->

# 0.30.0 (2025-02-07)

Features:

- Search functionality has been added.

<!-- CHANGELOG SPLIT MARKER -->

# 0.29.0 (2025-02-06)

Refactor:

- Lots of performance improvements and optimisations.

<!-- CHANGELOG SPLIT MARKER -->

# 0.28.0 (2025-02-02)

Features:

- Folders section added with grid and list views.
- Tweaks to colour theme options.
- Tweaks to the "about" page.

<!-- CHANGELOG SPLIT MARKER -->

# 0.27.0 (2025-01-31)

Features:

- Download links added to settings section within app.
- Minor styling tweaks to settings pages.

<!-- CHANGELOG SPLIT MARKER -->

# 0.26.0 (2025-01-29)

Features:

- Added Windows download link to home page.
- Added a "high contrast" option to appearance settings.
- Made accessibility focus states optional.
- Added an "About" page with build information.
- Other minor tweaks to settings pages.

<!-- CHANGELOG SPLIT MARKER -->

# 0.25.0 (2025-01-26)

Features:

- Added styling and functionality specific to Windows app.

Fixed:

- Ensure electron-drag element is always available.

<!-- CHANGELOG SPLIT MARKER -->

# 0.24.0 (2025-01-25)

Features:

- Download links added to home page for macOS universal build.
- Added album sorting options to artist pages.
- Added list view and sorting for all other remaining sections.
- Updated home page screenshot to reflect recent changes.
- Added Bluesky link to settings page.

Fixed:

- Some edge case sorting issues have been resolved.

Refactor:

- Used consistent hooks for fetching and managing most list view states.

<!-- CHANGELOG SPLIT MARKER -->

# 0.23.0 (2025-01-22)

Features:

- Icon artwork added when viewing a specific genre, mood or style.

Code changes:

- Improved keyboard handling when an input is focused.

<!-- CHANGELOG SPLIT MARKER -->

# 0.22.0 (2025-01-21)

Features:

- Added list view and sorting for genres, moods, and styles.

<!-- CHANGELOG SPLIT MARKER -->

# 0.21.0 (2025-01-21)

Features:

- Added custom icons to genre/mood/style listings to match sidebar icons.

<!-- CHANGELOG SPLIT MARKER -->

# 0.20.0 (2025-01-20)

Features:

- Added expanded "now playing" artwork option to queue.

<!-- CHANGELOG SPLIT MARKER -->

# 0.19.0 (2025-01-19)

Features:

- Added "browse" category to sidebar.
- Added collapsible sections to sidebar.
- Updated settings pages.
- Added keyboard focus highlighting for accessibility.

Fixed:

- Handle space key when no track is currently selected.

Refactor:

- Converted some utility functions to typescript.

<!-- CHANGELOG SPLIT MARKER -->

# 0.18.0 (2024-07-06)

Features:

- Added list view for albums, artists, playlists, and collections.
- Tweaked sorting options and styling for compatability with list views.
- Better handling of various artists.
- Display "appears on" albums in artist view, where possible.

<!-- CHANGELOG SPLIT MARKER -->

# 0.17.0 (2024-06-21)

Features:

- Added sorting of album tracks, by clicking table headings.
- Redesigned settings page.

<!-- CHANGELOG SPLIT MARKER -->

# 0.16.0 (2024-06-12)

Features:

- Added order (asc/desc) to key library sections.
- Added sorting of playlist tracks, by clicking table headings.

Fixed:

- Fixed some text trimming in the queue.
- Fixed handling of items with no artwork.

<!-- CHANGELOG SPLIT MARKER -->

# 0.15.0 (2024-06-05)

Features:

- Added sorting options to key library sections.

<!-- CHANGELOG SPLIT MARKER -->

# 0.14.0 (2024-06-02)

Features:

- Released bundled macOS app.

<!-- CHANGELOG SPLIT MARKER -->

# 0.13.0 (2024-05-27)

Features:

- Add ability to edit star ratings.
- Add icons to sidebar menu.

Refactor:

- Separated artist and album collection code.

<!-- CHANGELOG SPLIT MARKER -->

# 0.12.0 (2024-05-19)

Features:

- Added right sidebar with queue view.

<!-- CHANGELOG SPLIT MARKER -->

# 0.11.0 (2024-04-27)

Features:

- Added media key support.
- Added media metadata support.

<!-- CHANGELOG SPLIT MARKER -->

# 0.10.0 (2024-04-27)

Features:

- Added logging of playback status back to Plex.

<!-- CHANGELOG SPLIT MARKER -->

# 0.9.0 (2024-04-26)

Features:

- Added repeat and shuffle functionality.

<!-- CHANGELOG SPLIT MARKER -->

# 0.8.0 (2024-04-21)

Features:

- Created changelog file.
- Added social links to home page and settings page.

<!-- CHANGELOG SPLIT MARKER -->

# 0.7.0 (2024-04-21)

Features:

- Improvements to settings for star ratings.
- Improvements to settings for showing full titles.
- Added Vercel event tracking.

<!-- CHANGELOG SPLIT MARKER -->

# 0.6.0 (2024-04-19)

Refactor:

- More logic moved to plexTools.js.
- Added getFastestConnection() function for improved performance.
- Added better error handling.
- Improved handling of album art generation.

<!-- CHANGELOG SPLIT MARKER -->

# 0.5.0 (2024-04-18)

Refactor:

- Lots of Plex API tidying up.
- Setup plexTools.js to handle all Plex API calls.
- Improved token encryption.

<!-- CHANGELOG SPLIT MARKER -->

# 0.4.0 (2024-04-17)

Features:

- Added play button to grid views.

<!-- CHANGELOG SPLIT MARKER -->

# 0.3.0 (2024-04-16)

Features:

- Added play button to album and playlist headers.

<!-- CHANGELOG SPLIT MARKER -->

# 0.2.0 (2024-04-14)

Features:

- Added artist styles view.
- Added album styles view.
- Added artist moods view.
- Added album moods view.

<!-- CHANGELOG SPLIT MARKER -->

# 0.1.0 (2024-04-11)

Features:

- Added basic sidebar menu settings.
- Added artist collections view.
- Added album collections view.
- Added artist genres view.
- Added album genres view.

<!-- CHANGELOG SPLIT MARKER -->

# 0.0.0 (2024-04-07)

Initial release.
