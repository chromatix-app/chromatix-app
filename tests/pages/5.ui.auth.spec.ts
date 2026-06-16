// Generated using GitHub Copilot

import { test } from '@playwright/test';
import { waitForContent, snapshotAtViewports, PAGE_NAV_DELAY_MS } from '../utils';

test.describe('ui interactions match snapshots', () => {
  test('user menu matches snapshot when open', async ({ page }) => {
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto('/');
    await waitForContent(page);

    await page.locator('[class*="status"]').first().click();
    await page.waitForSelector('[class*="menu"]', { state: 'visible' });

    await snapshotAtViewports(page, '001-user-menu-open');
  });

  test('sidebar search matches snapshot with results', async ({ page }) => {
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto('/');
    await waitForContent(page);

    await page.locator('[class*="searchInput"] input').fill('guns n roses');
    await page.waitForSelector('[class*="searchPopover"]', { state: 'visible' });
    await page.waitForSelector('[class*="searchPopover"] a', { state: 'visible' });

    await snapshotAtViewports(page, '002-sidebar-search');
  });

  test('album playback matches snapshot when paused', async ({ page }) => {
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto('/libraries/20/albums/164346');
    await waitForContent(page);

    // Press play
    await page.locator('[class*="playButton"]').first().click();

    // Wait for playback to start
    await page.waitForFunction(() => (window as any).store.getState().playerModel.playerPlaying === true, {
      timeout: 15000,
    });

    // Pause
    await page.evaluate(() => (window as any).store.dispatch.playerModel.playerPause());

    // Wait for the UI to settle
    await page.waitForTimeout(1500);

    await snapshotAtViewports(page, '003-album-playback-paused');

    // Open the queue
    await page.locator('[class*="queue"]').click();
    await snapshotAtViewports(page, '004-album-playback-queue');

    // Close the queue, then open the expanded view
    await page.locator('[class*="queue"]').click();
    await page.locator('[class*="expand"]').click();
    await snapshotAtViewports(page, '005-album-playback-expanded');
  });
});
