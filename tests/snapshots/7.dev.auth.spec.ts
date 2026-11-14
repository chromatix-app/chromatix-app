// Tests generated using AI

import { test } from '@playwright/test';
import { snapshotPage } from '../utils';

test.describe('dev pages match snapshots', () => {
  test('components page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/dev/components`, '001-components', { fullContent: true });
  });

  test('icons page matches snapshot', async ({ page }) => {
    await snapshotPage(page, `/dev/icons`, '002-icons', { fullContent: true });
  });
});
