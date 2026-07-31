// Generated using Claude Code

/**
 * Player Model — Gapless Playback Effects Test Suite
 *
 * Exercises the new gapless effects (playerSyncGaplessQueue, playerSeamAdvance,
 * playerGaplessToggle, playerGaplessError) and the gapless-related changes to
 * playerRefresh / playerLoadTrackList / playerLoadIndex against a REAL Rematch
 * store, with the player/bridge service boundaries mocked.
 */

import { init } from '@rematch/core';
import * as bridge from 'js/services/bridge';
import * as playerX from 'js/services/player';
import { analyticsEvent } from 'js/utils';
import { appModel } from './models.app';
import { playerModel } from './models.player';
import { sessionModel } from './models.session';

// ======================================================================
// SERVICE MOCKS
// ======================================================================

vi.mock('js/services/bridge', () => ({
  // Everything the app/player/session models call.
  abortAllRequests: vi.fn(),
  init: vi.fn(),
  plexLogin: vi.fn(),
  logout: vi.fn(),
  getUserInfo: vi.fn(),
  getAllUsers: vi.fn(),
  switchUser: vi.fn(),
  getAllServers: vi.fn(),
  getAllLibraries: vi.fn(),
  getAllPlaylists: vi.fn(),
  getAllArtistTracks: vi.fn(),
  getAlbumTracks: vi.fn(),
  getPlaylistTracks: vi.fn(),
  getFolderItems: vi.fn(),
  logPlaybackPlay: vi.fn(),
  logPlaybackProgress: vi.fn(),
  logPlaybackPause: vi.fn(),
  logPlaybackStop: vi.fn(),
  logPlaybackQuit: vi.fn(),
}));

vi.mock('js/services/player', () => ({
  init: vi.fn(),
  unload: vi.fn(),
  loadTrack: vi.fn(() => true),
  pause: vi.fn(),
  resume: vi.fn(),
  restart: vi.fn(),
  setProgress: vi.fn(),
  getCurrentProgress: vi.fn(() => 0),
  setVolume: vi.fn(),
  setGaplessEnabled: vi.fn(),
  isGaplessSupported: vi.fn(() => true),
  syncGaplessQueue: vi.fn(),
}));

vi.mock('js/components', () => ({
  PlaybackErrorMessage: vi.fn(() => 'msg'),
}));

vi.mock('js/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('js/utils')>()),
  analyticsEvent: vi.fn(),
}));

// ======================================================================
// HELPERS
// ======================================================================

// requiresTranscoding (real, via the partial js/utils mock) probes codec support
// through a native jsdom audio element whose canPlayType always returns ''.
// Report every codec as playable so flac tracks route as direct-play.
const nativeAudioProto = Object.getPrototypeOf(document.createElement('audio')) as HTMLAudioElement;

const makeTrack = (index: number) => ({
  title: `Track ${index}`,
  artist: `Artist ${index}`,
  album: `Album ${index}`,
  src: `http://example.com/track${index}.flac`,
  codec: 'flac',
  thumbMd: `http://example.com/thumb${index}.jpg`,
  trackKey: null,
});

const createStore = (): any =>
  init({
    models: {
      appModel,
      playerModel,
      sessionModel,
    },
  });

// ======================================================================
// TESTS
// ======================================================================

