// Tests generated using AI

import { test, Page } from '@playwright/test';
import { waitForContent, snapshotAtViewports, PAGE_NAV_DELAY_MS } from '../utils';

/** Injects Electron window globals before the page loads, simulating a Windows Electron build. */
async function injectElectronWindows(page: Page) {
  await page.addInitScript(() => {
    (window as any).isElectron = true;
    (window as any).electronProcess = {
      appVersion: '999.9.9',
      buildDate: '1735689600', // 2026-01-01 00:00:00 UTC
      platform: 'win32',
    };
  });
}

const ELECTRON_MENU = [
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    label: 'Window',
    submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
  },
  {
    label: 'Advanced',
    submenu: [
      {
        label: 'Allow Insecure Connections (Not Recommended)',
        type: 'checkbox',
        checked: true,
      },
    ],
  },
];

/** Sets electronMenu in the app store after page load. */
async function setElectronMenu(page: Page) {
  await page.evaluate((menu) => {
    (window as any).store.dispatch.appModel.setAppState({ electronMenu: menu });
  }, ELECTRON_MENU);
}

test.describe('windows (electron simulation) pages match snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await injectElectronWindows(page);
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto('/');
    await waitForContent(page);
    await setElectronMenu(page);
  });

  test('homepage matches snapshot', async ({ page }) => {
    await snapshotAtViewports(page, '001-homepage');
  });

  test('user menu matches snapshot when open', async ({ page }) => {
    await page.locator('[class*="status"]').first().click();
    await page.waitForSelector('[class*="menu"]', { state: 'visible' });
    await snapshotAtViewports(page, '002-user-menu-open');
  });

  test('electron menu matches snapshot when open', async ({ page }) => {
    await page.locator('[class*="trigger"]').first().click();
    await page.waitForSelector('[class*="content"]', { state: 'visible' });
    await snapshotAtViewports(page, '003-electron-menu-open');
  });
});
