// Generated using GitHub Copilot

/**
 * DASH Player Service Test Suite
 *
 * Validates the dash.js-backed player. dash.js is fully mocked — these tests
 * cover the router logic, state management, and error suppression in
 * player.dash.ts without requiring a real browser or MediaSource API.
 *
 * Playwright tests (7.dash.auth.spec.ts) cover real DASH playback end-to-end.
 *
 * Each test reimports the module fresh so module-level state is fully zeroed.
 */

import { MockHTMLAudioElement } from '../../../__mocks__/HTMLAudioElement';

// ======================================================================
// MOCKS
// ======================================================================

// vi.hoisted ensures mockMediaPlayer is defined before vi.mock() runs (vi.mock
// is hoisted to the top of the file by Vitest's transform).
const mockMediaPlayer = vi.hoisted(() => ({
  initialize: vi.fn(),
  attachSource: vi.fn(),
  reset: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  seek: vi.fn(),
  updateSettings: vi.fn(),
  on: vi.fn(),
}));

vi.mock('dashjs', () => {
  const MediaPlayerFactory = () => ({ create: () => mockMediaPlayer });
  (MediaPlayerFactory as any).events = { ERROR: 'error' };
  return {
    MediaPlayer: MediaPlayerFactory,
    Debug: { LOG_LEVEL_NONE: 0 },
  };
});

// ======================================================================
// HELPERS
// ======================================================================

/**
 * Reimports player.dash with fresh module state.
 * Must be called inside beforeEach after vi.resetModules().
 */
