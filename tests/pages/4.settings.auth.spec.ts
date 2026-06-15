// Generated using GitHub Copilot

import { test } from '@playwright/test';
import { snapshotPage } from '../utils';

test.describe('settings pages match snapshots', () => {
  test('settings page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings`, 'settings');
  });

  test('about page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/about`, 'about');
  });

  test('appearance page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/appearance`, 'appearance');
  });

  test('browse page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/browse`, 'browse');
  });

  test('changelog page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/changelog`, 'changelog');
  });

  test('controls page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/controls`, 'controls');
  });

  test('downloads page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/downloads`, 'downloads');
  });

  test('general page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/general`, 'general');
  });

  test('keyboard page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/keyboard`, 'keyboard');
  });

  test('lastfm page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/lastfm`, 'lastfm');
  });

  test('sidebar page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/settings/sidebar`, 'sidebar');
  });
});
