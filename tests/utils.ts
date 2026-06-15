// Generated using GitHub Copilot

import { expect, Page } from '@playwright/test';

/** Viewport widths used for snapshot tests. */
export const SNAPSHOT_VIEWPORTS = [768, 1024, 1440];

/** Milliseconds to wait after a viewport resize to allow JS resize hooks to settle. */
export const VIEWPORT_SETTLE_MS = 200;

/** Milliseconds to wait before each page navigation to avoid server rate limiting. */
export const PAGE_NAV_DELAY_MS = 2000;

/** Sets the viewport size and waits for JS resize hooks to settle. */
export async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(VIEWPORT_SETTLE_MS);
}

/** Navigates to a URL, waits for content, and takes snapshots at each viewport width. */
export async function snapshotPage(page: Page, url: string, name: string, viewports = SNAPSHOT_VIEWPORTS) {
  await page.waitForTimeout(PAGE_NAV_DELAY_MS);
  await page.goto(url);
  await page.waitForURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 15000 });
  await waitForContent(page);
  await page.mouse.move(0, 0);
  for (const width of viewports) {
    await setViewport(page, width, 1100);
    await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true, maxDiffPixelRatio: 0 });
  }
}

/** Waits for loading indicators to clear, network to idle, and all images to load. Also checks for rate limiting. */
export async function waitForContent(page: Page) {
  await page.waitForSelector('[class*="loading"]', { state: 'hidden', timeout: 15000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() =>
    [...document.querySelectorAll('img')].every((img) => (img as HTMLImageElement).complete)
  );
  await checkForRateLimit(page);
}

/** Throws and aborts the test run if the page shows a rate-limit error. */
export async function checkForRateLimit(page: Page) {
  const hasError = await page.locator('body').evaluate((el) => el.textContent?.includes('Oops!') ?? false);
  if (hasError) {
    throw new Error('Rate limit hit — page contains "Oops!". Aborting test run.');
  }
}
