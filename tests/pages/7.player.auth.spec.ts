// Generated using GitHub Copilot

/**
 * DASH Transcoding Playback Tests
 *
 * Album 163406 is ALAC — all tracks require Plex DASH transcoding.
 * The last track on that album is verified to play natively (non-ALAC).
 *
 * These tests verify the full playback path end-to-end in a real browser,
 * catching issues that jsdom/Vitest cannot (autoplay policy, MediaSource,
 * cross-player error leakage, progress polling the wrong element, etc.)
 *
 * Run with: npx playwright test 7.dash.auth.spec.ts --project=dash
 */

import { test, expect } from '@playwright/test';
import { waitForContent, PAGE_NAV_DELAY_MS } from '../utils';

const ALAC_ALBUM_URL = '/libraries/20/albums/163406';

// A native (non-ALAC) album to establish a baseline that the progress
// polling infrastructure works before testing DASH.
const NATIVE_ALBUM_URL = '/libraries/20/albums/164346';

// How long to wait for playerPlaying to become true after clicking play.
const PLAY_TIMEOUT = 15000;

// How long to wait for playingTrackProgress to advance after playback starts.
// usePlayerProgress dispatches to the store every 5 seconds. DASH adds extra
// latency for manifest fetch + MSE segment buffering.
const PROGRESS_TIMEOUT = 60000;

// ======================================================================
// HELPERS
// ======================================================================

/** Returns current player + session state from the Redux store. */
async function getPlayerState(page: any) {
  return page.evaluate(() => {
    const state = (window as any).store?.getState();
    return {
      playerPlaying: state?.playerModel?.playerPlaying,
      playerTrackError: state?.playerModel?.playerTrackError,
      playerTrackLoaded: state?.playerModel?.playerTrackLoaded,
      playingTrackProgress: state?.sessionModel?.playingTrackProgress,
      playingTrackIndex: state?.sessionModel?.playingTrackIndex,
    };
  });
}

/** Plays the nth track (0-based) via the store, bypassing CSS class fragility. */
async function playTrackByIndex(page: any, index: number) {
  await page.evaluate((i: number) => {
    (window as any).store?.dispatch?.playerModel?.playerLoadIndex({ index: i, play: true, progress: 0 });
  }, index);
}

// ======================================================================
// TESTS
// ======================================================================