async function freshPlayer() {
  const mod = await import('./player.dash');
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

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "player.dash" module', () => {
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
    // Make MediaSource available so init() proceeds (supported=true).
    (global as any).window.MediaSource = class {};
    player = await freshPlayer();
  });

  // Convenience accessor — after init(), the single audio element is at index 0.
  const elementA = () => createdElements[0];

  // ======================================================================
  // INITIALISATION
  // ======================================================================

  describe('Initialisation', () => {
    test('does not initialise when MediaSource is unavailable', async () => {
      delete (global as any).window.MediaSource;
      vi.resetModules();
      player = await freshPlayer();
      player.init({ volumeLevel: 75, volumeMuted: false, ...mockCallbacks });
      expect(player.isSupported()).toBe(false);
      expect(createdElements).toHaveLength(0);
    });

    test('creates one audio element on init', () => {
      defaultInit();
      expect(createdElements).toHaveLength(1);
    });

    test('sets volume correctly on init (unmuted)', () => {
      player.init({ volumeLevel: 60, volumeMuted: false, ...mockCallbacks });
      expect(elementA().volume).toBe(0.6);
    });

    test('sets volume to 0 on init when muted', () => {
      player.init({ volumeLevel: 80, volumeMuted: true, ...mockCallbacks });
      expect(elementA().volume).toBe(0);
    });

    test('does not create new elements on a second init call', () => {
      defaultInit();
      defaultInit();
      expect(createdElements).toHaveLength(1);
    });

    test('does not call initialize() during init — deferred to first loadTrack()', () => {
      defaultInit();
      expect(mockMediaPlayer.initialize).not.toHaveBeenCalled();
    });

    test('isSupported() returns true after a successful init', () => {
      defaultInit();
      expect(player.isSupported()).toBe(true);
    });

    test('returns 0 for progress before init', () => {
      expect(player.getCurrentProgress()).toBe(0);
    });

    test('registers loadstart, canplay, ended, and error listeners', () => {
      defaultInit();

      (elementA() as any).mockTriggerEvent('loadstart');
      expect(mockCallbacks.onLoadStart).toHaveBeenCalledTimes(1);

      (elementA() as any).mockTriggerEvent('canplay');
      expect(mockCallbacks.onCanPlay).toHaveBeenCalledTimes(1);

      (elementA() as any).mockTriggerEvent('ended');
      expect(mockCallbacks.onEnded).toHaveBeenCalledTimes(1);

      // isResetting starts false before any loadTrack() call, so the error fires.
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
    });
  });

  // ======================================================================
  // TRACK LOADING
  // ======================================================================

  describe('Track Loading', () => {
    beforeEach(() => defaultInit());

    test('first loadTrack() calls initialize() with the audio element and manifest URL', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      expect(mockMediaPlayer.initialize).toHaveBeenCalledTimes(1);
      const [el, url] = mockMediaPlayer.initialize.mock.calls[0];
      expect(el).toBe(elementA());
      expect(url).toContain('http://example.com/manifest.mpd');
    });

    test('loadTrack() appends a session identifier to the manifest URL', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      const [, url] = mockMediaPlayer.initialize.mock.calls[0];
      expect(url).toContain('X-Plex-Session-Identifier=');
    });

    test('subsequent loadTrack() calls attachSource() instead of initialize()', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      (elementA() as any).mockTriggerEvent('loadstart'); // clear isResetting
      player.loadTrack('http://example.com/manifest2.mpd');
      expect(mockMediaPlayer.initialize).toHaveBeenCalledTimes(1);
      expect(mockMediaPlayer.attachSource).toHaveBeenCalledTimes(1);
      expect(mockMediaPlayer.attachSource.mock.calls[0][0]).toContain('http://example.com/manifest2.mpd');
    });

    test('calls play() on the audio element when play=true', async () => {
      player.loadTrack('http://example.com/manifest.mpd');
      await Promise.resolve();
      expect(elementA().paused).toBe(false);
    });

    test('does not call play() when play=false', async () => {
      player.loadTrack('http://example.com/manifest.mpd', 0, false);
      await Promise.resolve();
      expect(elementA().paused).toBe(true);
    });

    test('passes startTime to initialize() when progress > 0', () => {
      player.loadTrack('http://example.com/manifest.mpd', 30000);
      const [, , , startTime] = mockMediaPlayer.initialize.mock.calls[0];
      expect(startTime).toBe(30); // 30 000 ms → 30 s
    });

    test('passes undefined startTime when progress is 0', () => {
      player.loadTrack('http://example.com/manifest.mpd', 0);
      const [, , , startTime] = mockMediaPlayer.initialize.mock.calls[0];
      expect(startTime).toBeUndefined();
    });
  });

  // ======================================================================
  // UNLOAD
  // ======================================================================

  describe('Unload', () => {
    test('can be called before init without throwing', () => {
      expect(() => player.unload()).not.toThrow();
    });

    test('skips reset() when player has never been initialized (needsReinit=true)', () => {
      defaultInit();
      // No loadTrack() — needsReinit is still true
      player.unload();
      expect(mockMediaPlayer.reset).not.toHaveBeenCalled();
    });

    test('calls reset() after a track has been loaded', () => {
      defaultInit();
      player.loadTrack('http://example.com/manifest.mpd');
      player.unload();
      expect(mockMediaPlayer.reset).toHaveBeenCalledTimes(1);
    });

    test('loadTrack() after unload() calls initialize() again (not attachSource)', () => {
      defaultInit();
      player.loadTrack('http://example.com/manifest.mpd');
      player.unload();
      player.loadTrack('http://example.com/manifest2.mpd');
      expect(mockMediaPlayer.initialize).toHaveBeenCalledTimes(2);
      expect(mockMediaPlayer.attachSource).not.toHaveBeenCalled();
    });

    test('can be called multiple times without throwing', () => {
      defaultInit();
      player.loadTrack('http://example.com/manifest.mpd');
      player.unload();
      expect(() => player.unload()).not.toThrow();
    });
  });

  // ======================================================================
  // PLAYBACK CONTROLS
  // ======================================================================

  describe('Playback Controls', () => {
    beforeEach(() => {
      defaultInit();
      player.loadTrack('http://example.com/manifest.mpd');
      (elementA() as any).mockTriggerEvent('loadstart'); // clear isResetting
    });

    test('pause() delegates to mediaPlayer.pause()', () => {
      player.pause();
      expect(mockMediaPlayer.pause).toHaveBeenCalledTimes(1);
    });

    test('resume() delegates to mediaPlayer.play()', () => {
      player.resume();
      expect(mockMediaPlayer.play).toHaveBeenCalledTimes(1);
    });

    test('restart() seeks to 0 and calls play()', () => {
      player.restart();
      expect(mockMediaPlayer.seek).toHaveBeenCalledWith(0);
      expect(mockMediaPlayer.play).toHaveBeenCalledTimes(1);
    });

    test('setProgress() converts ms to seconds and calls seek()', () => {
      player.setProgress(45000);
      expect(mockMediaPlayer.seek).toHaveBeenCalledWith(45);
    });

    test('getCurrentProgress() returns audioElement.currentTime directly', () => {
      (elementA() as any).currentTime = 33;
      expect(player.getCurrentProgress()).toBe(33);
    });
  });

  // ======================================================================
  // VOLUME
  // ======================================================================

  describe('Volume Controls', () => {
    beforeEach(() => defaultInit());

    test('setVolume() sets audioElement.volume as a fraction', () => {
      player.setVolume(50);
      expect(elementA().volume).toBe(0.5);
    });

    test('setVolume(0) silences the audio element', () => {
      player.setVolume(0);
      expect(elementA().volume).toBe(0);
    });

    test('setVolume(100) sets full volume', () => {
      player.setVolume(100);
      expect(elementA().volume).toBe(1);
    });
  });

  // ======================================================================
  // ERROR HANDLING
  // ======================================================================

  describe('Error Handling', () => {
    beforeEach(() => defaultInit());

    test('onError fires with event and playerElement', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      (elementA() as any).mockTriggerEvent('loadstart'); // clear isResetting
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
      const callArg = mockCallbacks.onError.mock.calls[0][0];
      expect(callArg).toHaveProperty('event');
      expect(callArg).toHaveProperty('playerElement');
    });

    test('onError is suppressed when isResetting (error fires before loadstart)', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      // isResetting=true until loadstart fires — error should be swallowed.
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    test('onError is suppressed for MEDIA_ERR_SRC_NOT_SUPPORTED with empty src', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      (elementA() as any).mockTriggerEvent('loadstart'); // clear isResetting
      // Simulate the empty-src artifact that fires during dash.js reset/seek.
      (elementA() as any).src = '';
      (elementA() as any).error = { code: 4 };
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    test('onError fires for MEDIA_ERR_SRC_NOT_SUPPORTED when src is not empty', () => {
      player.loadTrack('http://example.com/manifest.mpd');
      (elementA() as any).mockTriggerEvent('loadstart'); // clear isResetting
      // code=4 with a real src is a genuine unsupported-format error.
      // Set src manually — the mock dash.js doesn't write to audioElement.src.
      (elementA() as any).src = 'http://example.com/manifest.mpd';
      (elementA() as any).error = { code: 4 };
      (elementA() as any).mockTriggerError({});
      expect(mockCallbacks.onError).toHaveBeenCalledTimes(1);
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
      expect(() => player.setProgress(30000)).not.toThrow();
      expect(player.getCurrentProgress()).toBe(0);
      expect(player.isSupported()).toBe(false);
    });
  });
});