describe('Player Model — Gapless Playback Effects', () => {
  let store: any;

  /** Seeds a 3-track play queue (track keys default to [0, 1, 2]). */
  const seedQueue = (overrides: Record<string, unknown> = {}) => {
    const playingTrackList = [makeTrack(0), makeTrack(1), makeTrack(2)];
    store.dispatch.appModel.setAppState({ currentService: 'plex' });
    store.dispatch.sessionModel.setSessionState({
      playingTrackList,
      playingTrackKeys: [0, 1, 2],
      playingTrackIndex: 0,
      playingTrackCount: 3,
      playingTrackProgress: 0,
      ...overrides,
    });
    return playingTrackList;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(playerX.loadTrack).mockReturnValue(true);
    vi.mocked(playerX.getCurrentProgress).mockReturnValue(0);
    vi.spyOn(nativeAudioProto, 'canPlayType').mockReturnValue('probably');
    store = createStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ======================================================================
  // QUEUE MIRROR SYNC
  // ======================================================================

  describe('playerSyncGaplessQueue', () => {
    test('Mirrors the queue in playingTrackKeys order with sequential queueIndex fields', async () => {
      const playingTrackList = seedQueue({
        playingTrackKeys: [2, 0, 1],
        playingRepeatOnce: false,
        playingRepeatAll: true,
      });
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerSyncGaplessQueue();

      expect(playerX.syncGaplessQueue).toHaveBeenCalledTimes(1);
      const [entries, flags] = vi.mocked(playerX.syncGaplessQueue).mock.calls[0];
      expect(entries.map((entry) => entry.src)).toEqual([
        playingTrackList[2].src,
        playingTrackList[0].src,
        playingTrackList[1].src,
      ]);
      expect(entries.map((entry) => entry.queueIndex)).toEqual([0, 1, 2]);
      expect(entries[0]).toEqual({
        src: playingTrackList[2].src,
        codec: 'flac',
        queueIndex: 0,
        title: playingTrackList[2].title,
        artist: playingTrackList[2].artist,
        album: playingTrackList[2].album,
        thumbMd: playingTrackList[2].thumbMd,
      });
      expect(flags).toEqual({ repeatOnce: false, repeatAll: true });
    });

    test('Passes the repeat flags from the session state', async () => {
      seedQueue({ playingRepeatOnce: true, playingRepeatAll: false });
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerSyncGaplessQueue();

      const [, flags] = vi.mocked(playerX.syncGaplessQueue).mock.calls[0];
      expect(flags).toEqual({ repeatOnce: true, repeatAll: false });
    });

    test('Syncs an empty mirror when no queue exists', async () => {
      await store.dispatch.playerModel.playerSyncGaplessQueue();
      expect(playerX.syncGaplessQueue).toHaveBeenCalledWith([], { repeatOnce: false, repeatAll: false });
    });
  });

  // ======================================================================
  // SEAM ADVANCES
  // ======================================================================

  describe('playerSeamAdvance', () => {
    test('Advances the store to the new queue position without loading anything', async () => {
      const playingTrackList = seedQueue();
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerSeamAdvance({ index: 1 });

      const session = store.getState().sessionModel;
      expect(session.playingTrackIndex).toBe(1);
      expect(session.playingTrackProgress).toBe(0);
      const player = store.getState().playerModel;
      expect(player.playerPlaying).toBe(true);
      expect(player.playerTrackLoaded).toBe(true);
      expect(player.playerTrackError).toBe(false);
      // The next track is ALREADY playing — no player reload.
      expect(playerX.loadTrack).not.toHaveBeenCalled();
      expect(bridge.logPlaybackPlay).toHaveBeenCalledWith(playingTrackList[1]);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Next Track (Gapless)');
      // Re-arms the engine window for the track after this one.
      expect(playerX.syncGaplessQueue).toHaveBeenCalledTimes(1);
    });

    test('Clears repeat-once on a track change when disableRepeatOnceOnTrackChange is set', async () => {
      seedQueue({
        playingRepeatOnce: true,
        disableRepeatOnceOnTrackChange: true,
        revertRepeatOnceToRepeatAll: false,
      });

      await store.dispatch.playerModel.playerSeamAdvance({ index: 1 });

      const session = store.getState().sessionModel;
      expect(session.playingRepeatOnce).toBe(false);
      expect(session.playingRepeatAll).toBe(false);
    });

    test('A seam to the SAME index (repeat-once replay) keeps repeat-once on', async () => {
      seedQueue({
        playingTrackIndex: 1,
        playingRepeatOnce: true,
        disableRepeatOnceOnTrackChange: true,
      });

      await store.dispatch.playerModel.playerSeamAdvance({ index: 1 });

      expect(store.getState().sessionModel.playingRepeatOnce).toBe(true);
    });

    test('Does nothing when no queue exists', async () => {
      store.dispatch.appModel.setAppState({ currentService: 'plex' });

      await store.dispatch.playerModel.playerSeamAdvance({ index: 1 });

      expect(store.getState().sessionModel.playingTrackIndex).toBe(null);
      expect(store.getState().playerModel.playerPlaying).toBe(false);
      expect(bridge.logPlaybackPlay).not.toHaveBeenCalled();
    });

    test('Does nothing for an index outside the queue', async () => {
      seedQueue();

      await store.dispatch.playerModel.playerSeamAdvance({ index: 5 });

      expect(store.getState().sessionModel.playingTrackIndex).toBe(0);
      expect(bridge.logPlaybackPlay).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // GAPLESS SETTING TOGGLE
  // ======================================================================

  describe('playerGaplessToggle', () => {
    test('Enables gapless, re-syncs the queue and reloads the current track in place', async () => {
      const playingTrackList = seedQueue({ playingTrackIndex: 1 });
      store.dispatch.playerModel.setPlayerState({ playerTrackLoaded: true, playerPlaying: true });
      vi.mocked(playerX.getCurrentProgress).mockReturnValue(42);
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerGaplessToggle();

      expect(store.getState().sessionModel.gaplessPlayback).toBe(true);
      expect(playerX.setGaplessEnabled).toHaveBeenCalledWith(true);
      expect(playerX.syncGaplessQueue).toHaveBeenCalled();
      // Migrates the current track mid-play from the current position (ms).
      expect(playerX.loadTrack).toHaveBeenCalledWith(playingTrackList[1], 42000, true, 1);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Gapless On');
    });

    test('Preserves the paused state when reloading the current track', async () => {
      seedQueue();
      store.dispatch.playerModel.setPlayerState({ playerTrackLoaded: true, playerPlaying: false });
      vi.mocked(playerX.getCurrentProgress).mockReturnValue(10);

      await store.dispatch.playerModel.playerGaplessToggle();

      expect(vi.mocked(playerX.loadTrack).mock.calls[0][2]).toBe(false);
    });

    test('Disables gapless and tracks the Off analytics event', async () => {
      seedQueue({ gaplessPlayback: true });

      await store.dispatch.playerModel.playerGaplessToggle();

      expect(store.getState().sessionModel.gaplessPlayback).toBe(false);
      expect(playerX.setGaplessEnabled).toHaveBeenCalledWith(false);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Gapless Off');
    });

    test('Does not reload a track when none is loaded', async () => {
      store.dispatch.appModel.setAppState({ currentService: 'plex' });

      await store.dispatch.playerModel.playerGaplessToggle();

      expect(playerX.setGaplessEnabled).toHaveBeenCalledWith(true);
      expect(playerX.loadTrack).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // GAPLESS ERROR HANDLING
  // ======================================================================

  describe('playerGaplessError', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('Marks the track as errored and adds a playback error notification', async () => {
      seedQueue();
      store.dispatch.playerModel.setPlayerState({ playerTrackLoaded: true, playerPlaying: true });
      const notificationsBefore = store.getState().appModel.notifications.length;

      await store.dispatch.playerModel.playerGaplessError({
        errorCode: 'GAPLESS_MEDIA_ERROR',
        errorMessage: 'decode failed',
      });

      expect(store.getState().playerModel.playerTrackError).toBe(true);
      const notifications = store.getState().appModel.notifications;
      expect(notifications).toHaveLength(notificationsBefore + 1);
      expect(notifications[notifications.length - 1]).toMatchObject({
        title: 'Playback error',
        description: 'msg',
      });
    });

    test('Tries the next track after the error delay while still playing', async () => {
      const playingTrackList = seedQueue();
      store.dispatch.playerModel.setPlayerState({ playerTrackLoaded: true, playerPlaying: true });

      await store.dispatch.playerModel.playerGaplessError({
        errorCode: 'GAPLESS_MEDIA_ERROR',
        errorMessage: 'decode failed',
      });

      expect(playerX.loadTrack).not.toHaveBeenCalled();
      vi.advanceTimersByTime(700);
      expect(playerX.loadTrack).toHaveBeenCalledWith(playingTrackList[1], undefined, true, 1);
    });
  });

  // ======================================================================
  // SESSION REFRESH
  // ======================================================================

  describe('playerRefresh', () => {
    test('Applies the restored gapless setting and re-syncs the queue before loading the track', async () => {
      const playingTrackList = seedQueue({
        gaplessPlayback: true,
        playingTrackIndex: 1,
        playingTrackProgress: 30000,
      });
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerRefresh();

      expect(playerX.setGaplessEnabled).toHaveBeenCalledWith(true);
      expect(playerX.syncGaplessQueue).toHaveBeenCalled();
      expect(playerX.setVolume).toHaveBeenCalled();
      // The restored track is loaded paused, at the saved progress and queue index.
      expect(playerX.loadTrack).toHaveBeenCalledWith(playingTrackList[1], 30000, false, 1);
    });

    test('Passes a disabled gapless setting through to the player', async () => {
      seedQueue({ gaplessPlayback: false, playingTrackIndex: null });

      await store.dispatch.playerModel.playerRefresh();

      expect(playerX.setGaplessEnabled).toHaveBeenCalledWith(false);
      expect(playerX.loadTrack).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // LOAD EFFECTS — QUEUE INDEX ROUTING
  // ======================================================================

  describe('playerLoadTrackList / playerLoadIndex', () => {
    test('playerLoadTrackList passes the queue index as the 4th loadTrack argument and syncs the mirror', async () => {
      store.dispatch.appModel.setAppState({ currentService: 'plex' });
      const playingTrackList = [makeTrack(0), makeTrack(1), makeTrack(2)];
      vi.mocked(playerX.syncGaplessQueue).mockClear();

      await store.dispatch.playerModel.playerLoadTrackList({
        playingTrackList,
        playingTrackKeys: [0, 1, 2],
        playingTrackIndex: 2,
        playingTrackCount: 3,
        playingTrackProgress: 0,
      });

      expect(playerX.syncGaplessQueue).toHaveBeenCalled();
      expect(playerX.loadTrack).toHaveBeenCalledWith(playingTrackList[2], 0, true, 2);
    });

    test('playerLoadIndex passes the queue index as the 4th loadTrack argument', async () => {
      const playingTrackList = seedQueue();

      await store.dispatch.playerModel.playerLoadIndex({ index: 1, play: true, progress: 5000 });

      expect(playerX.loadTrack).toHaveBeenCalledWith(playingTrackList[1], 5000, true, 1);
      expect(store.getState().sessionModel.playingTrackIndex).toBe(1);
    });
  });
});
