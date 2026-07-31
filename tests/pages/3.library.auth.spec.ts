// Tests generated using AI

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
    await snapshotPage(page, `/libraries/${libraryId}/artists`, '001-artists');
  });

  test('artist detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artists/165946`, '002-artist-detail');
  });

  test('albums page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/albums`, '003-albums');
  });

  test('album detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/albums/165830`, '004-album-detail');
  });

  test('folders page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/folders`, '005-folders');
  });

  test('folder detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/folders/4410`, '006-folder-detail');
  });

  // test('playlists page matches snapshot', async ({ page }) => {
  //   await snapshotPage(page, `/libraries/${libraryId}/playlists`, '007-playlists');
  // });

  // test('playlist detail page matches snapshot', async ({ page }) => {
  //   await snapshotPage(page, `/libraries/${libraryId}/playlists/165857`, '008-playlist-detail');
  // });

  test('artist collections page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-collections`, '009-artist-collections');
  });

  test('artist collection detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-collections/165431`, '010-artist-collection-detail');
  });

  test('album collections page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-collections`, '011-album-collections');
  });

  test('album collection detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-collections/165433`, '012-album-collection-detail');
  });

  test('artist genres page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-genres`, '013-artist-genres');
  });

  test('artist genre detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/artist-genres/69533`, '014-artist-genre-detail');
  });

  test('album genres page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-genres`, '015-album-genres');
  });

  test('album genre detail page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/libraries/${libraryId}/album-genres/69533`, '016-album-genre-detail');
  });
});
