// Tests generated using AI

import { test } from '@playwright/test';
import { snapshotPage } from '../../utils';

const homeViewports = [375, 768, 1024, 1440];

test('homepage matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/', '001-homepage', { viewports: homeViewports });
});

test('landing page matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/landing', '002-landing', { viewports: homeViewports });
});

test('jellyfin login page matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/login-jellyfin', '003-login-jellyfin', { viewports: homeViewports });
});

test('404 page matches snapshot', async ({ page }) => {
  await snapshotPage(page, '/this-page-does-not-exist', '004-error', { viewports: homeViewports });
});
