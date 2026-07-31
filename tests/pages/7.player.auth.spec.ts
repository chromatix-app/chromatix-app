// Tests generated using AI

/**
 * Player Playback Tests
 *
 * Playlist 168557 contains a mix of native and DASH-transcoded codecs.
 * Track 7 is a corrupted MP3 used to verify error handling and auto-advance.
 *
 * These tests verify the full playback path end-to-end in a real browser,
 * catching issues that jsdom/Vitest cannot (autoplay policy, MediaSource,
 * cross-player error leakage, progress polling the wrong element, etc.)
 *
 * Run with: npx playwright test 7.player.auth.spec.ts --project=player
 */

import { test, expect } from '@playwright/test';
import { waitForContent, PAGE_NAV_DELAY_MS } from '../utils';

const PLAYLIST_URL = '/libraries/20/playlists/168557';

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
      playingTrackProgress: state?.sessionModel?.playingTrackProgress,
      playingTrackIndex: state?.sessionModel?.playingTrackIndex,
    };
  });
}

/** Loads and plays the track at the given index (0-based) via the store. */
async function playTrackByIndex(page: any, index: number) {
  await page.evaluate((i: number) => {
    (window as any).store?.dispatch?.playerModel?.playerLoadIndex({ index: i, play: true, progress: 0 });
  }, index);
}

/** Waits for playerPlaying to become true. */
async function waitForPlaying(page: any) {
  await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerPlaying === true, {
    timeout: PLAY_TIMEOUT,
  });
}

/** Waits for playingTrackProgress to advance above zero (confirms genuine audio output). */
async function waitForProgress(page: any) {
  await page.waitForFunction(() => ((window as any).store?.getState()?.sessionModel?.playingTrackProgress ?? 0) > 0, {
    timeout: PROGRESS_TIMEOUT,
  });
}

/** Pauses playback via the store. */
async function pausePlayback(page: any) {
  await page.evaluate(() => (window as any).store?.dispatch?.playerModel?.playerPause());
}

// ======================================================================
// TESTS
// ======================================================================

test.describe('player playback', () => {
  // DASH tests need extra time: Plex transcodes ALAC on-demand, so manifest
  // fetch + first segment buffering can take longer than a native track.
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(PAGE_NAV_DELAY_MS);
    await page.goto(PLAYLIST_URL);
    await waitForContent(page);
    // Load the playlist into the queue via the play button, then immediately
    // pause — each test will jump to its own track via the store.
    await page.locator('[class*="playButton"]').first().click();
    await waitForPlaying(page);
    await pausePlayback(page);
  });

  // ======================================================================
  // Codec coverage: all track types that should play without error
  // ======================================================================

  const codecTracks: { track: number; codec: string; player: 'native' | 'dash' }[] = [
    { track: 1, codec: 'mp3', player: 'native' },
    { track: 2, codec: 'mp3', player: 'native' },
    { track: 3, codec: 'alac', player: 'dash' },
    { track: 4, codec: 'alac', player: 'dash' },
    { track: 8, codec: 'aac', player: 'native' },
    { track: 9, codec: 'aiff', player: 'dash' },
    { track: 10, codec: 'alac', player: 'dash' },
    { track: 11, codec: 'wav', player: 'native' },
    { track: 12, codec: 'flac', player: 'native' },
    { track: 13, codec: 'vorbis', player: 'native' },
    { track: 14, codec: 'opus', player: 'native' },
    { track: 15, codec: 'wma', player: 'dash' },
  ];

  for (const { track, codec, player } of codecTracks) {
    test(`track ${track} (${codec.toUpperCase()}) plays via ${player} player and progress advances`, async ({
      page,
    }) => {
      await playTrackByIndex(page, track - 1);
      await waitForPlaying(page);

      const activePlayer = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());
      expect(activePlayer).toBe(player);

      await waitForProgress(page);

      const state = await getPlayerState(page);
      expect(state.playerTrackError).toBe(false);
      expect(state.playingTrackIndex).toBe(track - 1);
    });
  }

  // ======================================================================
  // Native → DASH transition: switch from MP3 to ALAC mid-session
  // ======================================================================

  test('switching from native (MP3) to DASH (ALAC) works without errors', async ({ page }) => {
    await playTrackByIndex(page, 0);
    await waitForPlaying(page);

    const activePlayerBefore = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());
    expect(activePlayerBefore).toBe('native');

    await playTrackByIndex(page, 2);
    await waitForPlaying(page);

    const activePlayerAfter = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());
    expect(activePlayerAfter).toBe('dash');

    // Wait briefly for any async errors from the native player's src-clear to fire.
    await page.waitForTimeout(2000);

    const state = await getPlayerState(page);
    expect(state.playerTrackError).toBe(false);
  });

  // ======================================================================
  // DASH → Native transition: switch from ALAC back to MP3
  // ======================================================================

  test('switching from DASH (ALAC) to native (MP3) works without errors', async ({ page }) => {
    await playTrackByIndex(page, 2);
    await waitForPlaying(page);

    const activePlayerBefore = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());
    expect(activePlayerBefore).toBe('dash');

    await playTrackByIndex(page, 0);
    await waitForPlaying(page);

    const activePlayerAfter = await page.evaluate(() => (window as any).__playerX?.getActivePlayer());
    expect(activePlayerAfter).toBe('native');

    await page.waitForTimeout(2000);

    const state = await getPlayerState(page);
    expect(state.playerTrackError).toBe(false);
  });

  // ======================================================================
  // Track 7 (index 6): corrupted MP3 — errors and auto-advances to index 7
  // ======================================================================

  test('track 7 (corrupted MP3) triggers an error and auto-advances to next track', async ({ page }) => {
    await playTrackByIndex(page, 6);
    await waitForPlaying(page);

    // Wait for playerTrackError to become true (corrupted track triggers an error).
    await page.waitForFunction(() => (window as any).store?.getState()?.playerModel?.playerTrackError === true, {
      timeout: 10000,
    });

    // Wait for the player to auto-advance past the errored track.
    await page.waitForFunction(() => (window as any).store?.getState()?.sessionModel?.playingTrackIndex === 7, {
      timeout: 15000,
    });

    const state = await getPlayerState(page);
    expect(state.playingTrackIndex).toBe(7);
  });
});
