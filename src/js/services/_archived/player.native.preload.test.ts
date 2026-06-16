// Generated using GitHub Copilot

/**
 * Player Service Test Suite
 *
 * Validates the dual audio element player with preloading (A/B switching).
 * Each test reimports the module fresh so module-level state is fully zeroed.
 * The VITE_ENV=local flag (set in vite.config.ts test.env) enables preloading.
 *
 * Mock audio elements are captured at createElement time so tests can inspect
 * their state (src, currentTime, volume, paused) directly.
 */

import { MockHTMLAudioElement } from '../../../__mocks__/HTMLAudioElement';

// ======================================================================
// HELPERS
// ======================================================================

/**
 * Reimports player.native with fresh module state.
 * Must be called inside beforeEach after vi.resetModules().
 */
async function freshPlayer() {
  const mod = await import('./player.native');
  return mod;
}

type Player = Awaited<ReturnType<typeof freshPlayer>>;

// Captured mock elements — reset alongside the module.
let createdElements: MockHTMLAudioElement[] = [];

// ======================================================================
// GLOBAL SETUP
// ======================================================================

const originalCreateElement = document.createElement.bind(document);

global.document.createElement = (tagName: string) => {
  if (tagName.toLowerCase() === 'audio') {
    const el = new MockHTMLAudioElement();
    createdElements.push(el);
    return el as any;
  }
  return originalCreateElement(tagName);
};

global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0)) as unknown as typeof requestAnimationFrame;

// ======================================================================
// TESTS
// ======================================================================

