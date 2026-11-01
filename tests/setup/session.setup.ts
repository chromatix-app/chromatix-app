// Tests generated using AI
// Runs automatically before projects that depend on it (see playwright.base.ts).
// Picks the first user, server and library from the saved login, then saves the grid and list
// sessions and the library ID used by the logged-in tests.

import { test as setup } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { clearSessionState, pickFirstSetupOption, waitForContent, waitForSetupPage } from '../utils';
import { AUTH_DIR, AUTH_GRID_FILE, AUTH_LIBRARY_ID_FILE, AUTH_LIST_FILE } from '../paths';

setup('build sessions', async ({ page, context }) => {
  mkdirSync(AUTH_DIR, { recursive: true });

  await clearSessionState(page);
  for (const urlPattern of [/\/users$/, /\/servers$/, /\/libraries$/]) {
    await waitForSetupPage(page, urlPattern);
    await pickFirstSetupOption(page);
  }

  // Wait for redirect to artists — confirms a library is selected and session is complete
  await page.waitForURL('**/libraries/*/artists', { timeout: 15000 });
  await waitForContent(page);

  // Save libraryId for specs that navigate directly
  const libraryId = await page.evaluate(() => (window as any).store.getState().sessionModel.currentLibrary.libraryId);
  writeFileSync(AUTH_LIBRARY_ID_FILE, JSON.stringify({ libraryId }));

  // Set some state
  await page.evaluate(async () => {
    await (window as any).store.dispatch.sessionModel.setSessionState({
      savedAppVersion: '999.0.0',
      menuOpenPlaylists: false,
    });
  });
  await page.waitForTimeout(1000);

  // Save grid session state
  await context.storageState({ path: AUTH_GRID_FILE });

  // Set some state
  await page.evaluate(async () => {
    await (window as any).store.dispatch.sessionModel.setSessionState({
      viewArtists: 'list',
      viewArtistAlbums: 'list',
      viewAlbums: 'list',
      viewFolders: 'list',
      viewPlaylists: 'list',
      viewArtistCollections: 'list',
      viewArtistCollectionItems: 'list',
      viewAlbumCollections: 'list',
      viewAlbumCollectionItems: 'list',
      viewArtistGenres: 'list',
      viewArtistGenreItems: 'list',
      viewAlbumGenres: 'list',
      viewAlbumGenreItems: 'list',
      viewArtistMoods: 'list',
      viewArtistMoodItems: 'list',
      viewAlbumMoods: 'list',
      viewAlbumMoodItems: 'list',
      viewArtistStyles: 'list',
      viewArtistStyleItems: 'list',
      viewAlbumStyles: 'list',
      viewAlbumStyleItems: 'list',
      viewArtistTags: 'list',
      viewArtistTagItems: 'list',
      viewAlbumTags: 'list',
      viewAlbumTagItems: 'list',
    });
  });
  await page.waitForTimeout(1000);

  // Save list session state
  await context.storageState({ path: AUTH_LIST_FILE });
});
