// Tests generated using AI

import { test } from '@playwright/test';
import { snapshotPage } from '../utils';

const homeViewports = [375, 768, 1024, 1440];

test('homepage matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/', '001-homepage', homeViewports);
});

test('jellyfin login page matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/login-jellyfin', '002-login-jellyfin', homeViewports);
});

test('404 page matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/this-page-does-not-exist', '003-error', homeViewports);
});