describe('Player Service', () => {
  let player: Player;

  const mockCallbacks = {
    onLoadStart: vi.fn(),
    onCanPlay: vi.fn(),
    onEnded: vi.fn(),
    onError: vi.fn(),
  };

  const defaultInit = () =>
    player.init({
      volumeLevel: 75,
      volumeMuted: false,
      ...mockCallbacks,
    });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    createdElements = [];
    player = await freshPlayer();
  });

  // Convenience accessors — after init(), elements are always [A, B].
  const elementA = () => createdElements[0];
  const elementB = () => createdElements[1];

  // ======================================================================
  // INITIALISATION
  // ======================================================================

  describe('Initialisation', () => {
    test('creates two audio elements on first init', () => {
      defaultInit();
      expect(createdElements).toHaveLength(2);
    });

    test('sets volume correctly on both elements (unmuted)', () => {
      player.init({ volumeLevel: 60, volumeMuted: false, ...mockCallbacks });
      expect(elementA().volume).toBe(0.6);
      expect(elementB().volume).toBe(0.6);
    });

    test('sets volume to 0 on both elements when muted', () => {
      player.init({ volumeLevel: 80, volumeMuted: true, ...mockCallbacks });
      expect(elementA().volume).toBe(0);
      expect(elementB().volume).toBe(0);
    });

    test('does not create new elements on a second init call', () => {
      defaultInit();
      defaultInit();
      expect(createdElements).toHaveLength(2);
    });

    test('registers loadstart, canplay, ended, and error listeners on both elements', () => {
      defaultInit();
      // Each MockHTMLAudioElement exposes eventListeners via the internal map.
      // Trigger events on element A and verify the callbacks fire.
      (elementA() as any).mockTriggerEvent('loadstart');
      expect(mockCallbacks.onLoadStart).toHaveBeenCalledTimes(1);

      (elementA() as any).mockTriggerEvent('canplay');
      expect(mockCallbacks.onCanPlay).toHaveBeenCalledTimes(1);

      (elementA() as any).mockTriggerEvent('ended');
      expect(mockCallbacks.onEnded).toHaveBeenCalledTimes(1);

      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
    });

    test('registers listeners on element B too', () => {
      defaultInit();
      (elementB() as any).mockTriggerEvent('ended');
      expect(mockCallbacks.onEnded).toHaveBeenCalledTimes(1);
    });

    test('returns 0 for progress and duration before init', () => {
      expect(player.getCurrentProgress()).toBe(0);
      expect(player.getCurrentDuration()).toBe(0);
    });
  });

  // ======================================================================
  // TRACK LOADING
  // ======================================================================

  describe('Track Loading', () => {
    beforeEach(() => defaultInit());

    test('sets src on the active element', () => {
      player.loadTrack('http://example.com/track1.mp3');
      expect(elementA().src).toBe('http://example.com/track1.mp3');
    });

    test('starts playback by default', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      // play() is async in the mock; give the micro-task queue a tick
      await Promise.resolve();
      expect(elementA().paused).toBe(false);
    });

    test('does not play when play=false', async () => {
      player.loadTrack('http://example.com/track1.mp3', 0, false);
      await Promise.resolve();
      expect(elementA().paused).toBe(true);
    });

    test('seeks to the correct position when progress is provided', () => {
      player.loadTrack('http://example.com/track1.mp3', 30000);
      // 30 000 ms → 30 s
      expect(elementA().currentTime).toBe(30);
    });

    test('does not seek when progress is 0', () => {
      player.loadTrack('http://example.com/track1.mp3', 0);
      expect(elementA().currentTime).toBe(0);
    });

    test('pauses the inactive element when loading a new track', async () => {
      // Load track1 on A, it starts playing
      player.loadTrack('http://example.com/track1.mp3');
      await Promise.resolve();
      expect(elementA().paused).toBe(false);

      // Simulate B being active (e.g. from a prior preload switch) so the
      // explicit otherPlayer.pause() call in loadTrack is meaningfully tested.
      (elementB() as any).paused = false;

      // Load track2 — still on A (no preload switch). B must be explicitly paused.
      player.loadTrack('http://example.com/track2.mp3');
      expect(elementB().paused).toBe(true);
    });
  });

  // ======================================================================
  // UNLOAD
  // ======================================================================

  describe('Unload', () => {
    test('clears src on both elements', () => {
      defaultInit();
      player.loadTrack('http://example.com/track1.mp3');
      player.unload();
      expect(elementA().src).toBe('');
      expect(elementB().src).toBe('');
    });

    test('pauses both elements', async () => {
      defaultInit();
      player.loadTrack('http://example.com/track1.mp3');
      await Promise.resolve();
      player.unload();
      expect(elementA().paused).toBe(true);
      expect(elementB().paused).toBe(true);
    });

    test('can be called before init without throwing', () => {
      expect(() => player.unload()).not.toThrow();
    });

    test('can be called multiple times without throwing', () => {
      defaultInit();
      player.unload();
      expect(() => player.unload()).not.toThrow();
    });

    test('resets preload state so updateProgress does nothing afterwards', () => {
      defaultInit();
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.unload();

      // After unload nextTrackSrc is null — updateProgress should be a no-op
      const srcBefore = elementB().src;
      player.updateProgress(90000);
      expect(elementB().src).toBe(srcBefore);
    });
  });

  // ======================================================================
  // PLAYBACK CONTROLS
  // ======================================================================

  describe('Playback Controls', () => {
    beforeEach(() => {
      defaultInit();
      player.loadTrack('http://example.com/track1.mp3');
    });

    test('pause() pauses the active element', async () => {
      await Promise.resolve();
      expect(elementA().paused).toBe(false);
      player.pause();
      expect(elementA().paused).toBe(true);
    });

    test('resume() unpauses the active element', async () => {
      await Promise.resolve();
      player.pause();
      expect(elementA().paused).toBe(true);
      player.resume();
      await Promise.resolve();
      expect(elementA().paused).toBe(false);
    });

    test('restart() resets currentTime to 0 and starts playing', async () => {
      player.setProgress(60000); // seek to 60 s
      expect(elementA().currentTime).toBe(60);
      player.restart();
      expect(elementA().currentTime).toBe(0);
      await Promise.resolve();
      expect(elementA().paused).toBe(false);
    });

    test('setProgress() converts ms to seconds on the active element', () => {
      player.setProgress(45000);
      expect(elementA().currentTime).toBe(45);
    });

    test('setProgress(0) seeks to start', () => {
      player.setProgress(50000);
      player.setProgress(0);
      expect(elementA().currentTime).toBe(0);
    });

    test('getCurrentProgress() returns currentTime of the active element in seconds', () => {
      player.setProgress(33000);
      expect(player.getCurrentProgress()).toBe(33);
    });

    test('getCurrentDuration() returns duration of the active element in seconds', () => {
      // MockHTMLAudioElement.duration = 100
      expect(player.getCurrentDuration()).toBe(100);
    });
  });

  // ======================================================================
  // VOLUME CONTROLS
  // ======================================================================

  describe('Volume Controls', () => {
    beforeEach(() => defaultInit());

    test('setVolume() applies to both elements as a fraction', () => {
      player.setVolume(50);
      expect(elementA().volume).toBe(0.5);
      expect(elementB().volume).toBe(0.5);
    });

    test('setVolume(0) silences both elements', () => {
      player.setVolume(0);
      expect(elementA().volume).toBe(0);
      expect(elementB().volume).toBe(0);
    });

    test('setVolume(100) sets both elements to full volume', () => {
      player.setVolume(100);
      expect(elementA().volume).toBe(1);
      expect(elementB().volume).toBe(1);
    });
  });

  // ======================================================================
  // CALLBACKS AND EVENTS
  // ======================================================================

  describe('Callbacks and Events', () => {
    beforeEach(() => defaultInit());

    test('onLoadStart fires when the active element emits loadstart', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      // MockHTMLAudioElement fires loadstart asynchronously via load()
      await new Promise((r) => setTimeout(r, 100));
      expect(mockCallbacks.onLoadStart).toHaveBeenCalled();
    });

    test('onCanPlay fires when the active element emits canplay', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      await new Promise((r) => setTimeout(r, 200));
      expect(mockCallbacks.onCanPlay).toHaveBeenCalled();
    });

    test('onEnded fires when the active element emits ended', () => {
      player.loadTrack('http://example.com/track1.mp3');
      (elementA() as any).mockTriggerEvent('ended');
      expect(mockCallbacks.onEnded).toHaveBeenCalledTimes(1);
    });

    test('onError fires with the correct playerElement when the active element errors', () => {
      player.loadTrack('http://example.com/track1.mp3');
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
      const callArg = mockCallbacks.onError.mock.calls[0][0];
      expect(callArg).toHaveProperty('event');
      expect(callArg).toHaveProperty('playerElement');
    });

    test('onError fires on element B when it errors (e.g. during preload)', () => {
      player.loadTrack('http://example.com/track1.mp3');
      (elementB() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
    });

    test('onLoadStart and onCanPlay fire on element B after it becomes the active player', async () => {
      // The active-player guard must allow events through on B once it is the current player.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');
      await new Promise((r) => setTimeout(r, 300));

      // Switch to B
      player.loadTrack('http://example.com/track2.mp3');
      await Promise.resolve();
      vi.clearAllMocks();

      // Load a new track on B (now the active element) — B's events must reach the callbacks
      player.loadTrack('http://example.com/track3.mp3');
      await new Promise((r) => setTimeout(r, 200));

      expect(mockCallbacks.onLoadStart).toHaveBeenCalled();
      expect(mockCallbacks.onCanPlay).toHaveBeenCalled();
    });
  });

  // ======================================================================
  // PRELOADING SYSTEM
  // ======================================================================

  describe('Preloading System', () => {
    beforeEach(() => defaultInit());

    test('setNextTrack() followed by updateProgress at 60% triggers preload on element B', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');

      // Mock duration is 100 s → 60 000 ms = 60%
      player.updateProgress(60000);

      // preloadNextTrack sets src on the inactive (B) element synchronously
      expect(elementB().src).toBe('http://example.com/track2.mp3');
    });

    test('setNextTrack() followed by updateProgress at 45 s remaining triggers preload', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');

      // 100 s track, 56 000 ms elapsed → 44 s remaining (< 45 s threshold)
      player.updateProgress(56000);

      expect(elementB().src).toBe('http://example.com/track2.mp3');
    });

    test('updateProgress below both thresholds does not trigger preload', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');

      // 30 000 ms = 30% of 100 s track, 70 s remaining — neither threshold met
      player.updateProgress(30000);

      expect(elementB().src).toBe('');
    });

    test('updateProgress without a next track set does not start preloading', () => {
      player.loadTrack('http://example.com/track1.mp3');
      // No setNextTrack() call
      player.updateProgress(90000);

      expect(elementB().src).toBe('');
    });

    test('clearNextTrack() and setNextTrack(null) both prevent updateProgress from triggering preload', () => {
      player.loadTrack('http://example.com/track1.mp3');

      player.setNextTrack('http://example.com/track2.mp3');
      player.clearNextTrack();
      player.updateProgress(90000);
      expect(elementB().src).toBe('');

      player.setNextTrack('http://example.com/track2.mp3');
      player.setNextTrack(null);
      player.updateProgress(90000);
      expect(elementB().src).toBe('');
    });

    test('preloadNextTrack() is a no-op while already preloading (idempotent)', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Second call while isPreloading=true should not reassign src
      const srcAfterFirst = elementB().src;
      player.preloadNextTrack('http://example.com/track3.mp3');
      expect(elementB().src).toBe(srcAfterFirst);
    });

    test('full flow: updateProgress triggers preload, preload completes, loadTrack switches to element B', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');

      // Trigger preloading via progress threshold (60% of 100 s mock track)
      player.updateProgress(60000);

      // B should have been assigned the next track src immediately
      expect(elementB().src).toBe('http://example.com/track2.mp3');

      // Wait for mock's async canplaythrough to fire (50 + 100 + 100 ms = 250 ms)
      await new Promise((r) => setTimeout(r, 300));

      // loadTrack detects the preloaded src and switches to B
      player.loadTrack('http://example.com/track2.mp3');
      await Promise.resolve();

      expect(elementB().paused).toBe(false); // B is now the active player
      expect(elementA().paused).toBe(true); // A was paused on switch
      expect(player.getCurrentDuration()).toBe(100); // reads now come from B
    });

    test('after preload completes, loading the preloaded track switches to element B', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Wait for mock's async canplaythrough to fire (50 + 100 + 100 ms = 250 ms)
      await new Promise((r) => setTimeout(r, 300));

      player.loadTrack('http://example.com/track2.mp3');
      await Promise.resolve();

      expect(player.getCurrentDuration()).toBe(100); // reads now come from B
      expect(elementA().paused).toBe(true);
    });

    test('preload switch seeks to the correct position when progress is provided', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');
      await new Promise((r) => setTimeout(r, 300));

      player.loadTrack('http://example.com/track2.mp3', 30000);
      await Promise.resolve();

      expect(elementB().currentTime).toBe(30);
    });

    test('preload switch does not start playback when play=false', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');
      await new Promise((r) => setTimeout(r, 300));

      player.loadTrack('http://example.com/track2.mp3', 0, false);
      await Promise.resolve();

      expect(elementB().paused).toBe(true);
    });

    test('when preloaded track is not yet ready, falls back to regular load on current element', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Immediately load before the async canplaythrough event fires —
      // isNextTrackPreloaded is still false, so loadTrack falls back to regular loading on A.
      player.loadTrack('http://example.com/track2.mp3');

      expect(elementA().src).toBe('http://example.com/track2.mp3');
    });

    test('after a preload switch, a subsequent preload uses the now-idle element A', async () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');
      await new Promise((r) => setTimeout(r, 300));

      // Switch to track2 on element B — A is now the idle element
      player.loadTrack('http://example.com/track2.mp3');

      player.setNextTrack('http://example.com/track3.mp3');
      player.preloadNextTrack('http://example.com/track3.mp3');

      expect(elementA().src).toBe('http://example.com/track3.mp3');
    });

    test('unload resets preload state — updateProgress does nothing afterwards', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.unload();

      player.updateProgress(90000);
      expect(elementB().src).toBe('');
    });

    test('a preload error unblocks future preloads via updateProgress', () => {
      // A network error on the idle element must reset isPreloading so that
      // subsequent updateProgress calls can start a new preload.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      (elementB() as any).mockTriggerError({});

      player.setNextTrack('http://example.com/track3.mp3');
      player.updateProgress(90000);

      expect(elementB().src).toBe('http://example.com/track3.mp3');
    });

    test('changing nextTrack mid-preload does not cause the stale preloaded track to play', async () => {
      // If nextTrackSrc changes while a preload is in flight, the canplaythrough
      // completing for the old track must not cause loadTrack to switch to an
      // element that has the wrong content.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Next track changes mid-preload (e.g. shuffle or repeat toggle)
      player.setNextTrack('http://example.com/track7.mp3');

      // Preload for track2 completes on B — B has track2, nextTrackSrc is now track7
      await new Promise((r) => setTimeout(r, 300));

      // loadTrack must load track7 on A, not switch to B which has track2
      player.loadTrack('http://example.com/track7.mp3');
      await Promise.resolve();

      expect(elementA().src).toBe('http://example.com/track7.mp3');
    });

    test('changing nextTrack mid-preload allows updateProgress to preload the new next track', async () => {
      // The stale canplaythrough completing must not leave isNextTrackPreloaded=true
      // (blocking updateProgress) for a track that is no longer next.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Queue changes before preload finishes — this must invalidate the in-flight preload
      player.setNextTrack('http://example.com/track7.mp3');

      // Stale canplaythrough fires for track2 — must be a no-op
      await new Promise((r) => setTimeout(r, 300));

      // updateProgress must now trigger a fresh preload for track7, not be blocked
      player.updateProgress(90000);

      expect(elementB().src).toBe('http://example.com/track7.mp3');
    });

    test('skipping while a preload is in flight resets state so the next updateProgress triggers a fresh preload', () => {
      // When loadTrack falls back to regular loading, it must reset isPreloading
      // so that updateProgress is not blocked for the duration of the abandoned download.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // User skips — preload not ready, falls back to loading track3 on A
      player.loadTrack('http://example.com/track3.mp3');
      expect(elementA().src).toBe('http://example.com/track3.mp3');

      player.setNextTrack('http://example.com/track4.mp3');
      player.updateProgress(90000);

      expect(elementB().src).toBe('http://example.com/track4.mp3');
    });

    test('falling back to regular loading aborts the in-flight preload so a subsequent loadTrack is not corrupted', async () => {
      // When loadTrack falls back, the abandoned preload's canplaythrough completing
      // must not set isNextTrackPreloaded for a track that is no longer on the idle element.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Preload not ready — falls back to loading track2 on A
      player.loadTrack('http://example.com/track2.mp3');
      expect(elementA().src).toBe('http://example.com/track2.mp3');

      // models.player.js sets next track after every loadTrack call
      player.setNextTrack('http://example.com/track3.mp3');

      // B's abandoned download completes
      await new Promise((r) => setTimeout(r, 300));

      // track3 must load on A normally, not switch to B which has track2
      player.loadTrack('http://example.com/track3.mp3');
      await Promise.resolve();

      expect(elementA().src).toBe('http://example.com/track3.mp3');
    });

    test('onLoadStart and onCanPlay do not fire when the idle element is buffering in the background', async () => {
      // These callbacks drive UI state (spinner, enable controls) — they must only
      // fire for the active player element, not for background preloading on B.
      player.loadTrack('http://example.com/track1.mp3');

      // Wait for A's own loadstart and canplay to settle, then reset
      await new Promise((r) => setTimeout(r, 200));
      vi.clearAllMocks();

      player.setNextTrack('http://example.com/track2.mp3');
      player.updateProgress(60000);

      // Wait for B's async loadstart and canplay to fire
      await new Promise((r) => setTimeout(r, 200));

      expect(mockCallbacks.onLoadStart).not.toHaveBeenCalled();
      expect(mockCallbacks.onCanPlay).not.toHaveBeenCalled();
    });

    test('stale { once } listeners from an abandoned preload do not corrupt the next preload', async () => {
      // If a preload is abandoned before canplaythrough fires, the { once } listener
      // remains on the idle element. When the next preload's canplaythrough fires,
      // the stale listener must be a no-op so the fresh preload can switch cleanly.
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.preloadNextTrack('http://example.com/track2.mp3');

      // Abandon before canplaythrough fires
      player.unload();

      player.loadTrack('http://example.com/track3.mp3');
      player.setNextTrack('http://example.com/track4.mp3');
      player.preloadNextTrack('http://example.com/track4.mp3');

      // Both the stale (track2) and fresh (track4) listeners fire — stale must be a no-op
      await new Promise((r) => setTimeout(r, 300));

      player.loadTrack('http://example.com/track4.mp3');
      await Promise.resolve();

      expect(elementA().paused).toBe(true); // A (track3) paused on switch
      expect(elementB().paused).toBe(false); // B (track4) is now the active player
    });
  });

  // ======================================================================
  // MULTI-TRACK STATE MANAGEMENT
  // ======================================================================

  describe('Multi-track State Management', () => {
    beforeEach(() => defaultInit());

    test('loading sequential tracks updates src correctly each time', () => {
      player.loadTrack('http://example.com/track1.mp3');
      expect(elementA().src).toBe('http://example.com/track1.mp3');

      player.loadTrack('http://example.com/track2.mp3');
      expect(elementA().src).toBe('http://example.com/track2.mp3');

      player.loadTrack('http://example.com/track3.mp3');
      expect(elementA().src).toBe('http://example.com/track3.mp3');
    });

    test('getCurrentProgress() returns 0 after unload', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setProgress(30000);
      expect(player.getCurrentProgress()).toBe(30); // confirm position was set
      player.unload();
      // unload() calls element.load(), which resets currentTime to 0 (matching real browser behaviour)
      expect(player.getCurrentProgress()).toBe(0);
    });

    test('rapid setNextTrack calls only keep the last value', () => {
      player.loadTrack('http://example.com/track1.mp3');
      player.setNextTrack('http://example.com/track2.mp3');
      player.setNextTrack('http://example.com/track3.mp3');
      player.setNextTrack('http://example.com/track4.mp3');

      // Only the last next track should be preloaded
      player.updateProgress(90000);
      expect(elementB().src).toBe('http://example.com/track4.mp3');
    });
  });

  // ======================================================================
  // EDGE CASES
  // ======================================================================

  describe('Edge Cases', () => {
    test('all controls are safe to call before init (no throw)', () => {
      expect(() => player.pause()).not.toThrow();
      expect(() => player.resume()).not.toThrow();
      expect(() => player.restart()).not.toThrow();
      expect(() => player.setVolume(50)).not.toThrow();
      expect(() => player.setProgress(30000)).not.toThrow();
      expect(() => player.updateProgress(60000)).not.toThrow();
      expect(() => player.setNextTrack('http://example.com/track.mp3')).not.toThrow();
      expect(() => player.clearNextTrack()).not.toThrow();
      expect(player.getCurrentProgress()).toBe(0);
      expect(player.getCurrentDuration()).toBe(0);
    });

    test('loadTrack with empty string src is handled without throwing', () => {
      defaultInit();
      expect(() => player.loadTrack('')).not.toThrow();
      expect(elementA().src).toBe('');
    });

    test('setProgress with a negative value is passed through to the element', () => {
      defaultInit();
      player.loadTrack('http://example.com/track1.mp3');
      // The player does no bounds-checking; the browser would clamp it.
      // Verify no throw and the value is set.
      player.setProgress(-5000);
      expect(elementA().currentTime).toBe(-5);
    });

    test('updateProgress with zero duration is a no-op', () => {
      defaultInit();
      // Do not call loadTrack — mock duration defaults to 100; override it to 0.
      (elementA() as any).duration = 0;
      player.setNextTrack('http://example.com/track2.mp3');
      player.updateProgress(60000);
      // B should remain untouched
      expect(elementB().src).toBe('');
    });
  });
});
