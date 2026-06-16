// Generated using GitHub Copilot

import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { waitForContent, snapshotAtViewports } from '../utils';

const GRID_STATE_FILE = 'tests/.auth/session-grid.json';
const LIST_STATE_FILE = 'tests/.auth/session-list.json';
const LIBRARY_ID_FILE = 'tests/.auth/library-id.json';

test.describe.serial('setup pages match snapshots', () => {
  test('setup pages match snapshots', async ({ page, context }) => {
    mkdirSync('tests/.auth', { recursive: true });

    // Clear session state (user/server/library) but keep Plex auth token
    await page.goto('/');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('chromatix-session'))
        .forEach((key) => localStorage.removeItem(key));
    });

    await page.goto('/');

    // Users page
    await page.waitForURL(/\/users$/, { timeout: 15000 });
    await page.waitForSelector('main button[type="button"]', { state: 'visible' });
    await waitForContent(page);
    await snapshotAtViewports(page, '001-users');
    await page.locator('main button[type="button"]').first().click();

    // Servers page
    await page.waitForURL(/\/servers$/, { timeout: 15000 });
    await page.waitForSelector('main button[type="button"]', { state: 'visible' });
    await waitForContent(page);
    await snapshotAtViewports(page, '002-servers');
    await page.locator('main button[type="button"]').first().click();

    // Libraries page
    await page.waitForURL(/\/libraries$/, { timeout: 15000 });
    await page.waitForSelector('main button[type="button"]', { state: 'visible' });
    await waitForContent(page);
    await snapshotAtViewports(page, '003-libraries');
    await page.locator('main button[type="button"]').first().click();

    // Wait for redirect to artists — confirms a library is selected and session is complete
    await page.waitForURL('**/libraries/*/artists', { timeout: 15000 });
    await waitForContent(page);
    await snapshotAtViewports(page, '004-artists');

    // Logged-in 404 page
    await page.goto('/this-page-does-not-exist');
    await waitForContent(page);
    await snapshotAtViewports(page, '005-error-404');

    // Save libraryId for 3.library.auth.spec.ts to use when navigating directly
    const libraryId = await page.evaluate(() => (window as any).store.getState().sessionModel.currentLibrary.libraryId);
    writeFileSync(LIBRARY_ID_FILE, JSON.stringify({ libraryId }));

    // Set some state
    await page.evaluate(async () => {
      await (window as any).store.dispatch.sessionModel.setSessionState({ savedAppVersion: '999.0.0' });
    });
    await page.waitForTimeout(1000);

    // Save grid session state
    await context.storageState({ path: GRID_STATE_FILE });

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
    await context.storageState({ path: LIST_STATE_FILE });
  });
});
