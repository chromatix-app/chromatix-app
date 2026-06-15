// Generated using GitHub Copilot

import { test } from '@playwright/test';
import { readFileSync } from 'fs';
import { snapshotPage } from '../utils';

const LIBRARY_ID_FILE = 'tests/.auth/library-id.json';

test.describe('library pages match snapshots', () => {
  let libraryId: string;

  test.beforeAll(() => {
    try {
      ({ libraryId } = JSON.parse(readFileSync(LIBRARY_ID_FILE, 'utf-8')));
    } catch {
      throw new Error('library-id.json not found — run `npm run test:e2e:update:setup` first');
    }
  });

  test('artists page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artists`, 'artists');
  });

  test('artist detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artists/165946`, 'artist-detail');
  });

  test('albums page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/albums`, 'albums');
  });

  test('album detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/albums/165830`, 'album-detail');
  });

  test('folders page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/folders`, 'folders');
  });

  // test('playlists page matches snapshot', async ({ page }) => {
  //   await snapshotPage(page, `/libraries/${libraryId}/playlists`, 'playlists');
  // });

  test('artist collections page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-collections`, 'artist-collections');
  });

  test('artist collection detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-collections/165431`, 'artist-collection-detail');
  });

  test('album collections page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-collections`, 'album-collections');
  });

  test('album collection detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-collections/165459`, 'album-collection-detail');
  });

  test('artist genres page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-genres`, 'artist-genres');
  });

  test('artist genre detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-genres/69533`, 'artist-genre-detail');
  });

  test('album genres page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-genres`, 'album-genres');
  });

  test('album genre detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-genres/69533`, 'album-genre-detail');
  });
});
