// Generated using GitHub Copilot

import { test } from '@playwright/test';
import { snapshotPage } from '../utils';

test.describe('settings pages match snapshots', () => {
  test('settings page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings`, '001-settings');
  });

  test('about page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/about`, '002-about');
  });

  test('appearance page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/appearance`, '003-appearance');
  });

  test('browse page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/browse`, '004-browse');
  });

  test('changelog page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/changelog`, '005-changelog');
  });

  test('controls page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/controls`, '006-controls');
  });

  test('downloads page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/downloads`, '007-downloads');
  });

  test('general page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/general`, '008-general');
  });

  test('keyboard page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/keyboard`, '009-keyboard');
  });

  test('lastfm page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/lastfm`, '010-lastfm');
  });

  test('sidebar page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/sidebar`, '011-sidebar');
  });
});
