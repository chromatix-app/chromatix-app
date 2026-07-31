// Tests generated using AI

import { test } from '@playwright/test';
import { snapshotPage } from '../utils';

test.describe('settings pages match snapshots', () => {
  test('settings page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings`, '001-settings');
  });

  test('about page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/about`, '002-about');
  });

  test('accounts page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/accounts`, '003-accounts');
  });

  test('appearance page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/appearance`, '004-appearance');
  });

  test('browse page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/browse`, '005-browse');
  });

  test('changelog page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/changelog`, '006-changelog');
  });

  test('controls page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/controls`, '007-controls');
  });

  test('downloads page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/downloads`, '008-downloads');
  });

  test('keyboard page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/keyboard`, '009-keyboard');
  });

  test('lastfm page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/lastfm`, '010-lastfm');
  });

  test('playback page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/playback`, '011-playback');
  });

  test('sidebar page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/sidebar`, '012-sidebar');
  });
});
