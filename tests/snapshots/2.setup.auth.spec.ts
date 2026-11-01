// Tests generated using AI

import { test } from '@playwright/test';
import {
  clearSessionState,
  pickFirstSetupOption,
  snapshotAtViewports,
  waitForContent,
  waitForSetupPage,
} from '../utils';

test.describe.serial('setup pages match snapshots', () => {
  test('setup pages match snapshots', async ({ page }) => {
    await clearSessionState(page);

    // Users page
    await waitForSetupPage(page, /\/users$/);
    await snapshotAtViewports(page, '001-users');
    await pickFirstSetupOption(page);

    // Servers page
    await waitForSetupPage(page, /\/servers$/);
    await snapshotAtViewports(page, '002-servers');
    await pickFirstSetupOption(page);

    // Libraries page
    await waitForSetupPage(page, /\/libraries$/);
    await snapshotAtViewports(page, '003-libraries');
    await pickFirstSetupOption(page);

    // Wait for redirect to artists — confirms a library is selected and session is complete
    await page.waitForURL('**/libraries/*/artists', { timeout: 15000 });
    await waitForContent(page);
    await snapshotAtViewports(page, '004-artists');

    // Logged-in 404 page
    await page.goto('/this-page-does-not-exist');
    await waitForContent(page);
    await snapshotAtViewports(page, '005-error-404');
  });
});
