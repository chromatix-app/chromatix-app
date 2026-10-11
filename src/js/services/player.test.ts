// Generated using Claude Code

/**
 * Player Router Test Suite
 *
 * Validates the routing layer that dispatches playback between the native
 * player and the DASH player. Both sub-players are mocked, so these tests
 * assert pure routing behaviour: which sub-player receives each call, and
 * how the module-level activePlayer state gates init() event callbacks.
 *
 * The router holds module-level state (activePlayer), so each test reimports
 * the module fresh via vi.resetModules() + dynamic import.
 *
 * Codec routing goes through requiresTranscoding(), which probes canPlayType()
 * on a real (jsdom) audio element — tests control the result by spying on that
 * element's prototype. requiresTranscoding's module-level result cache is also
 * recreated by vi.resetModules(), so each test starts from a clean slate.
 */

// ======================================================================
// SUB-PLAYER MOCKS
// ======================================================================

// Created via vi.hoisted so the vi.mock factories (which are hoisted above
// imports) can reference them, and so the same mock instances survive the
// vi.resetModules() call in beforeEach.
const { nativeMock, dashMock } = vi.hoisted(() => {
  const createSubPlayerMock = () => ({
    init: vi.fn(),
    unload: vi.fn(),
    loadTrack: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    restart: vi.fn(),
    setProgress: vi.fn(),
    getCurrentProgress: vi.fn(),
    setVolume: vi.fn(),
  });
  return {
    nativeMock: createSubPlayerMock(),
    dashMock: { ...createSubPlayerMock(), isSupported: vi.fn() },
  };
});

vi.mock('./player.native', () => nativeMock);
vi.mock('./player.dash', () => dashMock);

// ======================================================================
// HELPERS
// ======================================================================

type PlayerRouter = typeof import('./player');

// requiresTranscoding.ts creates its probe element via document.createElement('audio'),
// which in jsdom gives a native element distinct from our MockHTMLAudioElement.
// We must spy on that element's actual prototype to control codec support results.
const nativeAudioProto = Object.getPrototypeOf(document.createElement('audio')) as HTMLAudioElement;

const mockCanPlayType = (result: '' | 'maybe' | 'probably') => {
  vi.spyOn(nativeAudioProto, 'canPlayType').mockReturnValue(result);
};

// A track whose codec the browser can play natively (canPlayType mocked to 'probably').
const nativeTrack = {
  src: 'http://example.com/track.mp3',
  codec: 'mp3',
};

