// Generated using Claude Code

/**
 * Gapless Player Service Test Suite
 *
 * Validates the gapless.js engine wrapper: support/routing predicates, the
 * sliding engine window built from the store's queue mirror, seam advances,
 * tail reconciliation, playback controls and engine callback forwarding.
 *
 * The 'gapless' npm package is mocked with a fake Queue class that captures
 * constructor options (tracks, metadata, callbacks) and spies every instance
 * method, so tests can simulate engine events and inspect calls.
 *
 * The module under test has module-level state — each test reimports it fresh
 * via vi.resetModules() + dynamic import.
 */

import type { GaplessQueueEntry, GaplessQueueFlags } from 'types/player';

// ======================================================================
// GAPLESS PACKAGE MOCK
// ======================================================================

const gaplessMock = vi.hoisted(() => {
  const instances: FakeQueue[] = [];

  class FakeQueue {
    options: any;
    play = vi.fn();
    pause = vi.fn();
    seek = vi.fn();
    gotoTrack = vi.fn();
    setVolume = vi.fn();
    addTrack = vi.fn();
    removeTrack = vi.fn();
    destroy = vi.fn();
    resumeAudioContext = vi.fn(() => Promise.resolve());

    // Configurable currentTrack state for getCurrentProgress tests.
    currentTrackTime = 0;
    get currentTrack() {
      return { currentTime: this.currentTrackTime };
    }

    constructor(options: any) {
      this.options = options;
      instances.push(this);
    }
  }

  return {
    FakeQueue,
    instances,
    latest: () => instances[instances.length - 1],
  };
});

vi.mock('gapless', () => ({
  Queue: gaplessMock.FakeQueue,
}));

// ======================================================================
// HELPERS
// ======================================================================

/**
 * Reimports player.gapless with fresh module state.
 * Must be called after vi.resetModules().
 */
async function freshGapless() {
  const mod = await import('./player.gapless');
  return mod;
}

type Gapless = Awaited<ReturnType<typeof freshGapless>>;

// requiresTranscoding creates its audio element via document.createElement('audio'),
// which in jsdom gives a native element distinct from MockHTMLAudioElement. Spy on
// that element's actual prototype so the module's singleton is affected. After
// vi.resetModules() a fresh requiresTranscoding instance (with an empty cache) is
// imported, so the spy must be installed before the dynamic import runs.
const nativeAudioProto = Object.getPrototypeOf(document.createElement('audio')) as HTMLAudioElement;

// Direct-play everything except WMA — mirrors a typical desktop browser, so
// 'wma' entries require transcoding while 'flac'/'mp3' chain gaplessly.
const mockCanPlayType = () => {
  vi.spyOn(nativeAudioProto, 'canPlayType').mockImplementation((mime: string) =>
    mime === 'audio/x-ms-wma' ? '' : 'probably'
  );
};

const makeEntry = (queueIndex: number, codec = 'flac'): GaplessQueueEntry => ({
  src: `http://example.com/track${queueIndex}.${codec}`,
  codec,
  queueIndex,
  title: `Track ${queueIndex}`,
  artist: `Artist ${queueIndex}`,
  album: `Album ${queueIndex}`,
  thumbMd: `http://example.com/thumb${queueIndex}.jpg`,
});

const makeEntries = (count: number): GaplessQueueEntry[] =>
  Array.from({ length: count }, (unused, index) => makeEntry(index));

const trackFromEntry = (entry: GaplessQueueEntry) => ({
  src: entry.src,
  codec: entry.codec,
  title: entry.title,
});

const noRepeat: GaplessQueueFlags = { repeatOnce: false, repeatAll: false };

const expectedMetadata = (entry: GaplessQueueEntry) => ({
  title: entry.title,
  artist: entry.artist,
  album: entry.album,
  artwork: [{ src: entry.thumbMd }],
});

const createCallbacks = () => ({
  volumeLevel: 100,
  volumeMuted: false,
  onLoadStart: vi.fn(),
  onCanPlay: vi.fn(),
  onEnded: vi.fn(),
  onError: vi.fn(),
  onGaplessSeamAdvance: vi.fn(),
  onGaplessError: vi.fn(),
  onGaplessPlayBlocked: vi.fn(),
});