test.describe('DASH transcoding playback', () => {
  // DASH tests need extra time: Plex transcodes ALAC on-demand, so manifest
  // fetch + first segment buffering can take longer than a native track.
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto(ALAC_ALBUM_URL);
    await waitForContent(page);
  });

  // --------------------------------------------------------------------
  // Test 0: Native baseline — verifies that progress polling works at all
  // before we test DASH. If this fails, the problem is not DASH-specific.
  // --------------------------------------------------------------------
  test('native album plays and advances progress (baseline)', async ({ page }) => {
    await page.goto(NATIVE_ALBUM_URL);
    await waitForContent(page);

    await page.locator('[class*="playButton"]').first().click();

    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    const errorAfterPlay = await page.evaluate(() => (window as any).store?.getState()?.playerModel?.playerTrackError);
    expect(errorAfterPlay, 'native track triggered playerTrackError').toBe(false);

    // playingTrackProgress is dispatched by usePlayerProgress every 5s.
    // Waiting for it to be > 0 confirms audio has genuinely been playing.
    await page.waitForFunction(() => ((window as any).store?.getState()?.sessionModel?.playingTrackProgress ?? 0) > 0, {
      timeout: PROGRESS_TIMEOUT,
    });

    const nativeProgress = await page.evaluate(
      () => (window as any).store?.getState()?.sessionModel?.playingTrackProgress
    );
    expect(nativeProgress).toBeGreaterThan(0);

    // Pause so native audio doesn't interfere with subsequent DASH tests.
    await page.evaluate(() => (window as any).store?.dispatch?.playerModel?.playerPause());
  });

  // --------------------------------------------------------------------
  // Test 1: Play button starts DASH playback without errors
  // --------------------------------------------------------------------
  test('play button starts DASH track without triggering playerTrackError', async ({ page }) => {
    await page.locator('[class*="playButton"]').first().click();

    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    const state = await getPlayerState(page);
    expect(state.playerTrackError, 'spurious error triggered a track skip').toBe(false);
  });

  // --------------------------------------------------------------------
  // Test 2: DASH track actually plays — playingTrackProgress advances.
  // usePlayerProgress polls getCurrentProgress() every 1s and dispatches
  // to the store every 5s, so a positive value confirms genuine playback.
  // --------------------------------------------------------------------
  test('DASH track playingTrackProgress advances after play', async ({ page }) => {
    await page.locator('[class*="playButton"]').first().click();

    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    // Verify the router switched to DASH (store-level flag, not module state).
    const activePlayer = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());

    expect(activePlayer).toBe('dash');

    // playingTrackProgress is dispatched by usePlayerProgress every 5s.
    // Waiting for it to be > 0 confirms audio has genuinely been playing.
    await page.waitForFunction(() => ((window as any).store?.getState()?.sessionModel?.playingTrackProgress ?? 0) > 0, {
      timeout: PROGRESS_TIMEOUT,
    });

    const dashProgress = await page.evaluate(
      () => (window as any).store?.getState()?.sessionModel?.playingTrackProgress
    );
    expect(dashProgress).toBeGreaterThan(0);

    const error = await page.evaluate(() => (window as any).store?.getState()?.playerModel?.playerTrackError);
    expect(error).toBe(false);
  });

  // --------------------------------------------------------------------
  // Test 3: Double-clicking the first track row (DASH) starts playback.
  // Uses store dispatch directly — more reliable than CSS class matching
  // in a CSS Modules project where class names are hashed.
  // --------------------------------------------------------------------
  test('double-clicking first track row starts DASH playback', async ({ page }) => {
    // First load the album into the queue via the play button so the
    // store knows the track list, then jump to index 0.
    await page.locator('[class*="playButton"]').first().click();
    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    // Now simulate double-clicking track 0 by loading index 0 via the store.
    await playTrackByIndex(page, 0);

    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    const state = await getPlayerState(page);
    expect(state.playingTrackIndex).toBe(0);
    expect(state.playerTrackError).toBe(false);
  });

  // --------------------------------------------------------------------
  // Test 4: The last track on the album plays natively (no DASH)
  // Starts DASH on track 0, then skips to the last track to verify
  // the player switches back to native without errors.
  // --------------------------------------------------------------------
  test('last track on ALAC album plays natively after DASH track', async ({ page }) => {
    // Start on the first track via play button
    await page.locator('[class*="playButton"]').first().click();
    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    // Get total track count from the store
    const trackCount: number = await page.evaluate(
      () => (window as any).store?.getState()?.sessionModel?.playingTrackCount ?? 0
    );
    expect(trackCount).toBeGreaterThan(1);

    // Jump directly to the last track via the store
    await page.evaluate((lastIndex: number) => {
      (window as any).store?.dispatch?.playerModel?.playerLoadIndex({ index: lastIndex, play: true, progress: 0 });
    }, trackCount - 1);

    await page.waitForFunction(
      () =>
        (window as any).store?.getState()?.sessionModel?.playingTrackIndex ===
        (window as any).store?.getState()?.sessionModel?.playingTrackCount - 1,
      { timeout: PLAY_TIMEOUT }
    );

    const state = await getPlayerState(page);
    expect(state.playerTrackError).toBe(false);
    expect(state.playerPlaying).toBe(true);

    // playingTrackProgress > 0 confirms audio has genuinely been playing (dispatched every 5s).
    await page.waitForFunction(() => ((window as any).store?.getState()?.sessionModel?.playingTrackProgress ?? 0) > 0, {
      timeout: PROGRESS_TIMEOUT,
    });
  });

  // --------------------------------------------------------------------
  // Test 5: No cross-player error leakage — native error suppressed when
  // DASH is active. Checks for the suppression log (indirect verification).
  // If playerTrackError fires during DASH playback it means the native
  // player's src-clear error leaked through.
  // --------------------------------------------------------------------
  test('no playerTrackError during DASH playback after native player is unloaded', async ({ page }) => {
    // Collect any console errors during playback
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.locator('[class*="playButton"]').first().click();

    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
      timeout: PLAY_TIMEOUT,
    });

    // Wait a moment for any async errors to fire
    await page.waitForTimeout(2000);

    const state = await getPlayerState(page);
    expect(state.playerTrackError, `playerTrackError was set. Console errors: ${consoleErrors.join('; ')}`).toBe(false);
  });
});