// A Plex track whose codec requires transcoding (canPlayType mocked to ''),
// with a DASH manifest available.
const dashTrack = {
  src: 'http://example.com/track.flac',
  dashSrc: 'http://example.com/track.mpd',
  codec: 'flac',
  trackKey: '/library/metadata/1001',
};

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "player" router service', () => {
  let player: PlayerRouter;

  const createInitParams = () => ({
    volumeLevel: 75,
    volumeMuted: false,
    onLoadStart: vi.fn(),
    onCanPlay: vi.fn(),
    onEnded: vi.fn(),
    onError: vi.fn(),
  });

  const loadNativeTrack = () => {
    mockCanPlayType('probably');
    player.loadTrack(nativeTrack);
  };

  const loadDashTrack = () => {
    mockCanPlayType('');
    player.loadTrack(dashTrack);
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();
    dashMock.isSupported.mockReturnValue(true);
    player = await import('./player');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ======================================================================
  // TRACK LOADING
  // ======================================================================

  describe('Track Loading', () => {
    test('Routes a natively playable codec to the native player', () => {
      mockCanPlayType('probably');
      const result = player.loadTrack(nativeTrack);
      expect(result).toBe(true);
      expect(nativeMock.loadTrack).toHaveBeenCalledWith(nativeTrack.src, 0, true);
      expect(dashMock.loadTrack).not.toHaveBeenCalled();
      // The DASH player is unloaded so it cannot keep playing underneath.
      expect(dashMock.unload).toHaveBeenCalledTimes(1);
      expect(nativeMock.unload).not.toHaveBeenCalled();
    });

    test('Forwards progress and play arguments to the native player', () => {
      mockCanPlayType('probably');
      player.loadTrack(nativeTrack, 30000, false);
      expect(nativeMock.loadTrack).toHaveBeenCalledWith(nativeTrack.src, 30000, false);
    });

    test('Routes a transcode-required track with a dashSrc to the DASH player', () => {
      mockCanPlayType('');
      const result = player.loadTrack(dashTrack);
      expect(result).toBe(true);
      expect(dashMock.loadTrack).toHaveBeenCalledWith(dashTrack.dashSrc, 0, true);
      expect(nativeMock.loadTrack).not.toHaveBeenCalled();
      // The native player is unloaded so it cannot keep playing underneath.
      expect(nativeMock.unload).toHaveBeenCalledTimes(1);
      expect(dashMock.unload).not.toHaveBeenCalled();
    });

    test('Forwards progress and play arguments to the DASH player', () => {
      mockCanPlayType('');
      player.loadTrack(dashTrack, 45000, false);
      expect(dashMock.loadTrack).toHaveBeenCalledWith(dashTrack.dashSrc, 45000, false);
    });

    test('Returns false and unloads both players when a Plex DASH track has no dashSrc yet', () => {
      // Plex track that needs DASH but credentials are not ready — dashSrc is
      // unavailable while trackKey identifies it as a Plex track.
      mockCanPlayType('');
      const result = player.loadTrack({ ...dashTrack, dashSrc: null });
      expect(result).toBe(false);
      expect(nativeMock.unload).toHaveBeenCalledTimes(1);
      expect(dashMock.unload).toHaveBeenCalledTimes(1);
      expect(nativeMock.loadTrack).not.toHaveBeenCalled();
      expect(dashMock.loadTrack).not.toHaveBeenCalled();
    });

    test('Falls back to the native player when transcoding is required but DASH is unsupported', () => {
      mockCanPlayType('');
      dashMock.isSupported.mockReturnValue(false);
      const result = player.loadTrack(dashTrack);
      expect(result).toBe(true);
      expect(nativeMock.loadTrack).toHaveBeenCalledWith(dashTrack.src, 0, true);
      expect(dashMock.loadTrack).not.toHaveBeenCalled();
    });

    test('Routes a transcode-required track without dashSrc or trackKey to the native player', () => {
      // Jellyfin case: the src URL already embeds server-side transcoding
      // (universal endpoint), so no DASH manifest or Plex trackKey exists.
      mockCanPlayType('');
      const jellyfinTrack = { src: 'http://example.com/universal.flac', codec: 'flac' };
      const result = player.loadTrack(jellyfinTrack);
      expect(result).toBe(true);
      expect(nativeMock.loadTrack).toHaveBeenCalledWith(jellyfinTrack.src, 0, true);
      expect(dashMock.loadTrack).not.toHaveBeenCalled();
    });

    test('Treats a missing codec as requiring transcoding and routes to the DASH player', () => {
      const result = player.loadTrack({ ...dashTrack, codec: null });
      expect(result).toBe(true);
      expect(dashMock.loadTrack).toHaveBeenCalledWith(dashTrack.dashSrc, 0, true);
      expect(nativeMock.loadTrack).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // PLAYBACK CONTROL ROUTING
  // ======================================================================

  describe('Playback Control Routing', () => {
    test('Routes controls to the native player by default (before any load)', () => {
      player.pause();
      player.resume();
      expect(nativeMock.pause).toHaveBeenCalledTimes(1);
      expect(nativeMock.resume).toHaveBeenCalledTimes(1);
      expect(dashMock.pause).not.toHaveBeenCalled();
      expect(dashMock.resume).not.toHaveBeenCalled();
    });

    test('Routes all controls to the native player after a native load', () => {
      loadNativeTrack();
      nativeMock.getCurrentProgress.mockReturnValue(33);

      player.pause();
      player.resume();
      player.restart();
      player.setProgress(45000);
      expect(player.getCurrentProgress()).toBe(33);

      expect(nativeMock.pause).toHaveBeenCalledTimes(1);
      expect(nativeMock.resume).toHaveBeenCalledTimes(1);
      expect(nativeMock.restart).toHaveBeenCalledTimes(1);
      expect(nativeMock.setProgress).toHaveBeenCalledWith(45000);
      expect(nativeMock.getCurrentProgress).toHaveBeenCalledTimes(1);

      expect(dashMock.pause).not.toHaveBeenCalled();
      expect(dashMock.resume).not.toHaveBeenCalled();
      expect(dashMock.restart).not.toHaveBeenCalled();
      expect(dashMock.setProgress).not.toHaveBeenCalled();
      expect(dashMock.getCurrentProgress).not.toHaveBeenCalled();
    });

    test('Routes all controls to the DASH player after a DASH load', () => {
      loadDashTrack();
      dashMock.getCurrentProgress.mockReturnValue(42);

      player.pause();
      player.resume();
      player.restart();
      player.setProgress(45000);
      expect(player.getCurrentProgress()).toBe(42);

      expect(dashMock.pause).toHaveBeenCalledTimes(1);
      expect(dashMock.resume).toHaveBeenCalledTimes(1);
      expect(dashMock.restart).toHaveBeenCalledTimes(1);
      expect(dashMock.setProgress).toHaveBeenCalledWith(45000);
      expect(dashMock.getCurrentProgress).toHaveBeenCalledTimes(1);

      expect(nativeMock.pause).not.toHaveBeenCalled();
      expect(nativeMock.resume).not.toHaveBeenCalled();
      expect(nativeMock.restart).not.toHaveBeenCalled();
      expect(nativeMock.setProgress).not.toHaveBeenCalled();
      expect(nativeMock.getCurrentProgress).not.toHaveBeenCalled();
    });

    test('Reverts routing to the native player when a native track follows a DASH track', () => {
      loadDashTrack();
      loadNativeTrack();
      player.pause();
      expect(nativeMock.pause).toHaveBeenCalledTimes(1);
      expect(dashMock.pause).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // VOLUME
  // ======================================================================

  describe('Volume', () => {
    test('Fans setVolume out to both players when native is active', () => {
      loadNativeTrack();
      player.setVolume(65);
      expect(nativeMock.setVolume).toHaveBeenCalledWith(65);
      expect(dashMock.setVolume).toHaveBeenCalledWith(65);
    });

    test('Fans setVolume out to both players when DASH is active', () => {
      loadDashTrack();
      player.setVolume(30);
      expect(nativeMock.setVolume).toHaveBeenCalledWith(30);
      expect(dashMock.setVolume).toHaveBeenCalledWith(30);
    });
  });

  // ======================================================================
  // UNLOAD
  // ======================================================================

  describe('Unload', () => {
    test('Unloads both players', () => {
      loadDashTrack();
      player.unload();
      expect(nativeMock.unload).toHaveBeenCalled();
      expect(dashMock.unload).toHaveBeenCalled();
    });

    test('Resets routing to the native player', () => {
      loadDashTrack();
      player.unload();
      player.pause();
      expect(nativeMock.pause).toHaveBeenCalledTimes(1);
      expect(dashMock.pause).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // INIT CALLBACK GATING
  // ======================================================================

  describe('Init Callback Gating', () => {
    test('Initialises both sub-players with the volume settings and wrapped callbacks', () => {
      const params = createInitParams();
      player.init(params);

      expect(nativeMock.init).toHaveBeenCalledTimes(1);
      expect(dashMock.init).toHaveBeenCalledTimes(1);
      expect(nativeMock.init).toHaveBeenCalledWith(expect.objectContaining({ volumeLevel: 75, volumeMuted: false }));
      expect(dashMock.init).toHaveBeenCalledWith(expect.objectContaining({ volumeLevel: 75, volumeMuted: false }));

      // Callbacks are wrapped (gated on activePlayer), not passed through as-is.
      const nativeWrapped = nativeMock.init.mock.calls[0][0];
      const dashWrapped = dashMock.init.mock.calls[0][0];
      expect(nativeWrapped.onEnded).toBeTypeOf('function');
      expect(nativeWrapped.onEnded).not.toBe(params.onEnded);
      expect(dashWrapped.onEnded).toBeTypeOf('function');
      expect(dashWrapped.onEnded).not.toBe(params.onEnded);
    });

    test('Forwards native events and suppresses DASH events before any load (native is default)', () => {
      const params = createInitParams();
      player.init(params);
      const nativeWrapped = nativeMock.init.mock.calls[0][0];
      const dashWrapped = dashMock.init.mock.calls[0][0];

      nativeWrapped.onLoadStart();
      nativeWrapped.onCanPlay();
      nativeWrapped.onEnded();
      expect(params.onLoadStart).toHaveBeenCalledTimes(1);
      expect(params.onCanPlay).toHaveBeenCalledTimes(1);
      expect(params.onEnded).toHaveBeenCalledTimes(1);

      // Stale events from the inactive DASH player must not leak through.
      dashWrapped.onLoadStart();
      dashWrapped.onCanPlay();
      dashWrapped.onEnded();
      expect(params.onLoadStart).toHaveBeenCalledTimes(1);
      expect(params.onCanPlay).toHaveBeenCalledTimes(1);
      expect(params.onEnded).toHaveBeenCalledTimes(1);
    });

    test('Forwards DASH events and suppresses native events after a DASH load', () => {
      const params = createInitParams();
      player.init(params);
      loadDashTrack();
      const nativeWrapped = nativeMock.init.mock.calls[0][0];
      const dashWrapped = dashMock.init.mock.calls[0][0];

      nativeWrapped.onLoadStart();
      nativeWrapped.onCanPlay();
      nativeWrapped.onEnded();
      expect(params.onLoadStart).not.toHaveBeenCalled();
      expect(params.onCanPlay).not.toHaveBeenCalled();
      expect(params.onEnded).not.toHaveBeenCalled();

      dashWrapped.onLoadStart();
      dashWrapped.onCanPlay();
      dashWrapped.onEnded();
      expect(params.onLoadStart).toHaveBeenCalledTimes(1);
      expect(params.onCanPlay).toHaveBeenCalledTimes(1);
      expect(params.onEnded).toHaveBeenCalledTimes(1);
    });

    test('Gates onError by active player and forwards the error payload through', () => {
      const params = createInitParams();
      player.init(params);
      loadDashTrack();
      const nativeWrapped = nativeMock.init.mock.calls[0][0];
      const dashWrapped = dashMock.init.mock.calls[0][0];
      const errorPayload = { event: new Event('error'), playerElement: document.createElement('audio') };

      // A stale error from the inactive native player is suppressed.
      nativeWrapped.onError(errorPayload);
      expect(params.onError).not.toHaveBeenCalled();

      // An error from the active DASH player is forwarded with its payload intact.
      dashWrapped.onError(errorPayload);
      expect(params.onError).toHaveBeenCalledTimes(1);
      expect(params.onError).toHaveBeenCalledWith(errorPayload);
    });

    test('Restores native event forwarding after unload()', () => {
      const params = createInitParams();
      player.init(params);
      loadDashTrack();
      player.unload();
      const nativeWrapped = nativeMock.init.mock.calls[0][0];
      const dashWrapped = dashMock.init.mock.calls[0][0];

      nativeWrapped.onEnded();
      expect(params.onEnded).toHaveBeenCalledTimes(1);
      dashWrapped.onEnded();
      expect(params.onEnded).toHaveBeenCalledTimes(1);
    });
  });
});