// ======================================================================
// TESTS
// ======================================================================

describe('Gapless Player Service', () => {
  let gapless: Gapless;
  let callbacks: ReturnType<typeof createCallbacks>;

  beforeEach(async () => {
    vi.resetModules();
    gaplessMock.instances.length = 0;
    // jsdom has no AudioContext — provide one so isSupported() passes.
    (window as any).AudioContext = class {};
    // Install the canPlayType spy BEFORE importing — the fresh requiresTranscoding
    // instance caches results from its first call onwards.
    mockCanPlayType();
    gapless = await freshGapless();
    callbacks = createCallbacks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).AudioContext;
  });

  /** Standard setup: init + enable + mirror a queue of direct-play entries. */
  const setupQueue = (entries: GaplessQueueEntry[], flags: GaplessQueueFlags = noRepeat) => {
    gapless.init(callbacks);
    gapless.setEnabled(true);
    gapless.syncQueue(entries, flags);
    return entries;
  };

  // ======================================================================
  // SUPPORT PREDICATE
  // ======================================================================

  describe('isSupported()', () => {
    test('Returns false when the Web Audio API is unavailable', () => {
      delete (window as any).AudioContext;
      expect(gapless.isSupported()).toBe(false);
    });

    test('Returns true when AudioContext exists and the platform is not iOS', () => {
      // jsdom's user agent is not an iOS one, so only AudioContext gates this.
      expect(gapless.isSupported()).toBe(true);
    });
  });

  // ======================================================================
  // CAN PLAY PREDICATE
  // ======================================================================

  describe('canPlay()', () => {
    test('Returns false while the gapless setting is disabled', () => {
      const entries = makeEntries(3);
      gapless.init(callbacks);
      gapless.syncQueue(entries, noRepeat);
      expect(gapless.canPlay(trackFromEntry(entries[0]), 0)).toBe(false);
    });

    test('Returns false when no queueIndex is provided', () => {
      const entries = setupQueue(makeEntries(3));
      expect(gapless.canPlay(trackFromEntry(entries[0]))).toBe(false);
      expect(gapless.canPlay(trackFromEntry(entries[0]), undefined)).toBe(false);
    });

    test('Returns false for a codec that requires transcoding', () => {
      const entries = [makeEntry(0), makeEntry(1, 'wma'), makeEntry(2)];
      setupQueue(entries);
      expect(gapless.canPlay(trackFromEntry(entries[1]), 1)).toBe(false);
    });

    test('Returns false when the track does not match the queue position it claims', () => {
      const entries = setupQueue(makeEntries(3));
      // Right track, wrong position.
      expect(gapless.canPlay(trackFromEntry(entries[0]), 1)).toBe(false);
      // Unknown src entirely.
      expect(gapless.canPlay({ src: 'http://example.com/other.flac', codec: 'flac' }, 0)).toBe(false);
    });

    test('Returns true for a direct-play track at its mirrored queue position', () => {
      const entries = setupQueue(makeEntries(3));
      expect(gapless.canPlay(trackFromEntry(entries[0]), 0)).toBe(true);
      expect(gapless.canPlay(trackFromEntry(entries[2]), 2)).toBe(true);
    });
  });

  // ======================================================================
  // LOAD TRACK — ENGINE WINDOW
  // ======================================================================

  describe('loadTrack() window construction', () => {
    test('Builds a Queue with the [current, next, next2] window in queue order', () => {
      const entries = setupQueue(makeEntries(4));
      const loaded = gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      expect(loaded).toBe(true);
      expect(gaplessMock.instances).toHaveLength(1);
      const options = gaplessMock.latest().options;
      expect(options.tracks).toEqual([entries[0].src, entries[1].src, entries[2].src]);
      expect(options.trackMetadata).toEqual([
        expectedMetadata(entries[0]),
        expectedMetadata(entries[1]),
        expectedMetadata(entries[2]),
      ]);
    });

    test('Passes preloadNumTracks 1, playbackMethod HYBRID and the stored volume / 100', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.setVolume(50);
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      const options = gaplessMock.latest().options;
      expect(options.preloadNumTracks).toBe(1);
      expect(options.playbackMethod).toBe('HYBRID');
      expect(options.volume).toBe(0.5);
    });

    test('Uses the init() volume when setVolume has not been called', () => {
      callbacks.volumeLevel = 80;
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      expect(gaplessMock.latest().options.volume).toBe(0.8);
    });

    test('Calls gotoTrack(0, false) then play() when play is true', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      const instance = gaplessMock.latest();
      expect(instance.gotoTrack).toHaveBeenCalledWith(0, false);
      expect(instance.resumeAudioContext).toHaveBeenCalledTimes(1);
      expect(instance.play).toHaveBeenCalledTimes(1);
      expect(callbacks.onLoadStart).toHaveBeenCalledTimes(1);
      expect(callbacks.onCanPlay).toHaveBeenCalledTimes(1);
    });

    test('Does not play when play is false', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, false, 0);
      expect(gaplessMock.latest().play).not.toHaveBeenCalled();
    });

    test('Seeks to progress / 1000 seconds when progress is given', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 30000, true, 0);
      expect(gaplessMock.latest().seek).toHaveBeenCalledWith(30);
    });

    test('Does not seek when progress is 0', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      expect(gaplessMock.latest().seek).not.toHaveBeenCalled();
    });

    test('Returns false without building a Queue when canPlay fails', () => {
      const entries = setupQueue(makeEntries(3));
      // Wrong queue position for this track.
      expect(gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 1)).toBe(false);
      // No queue index at all.
      expect(gapless.loadTrack(trackFromEntry(entries[0]), 0, true)).toBe(false);
      expect(gaplessMock.instances).toHaveLength(0);
    });

    test('Window chain stops at a transcode-needed entry', () => {
      // Two flacs then a wma: the chain must end before the wma.
      const entries = [makeEntry(0), makeEntry(1), makeEntry(2, 'wma'), makeEntry(3)];
      setupQueue(entries);
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      const options = gaplessMock.latest().options;
      expect(options.tracks).toEqual([entries[0].src, entries[1].src]);
      expect(options.tracks).toHaveLength(2);
    });

    test('Window contains at most WINDOW_AHEAD (2) tracks beyond the current one', () => {
      const entries = setupQueue(makeEntries(6));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      expect(gaplessMock.latest().options.tracks).toEqual([entries[0].src, entries[1].src, entries[2].src]);
    });
  });

  // ======================================================================
  // LOAD TRACK — REPEAT FLAGS
  // ======================================================================

  describe('loadTrack() repeat flags', () => {
    test('repeatOnce repeats the current track throughout the window', () => {
      const entries = setupQueue(makeEntries(3), { repeatOnce: true, repeatAll: false });
      gapless.loadTrack(trackFromEntry(entries[1]), 0, true, 1);
      expect(gaplessMock.latest().options.tracks).toEqual([entries[1].src, entries[1].src, entries[1].src]);
    });

    test('repeatAll wraps the window to the start of the queue at the end', () => {
      const entries = setupQueue(makeEntries(3), { repeatOnce: false, repeatAll: true });
      gapless.loadTrack(trackFromEntry(entries[2]), 0, true, 2);
      expect(gaplessMock.latest().options.tracks).toEqual([entries[2].src, entries[0].src, entries[1].src]);
    });

    test('Without repeat the window ends at the last queue entry', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[2]), 0, true, 2);
      expect(gaplessMock.latest().options.tracks).toEqual([entries[2].src]);
    });
  });

  // ======================================================================
  // SEAM ADVANCES
  // ======================================================================

  describe('Seam advances (onStartNewTrack)', () => {
    test('An engine boundary crossing fires onGaplessSeamAdvance with the store queue position', () => {
      const entries = setupQueue(makeEntries(5));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      gaplessMock.latest().options.onStartNewTrack({ index: 1 });
      expect(callbacks.onGaplessSeamAdvance).toHaveBeenCalledTimes(1);
      expect(callbacks.onGaplessSeamAdvance).toHaveBeenCalledWith({ index: 1 });
    });

    test('An echo of the current engine index does NOT fire onGaplessSeamAdvance', () => {
      const entries = setupQueue(makeEntries(5));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);

      gaplessMock.latest().options.onStartNewTrack({ index: 0 });
      expect(callbacks.onGaplessSeamAdvance).not.toHaveBeenCalled();
    });

    test('Engine indexes are mapped through engineToQueueIndex (repeatAll wrap)', () => {
      // Window at the queue end with repeatAll: [2, 0, 1] — engine index 1 is queue position 0.
      const entries = setupQueue(makeEntries(3), { repeatOnce: false, repeatAll: true });
      gapless.loadTrack(trackFromEntry(entries[2]), 0, true, 2);

      gaplessMock.latest().options.onStartNewTrack({ index: 1 });
      expect(callbacks.onGaplessSeamAdvance).toHaveBeenCalledWith({ index: 0 });
    });

    test('Re-syncing after a seam extends the window tail via addTrack', () => {
      const entries = setupQueue(makeEntries(5));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const instance = gaplessMock.latest();

      // Engine crossed into window position 1 — store re-syncs the (unchanged) queue.
      instance.options.onStartNewTrack({ index: 1 });
      gapless.syncQueue(entries, noRepeat);

      // Window was [0, 1, 2]; from queue position 1 it should now cover [1, 2, 3].
      expect(instance.removeTrack).not.toHaveBeenCalled();
      expect(instance.addTrack).toHaveBeenCalledTimes(1);
      expect(instance.addTrack).toHaveBeenCalledWith(entries[3].src, {
        skipHEAD: true,
        metadata: expectedMetadata(entries[3]),
      });
    });
  });

  // ======================================================================
  // TAIL RECONCILIATION
  // ======================================================================

  describe('reconcileTail()', () => {
    test('Switching repeatOnce on mid-play swaps the stale tail for the current track', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const instance = gaplessMock.latest();

      // Engine window is [0, 1, 2]; with repeatOnce the desired window is [0, 0, 0].
      gapless.syncQueue(entries, { repeatOnce: true, repeatAll: false });

      // Stale tail entries removed from the end down to the current track...
      expect(instance.removeTrack.mock.calls).toEqual([[2], [1]]);
      // ...and the current track's src re-appended twice.
      expect(instance.addTrack).toHaveBeenCalledTimes(2);
      expect(instance.addTrack.mock.calls[0][0]).toBe(entries[0].src);
      expect(instance.addTrack.mock.calls[1][0]).toBe(entries[0].src);
    });

    test('Re-syncing an unchanged queue leaves the engine window untouched', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const instance = gaplessMock.latest();

      gapless.syncQueue(entries, noRepeat);
      expect(instance.removeTrack).not.toHaveBeenCalled();
      expect(instance.addTrack).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // LOAD TRACK — SAME TRACK REUSE
  // ======================================================================

  describe('loadTrack() same-track reuse', () => {
    test('Reloading the current track reuses the existing Queue and seeks/plays it', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const instance = gaplessMock.latest();

      const loaded = gapless.loadTrack(trackFromEntry(entries[0]), 45000, true, 0);
      expect(loaded).toBe(true);
      expect(gaplessMock.instances).toHaveLength(1);
      expect(instance.destroy).not.toHaveBeenCalled();
      expect(instance.seek).toHaveBeenCalledWith(45);
      expect(instance.play).toHaveBeenCalledTimes(2);
      expect(callbacks.onCanPlay).toHaveBeenCalledTimes(2);
    });

    test('Reloading the current track with play=false pauses it', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const instance = gaplessMock.latest();

      gapless.loadTrack(trackFromEntry(entries[0]), 0, false, 0);
      expect(gaplessMock.instances).toHaveLength(1);
      expect(instance.pause).toHaveBeenCalledTimes(1);
    });

    test('Loading a different queue position builds a new Queue', () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      const first = gaplessMock.latest();

      gapless.loadTrack(trackFromEntry(entries[1]), 0, true, 1);
      expect(gaplessMock.instances).toHaveLength(2);
      expect(first.destroy).toHaveBeenCalledTimes(1);
      expect(gaplessMock.latest().options.tracks[0]).toBe(entries[1].src);
    });
  });

  // ======================================================================
  // PLAYBACK CONTROLS
  // ======================================================================

  describe('Playback controls', () => {
    const loadDefault = () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      return gaplessMock.latest();
    };

    test('pause() routes to the queue instance', () => {
      const instance = loadDefault();
      gapless.pause();
      expect(instance.pause).toHaveBeenCalledTimes(1);
    });

    test('resume() resumes the AudioContext and plays', () => {
      const instance = loadDefault();
      instance.resumeAudioContext.mockClear();
      instance.play.mockClear();
      gapless.resume();
      expect(instance.resumeAudioContext).toHaveBeenCalledTimes(1);
      expect(instance.play).toHaveBeenCalledTimes(1);
    });

    test('restart() seeks to 0 and plays', () => {
      const instance = loadDefault();
      instance.play.mockClear();
      gapless.restart();
      expect(instance.seek).toHaveBeenCalledWith(0);
      expect(instance.play).toHaveBeenCalledTimes(1);
    });

    test('setProgress() converts ms to seconds', () => {
      const instance = loadDefault();
      gapless.setProgress(45000);
      expect(instance.seek).toHaveBeenCalledWith(45);
    });

    test('getCurrentProgress() returns the current track time in seconds', () => {
      const instance = loadDefault();
      instance.currentTrackTime = 33;
      expect(gapless.getCurrentProgress()).toBe(33);
    });

    test('getCurrentProgress() returns 0 when no queue exists', () => {
      expect(gapless.getCurrentProgress()).toBe(0);
    });

    test('setVolume() stores the level and applies it to the queue as a fraction', () => {
      const instance = loadDefault();
      gapless.setVolume(50);
      expect(instance.setVolume).toHaveBeenCalledWith(0.5);
    });

    test('unload() destroys the queue', () => {
      const instance = loadDefault();
      gapless.unload();
      expect(instance.destroy).toHaveBeenCalledTimes(1);
      expect(gapless.getCurrentProgress()).toBe(0);
    });

    test('setEnabled(false) destroys the queue', () => {
      const instance = loadDefault();
      gapless.setEnabled(false);
      expect(instance.destroy).toHaveBeenCalledTimes(1);
    });

    test('Controls are safe to call before any track is loaded', () => {
      gapless.init(callbacks);
      expect(() => gapless.pause()).not.toThrow();
      expect(() => gapless.resume()).not.toThrow();
      expect(() => gapless.restart()).not.toThrow();
      expect(() => gapless.setProgress(1000)).not.toThrow();
      expect(() => gapless.setVolume(50)).not.toThrow();
      expect(() => gapless.unload()).not.toThrow();
    });
  });

  // ======================================================================
  // ENGINE CALLBACK FORWARDING
  // ======================================================================

  describe('Engine callback forwarding', () => {
    const loadDefault = () => {
      const entries = setupQueue(makeEntries(3));
      gapless.loadTrack(trackFromEntry(entries[0]), 0, true, 0);
      return gaplessMock.latest();
    };

    test('onEnded forwards to the init onEnded callback', () => {
      const instance = loadDefault();
      instance.options.onEnded();
      expect(callbacks.onEnded).toHaveBeenCalledTimes(1);
    });

    test('onError maps to onGaplessError with the GAPLESS_MEDIA_ERROR code', () => {
      const instance = loadDefault();
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      instance.options.onError(new Error('decode failed'));
      expect(callbacks.onGaplessError).toHaveBeenCalledWith({
        errorCode: 'GAPLESS_MEDIA_ERROR',
        errorMessage: 'decode failed',
      });
    });

    test('onError falls back to a default message when the error has none', () => {
      const instance = loadDefault();
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      instance.options.onError(new Error(''));
      expect(callbacks.onGaplessError).toHaveBeenCalledWith({
        errorCode: 'GAPLESS_MEDIA_ERROR',
        errorMessage: 'The gapless engine could not play the track',
      });
    });

    test('onPlayBlocked forwards to onGaplessPlayBlocked', () => {
      const instance = loadDefault();
      instance.options.onPlayBlocked();
      expect(callbacks.onGaplessPlayBlocked).toHaveBeenCalledTimes(1);
    });
  });
});
