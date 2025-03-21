<a name="0.34.0"></a>
# 0.34.0 (2025-03-17)
Refactor:
- Plex API code tidying and consistency improvements.
Other:
- Various small tweaks and fixes.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.33.0"></a>
# 0.33.0 (2025-03-02)
Features:
- Performance tweaks when browsing in list view.
  - List view has been entirely rebuilt to use a virtualised list.
    - (Note that vistualisation is only used when more than a certain number of items are in the list.)
  - This should prevent the UI from slowing down when browsing large libraries.
  - This will also allow more flexibility in future for customising column visibility.
- Updated and consistent placeholder icon for missing artwork.
Deprecations:
- Sadly, the "always show full titles" option is incompatible with the new virtualised list view.
  - This option has been disabled and marked as deprecated in the settings page.
  - This may be revisited in future if a solution can be found.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.32.0"></a>
# 0.32.0 (2025-02-22)
Features:
- Volume and mute state is now saved in session storage.
- Email link for getting in touch added to settings page.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.31.0"></a>
# 0.31.0 (2025-02-08)
Features:
- Added better error handling and messaging.
- Added network detection and messaging.
Refactor:
- Tidied up a bunch of Plex API code.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.30.0"></a>
# 0.30.0 (2025-02-07)
Features:
- Search functionality has been added.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.29.0"></a>
# 0.29.0 (2025-02-06)
Refactor:
- Lots of performance improvements and optimisations.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.28.0"></a>
# 0.28.0 (2025-02-02)
Features:
- Folders section added with grid and list views.
- Tweaks to colour theme options.
- Tweaks to the "about" page.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.27.0"></a>
# 0.27.0 (2025-01-31)
Features:
- Download links added to settings section within app.
- Minor styling tweaks to settings pages.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.26.0"></a>
# 0.26.0 (2025-01-29)
Features:
- Added Windows download link to home page.
- Added a "high contrast" option to appearance settings.
- Made accessibility focus states optional.
- Added an "About" page with build information.
- Other minor tweaks to settings pages.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.25.0"></a>
# 0.25.0 (2025-01-26)
Features:
- Added styling and functionality specific to Windows app.
Fixed:
- Ensure electron-drag element is always available.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.24.0"></a>
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

<a name="0.23.0"></a>
# 0.23.0 (2025-01-22)
Features:
- Icon artwork added when viewing a specific genre, mood or style.
Updated:
- Improved keyboard handling when an input is focused.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.22.0"></a>
# 0.22.0 (2025-01-21)
Features:
- Added list view and sorting for genres, moods, and styles.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.21.0"></a>
# 0.21.0 (2025-01-21)
Features:
- Added custom icons to genre/mood/style listings to match sidebar icons.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.20.0"></a>
# 0.20.0 (2025-01-20)
Features:
- Added expanded "now playing" artwork option to queue.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.19.0"></a>
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

<a name="0.18.0"></a>
# 0.18.0 (2024-07-06)
Features:
- Added list view for albums, artists, playlists, and collections.
- Tweaked sorting options and styling for compatability with list views.
- Better handling of various artists.
- Display "appears on" compilation albums in artist view, where possible.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.17.0"></a>
# 0.17.0 (2024-06-21)
Features:
- Added sorting of album tracks, by clicking table headings.
- Redesigned settings page.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.16.0"></a>
# 0.16.0 (2024-06-12)
Features:
- Added order (asc/desc) to key library sections.
- Added sorting of playlist tracks, by clicking table headings.
Fixed:
- Fixed some text trimming in the queue.
- Fixed handling of items with no artwork.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.15.0"></a>
# 0.15.0 (2024-06-05)
Features:
- Added sorting options to key library sections.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.14.0"></a>
# 0.14.0 (2024-06-02)
Features:
- Released bundled macOS app.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.13.0"></a>
# 0.13.0 (2024-05-27)
Features:
- Add ability to edit star ratings.
- Add icons to sidebar menu.
Refactor:
- Separated artist and album collection code.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.12.0"></a>
# 0.12.0 (2024-05-19)
Features:
- Added right sidebar with queue view.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.11.0"></a>
# 0.11.0 (2024-04-27)
Features:
- Added media key support.
- Added media metadata support.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.10.0"></a>
# 0.10.0 (2024-04-27)
Features:
- Added logging of playback status back to Plex.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.9.0"></a>
# 0.9.0 (2024-04-26)
Features:
- Added repeat and shuffle functionality.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.8.0"></a>
# 0.8.0 (2024-04-21)
Features:
- Created changelog file.
- Added social links to home page and settings page.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.7.0"></a>
# 0.7.0 (2024-04-21)
Features:
- Improvements to settings for star ratings.
- Improvements to settings for showing full titles.
- Added Vercel event tracking.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.6.0"></a>
# 0.6.0 (2024-04-19)
Refactor:
- More logic moved to plexTools.js.
- Added getFastestConnection() function for improved performance.
- Added better error handling.
- Improved handling of album art generation.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.5.0"></a>
# 0.5.0 (2024-04-18)
Refactor:
- Lots of plex API tidying up.
- Setup plexTools.js to handle all plex API calls.
- Improved token encryption.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.4.0"></a>
# 0.4.0 (2024-04-17)
Features:
- Added play button to grid views.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.3.0"></a>
# 0.3.0 (2024-04-16)
Features:
- Added play button to album and playlist headers.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.2.0"></a>
# 0.2.0 (2024-04-14)
Features:
- Added artist styles view.
- Added album styles view.
- Added artist moods view.
- Added album moods view.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.1.0"></a>
# 0.1.0 (2024-04-11)
Features:
- Added basic sidebar menu settings.
- Added artist collections view.
- Added album collections view.
- Added artist genres view.
- Added album genres view.

<!-- CHANGELOG SPLIT MARKER -->

<a name="0.0.0"></a>
# 0.0.0 (2024-04-07)
Initial release.
