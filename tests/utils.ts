// Tests generated using AI

import { expect, Page } from '@playwright/test';
import { readFileSync } from 'fs';
import { AUTH_LIBRARY_ID_FILE } from './paths';

/** Reads the library ID saved by the session setup. */
export function readLibraryId(): string {
  try {
    return JSON.parse(readFileSync(AUTH_LIBRARY_ID_FILE, 'utf-8')).libraryId;
  } catch {
    throw new Error('library-id.json not found — the session setup should create it; run `npm run test:login` first');
  }
}

/** Viewport widths used for snapshot tests. */
export const SNAPSHOT_VIEWPORTS = [768, 1024, 1440];

/** Viewport height used for snapshot tests. */
export const SNAPSHOT_HEIGHT = 1100;

/** Default snapshot options applied to all toHaveScreenshot calls. */
export const SNAPSHOT_OPTIONS = { fullPage: true, maxDiffPixelRatio: 0 } as const;

/** Milliseconds to wait after a viewport resize to allow JS resize hooks to settle. */
export const VIEWPORT_SETTLE_MS = 200;

/** Milliseconds to wait before each page navigation to avoid server rate limiting. */
export const PAGE_NAV_DELAY_MS = 2000;

/** Sets the viewport size and waits for JS resize hooks to settle. */
export async function setViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(VIEWPORT_SETTLE_MS);
}

/** Options for snapshot helpers. */
export type SnapshotOptions = {
  viewports?: number[];
  /** Grows the viewport so the scrolling `#content` area is captured in full. */
  fullContent?: boolean;
};

/** Grows the viewport height by however far `#content` overflows, so it no longer scrolls. */
export async function expandViewportToContent(page: Page, width: number) {
  const overflow = await page.locator('#content').evaluate((el) => el.scrollHeight - el.clientHeight);
  if (overflow > 0) {
    await setViewport(page, width, SNAPSHOT_HEIGHT + overflow);
  }
}

/** Moves the mouse away, then takes a snapshot at each viewport width. */
export async function snapshotAtViewports(
  page: Page,
  name: string,
  { viewports = SNAPSHOT_VIEWPORTS, fullContent = false }: SnapshotOptions = {}
) {
  await page.mouse.move(0, 0);
  for (const width of viewports) {
    await setViewport(page, width, SNAPSHOT_HEIGHT);
    if (fullContent) {
      await expandViewportToContent(page, width);
    }
    await expect(page).toHaveScreenshot(`${name}-${width}.png`, SNAPSHOT_OPTIONS);
  }
}

/** Navigates to a URL, waits for content, and takes snapshots at each viewport width. */
export async function snapshotPage(page: Page, url: string, name: string, options: SnapshotOptions = {}) {
  await page.waitForTimeout(PAGE_NAV_DELAY_MS);
  await page.goto(url);
  await page.waitForURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 15000 });
  await waitForContent(page);
  await snapshotAtViewports(page, name, options);
}

/** Selector for the user/server/library choices on the setup pages. */
const SETUP_OPTION_SELECTOR = 'main button[type="button"]';

/** Clears session state (user/server/library) but keeps the Plex auth token, then reloads `/`. */
export async function clearSessionState(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('chromatix-session'))
      .forEach((key) => localStorage.removeItem(key));
  });
  await page.goto('/');
}

/** Waits for a setup page (users/servers/libraries) to load with its choices visible. */
export async function waitForSetupPage(page: Page, urlPattern: RegExp) {
  await page.waitForURL(urlPattern, { timeout: 15000 });
  await page.waitForSelector(SETUP_OPTION_SELECTOR, { state: 'visible' });
  await waitForContent(page);
}

/** Picks the first choice on a setup page. */
export async function pickFirstSetupOption(page: Page) {
  await page.locator(SETUP_OPTION_SELECTOR).first().click();
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
