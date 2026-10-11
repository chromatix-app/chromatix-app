// Generated using Claude Code

// Scope: playback controls, queue navigation (next/prev/repeat/shuffle),
// volume handling, and the loadTrack error contract — driven through a real
// Rematch store with only the service boundaries mocked. Deliberately out of
// scope (candidates for a future suite): the LOAD TRACKS family
// (playerLoadArtist/Album/Playlist/Folder/TrackItem/TrackList — async
// bridge-fetch flows), the error effects (playerError/playerErrorPlayback/
// playerErrorNext — setTimeout + MediaError dependent), playerRefresh's
// credential retry loop, and playerLogQuit.

import { init } from '@rematch/core';

import { appModel } from './models.app';
import { playerModel } from './models.player';
import { sessionModel } from './models.session';
import { basePlayingSession, TRACKS } from './__fixtures__/playerSession';
import * as playerX from 'js/services/player';
import * as bridge from 'js/services/bridge';
import { analyticsEvent } from 'js/utils';

// ======================================================================
// MOCKS
// ======================================================================

// models.player.js drives playback through the playerX service — mocked so
// tests can assert the calls without touching audio elements.
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
}));

// Every bridge function referenced by the three models under test, so no
// effect can accidentally hit the network.
vi.mock('js/services/bridge', () => ({
  // models.player.js
  logPlaybackPlay: vi.fn(),
  logPlaybackProgress: vi.fn(),
  logPlaybackPause: vi.fn(),
  logPlaybackStop: vi.fn(),
  logPlaybackQuit: vi.fn(),
  getAllArtistTracks: vi.fn(),
  getAlbumTracks: vi.fn(),
  getPlaylistTracks: vi.fn(),
  getFolderItems: vi.fn(),
  // models.app.js
  init: vi.fn(),
  plexLogin: vi.fn(),
  logout: vi.fn(),
  getAllUsers: vi.fn(),
  getAllServers: vi.fn(),
  getUserInfo: vi.fn(),
  getAllPlaylists: vi.fn(),
  // models.session.js
  switchUser: vi.fn(),
  abortAllRequests: vi.fn(),
  getAllLibraries: vi.fn(),
}));

// The components barrel pulls in JSX and SCSS that cannot be imported in a
// test run — only PlaybackErrorMessage is used by models.player.js.
vi.mock('js/components', () => ({
  PlaybackErrorMessage: vi.fn(() => 'error message'),
}));

// Keep the real utils (getTrackKeys, requiresTranscoding, sortList, etc.) but
// stub the analytics call so tests can assert the tracked event names.
vi.mock('js/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('js/utils')>();
  return {
    ...actual,
    analyticsEvent: vi.fn(),
  };
});

// ======================================================================
// SETUP
// ======================================================================

// Mirrors store.ts, which types the store as `any` until the models are
// converted to TypeScript.
type Store = any;

let store: Store;

// Seeds the playing session state; overrides are merged over the baseline.
const seedSession = (overrides: Record<string, unknown> = {}) => {
  store.dispatch.sessionModel.setSessionState({ ...basePlayingSession, ...overrides });
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(playerX.loadTrack).mockReturnValue(true);
  vi.mocked(playerX.getCurrentProgress).mockReturnValue(0);
  // A real Rematch store with the real models, so effects dispatch into real
  // reducers and cross-model state transitions can be asserted.
  store = init({ models: { appModel, playerModel, sessionModel } });
  store.dispatch.appModel.setAppState({ currentService: 'plex' });
  seedSession();
});

// ======================================================================
// TESTS
// ======================================================================

describe('Testing "playerModel" store effects', () => {
  //
  // INITIALISE
  //

  describe('playerInit', () => {
    // playerInit registers a window beforeunload listener bound to the store
    // created for that test — swallow the registrations so listeners don't
    // accumulate on the shared jsdom window across tests.
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => undefined);
    });
    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    test('Initialises the player with the saved volume state and marks it inited', () => {
      seedSession({ volumeLevel: 40, volumeMuted: true });
      store.dispatch.playerModel.playerInit();

      expect(playerX.init).toHaveBeenCalledTimes(1);
      expect(playerX.init).toHaveBeenCalledWith(
        expect.objectContaining({
          volumeLevel: 40,
          volumeMuted: true,
          onLoadStart: expect.any(Function),
          onCanPlay: expect.any(Function),
          onEnded: expect.any(Function),
          onError: expect.any(Function),
        })
      );
      expect(store.getState().playerModel.playerInited).toBe(true);
    });

    test('Auto-advances to the next track when the player reports the track has ended', () => {
      seedSession({ playingTrackIndex: 1 });
      store.dispatch.playerModel.playerInit();

      const { onEnded } = vi.mocked(playerX.init).mock.calls[0][0];
      onEnded();

      // ended -> playerNext(true) -> load the next track and play it
      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[2], undefined, true);
      expect(store.getState().sessionModel.playingTrackIndex).toBe(2);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Next Track (Auto)');
    });
  });

  describe('playerUnload', () => {
    test('Stops playback, clears the loaded track, and unloads the player', () => {
      store.dispatch.playerModel.setPlayerState({ playerPlaying: true, playerTrackLoaded: true });
      store.dispatch.playerModel.playerUnload();

      const state = store.getState().playerModel;
      expect(state.playerPlaying).toBe(false);
      expect(state.playerTrackLoaded).toBe(false);
      expect(playerX.unload).toHaveBeenCalledTimes(1);
    });
  });

  //
  // LOAD TRACKS
  //

  describe('playerLoadIndex', () => {
    test('Loads the track at the given index and starts playback', () => {
      store.dispatch.playerModel.playerLoadIndex({ index: 1, play: true, progress: 30 });

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[1], 30, true);
      const state = store.getState();
      expect(state.playerModel.playerPlaying).toBe(true);
      expect(state.playerModel.playerTrackLoaded).toBe(true);
      expect(state.playerModel.playerTrackError).toBe(false);
      expect(state.sessionModel.playingTrackIndex).toBe(1);
      expect(bridge.logPlaybackPlay).toHaveBeenCalledWith(TRACKS[1], 30);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Play (Track)');
    });

    test('Loads without playing when play is false', () => {
      store.dispatch.playerModel.playerLoadIndex({ index: 1, play: false });

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[1], undefined, false);
      const state = store.getState();
      expect(state.playerModel.playerPlaying).toBe(false);
      expect(state.playerModel.playerTrackLoaded).toBe(true);
      expect(state.playerModel.playerTrackError).toBe(false);
      expect(state.sessionModel.playingTrackIndex).toBe(1);
      expect(bridge.logPlaybackPlay).not.toHaveBeenCalled();
    });

    test('Flags a track error when the player cannot load the track', () => {
      vi.mocked(playerX.loadTrack).mockReturnValue(false);
      store.dispatch.playerModel.playerLoadIndex({ index: 1, play: true });

      const state = store.getState();
      expect(state.playerModel.playerPlaying).toBe(false);
      expect(state.playerModel.playerTrackLoaded).toBe(true);
      expect(state.playerModel.playerTrackError).toBe(true);
      expect(state.sessionModel.playingTrackIndex).toBe(1);
    });

    test('Unloads the playing state when the queue cannot be read (legacy pre-shuffle state)', () => {
      seedSession({ playingTrackKeys: null });
      store.dispatch.playerModel.playerLoadIndex({ index: 1, play: true });

      // the catch path resets the playing session state entirely
      expect(playerX.loadTrack).not.toHaveBeenCalled();
      const state = store.getState().sessionModel;
      expect(state.playingTrackList).toBe(null);
      expect(state.playingTrackIndex).toBe(null);
    });
  });

  //
  // PLAYER CONTROLS
  //

  describe('playerResume', () => {
    test('Resumes playback and logs the resume to the server', () => {
      seedSession({ playingTrackIndex: 1, playingTrackProgress: 30 });
      store.dispatch.playerModel.playerResume();

      expect(playerX.resume).toHaveBeenCalledTimes(1);
      expect(store.getState().playerModel.playerPlaying).toBe(true);
      expect(bridge.logPlaybackPlay).toHaveBeenCalledWith(TRACKS[1], 30);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Play (Resume)');
    });

    test('Reloads the current track instead of resuming after a track error', () => {
      seedSession({ playingTrackIndex: 1 });
      store.dispatch.playerModel.setPlayerState({ playerTrackError: true });
      store.dispatch.playerModel.playerResume();

      expect(playerX.resume).not.toHaveBeenCalled();
      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[1], undefined, true);
      const state = store.getState().playerModel;
      expect(state.playerPlaying).toBe(true);
      expect(state.playerTrackError).toBe(false);
    });
  });

  describe('playerPause', () => {
    test('Pauses the player and logs the pause when playing', () => {
      seedSession({ playingTrackIndex: 1, playingTrackProgress: 30 });
      store.dispatch.playerModel.setPlayerState({ playerPlaying: true });
      store.dispatch.playerModel.playerPause();

      expect(playerX.pause).toHaveBeenCalledTimes(1);
      expect(store.getState().playerModel.playerPlaying).toBe(false);
      expect(bridge.logPlaybackPause).toHaveBeenCalledWith(TRACKS[1], 30);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Pause');
    });

    test('Still pauses the player but does not log when already paused', () => {
      store.dispatch.playerModel.playerPause();

      expect(playerX.pause).toHaveBeenCalledTimes(1);
      expect(bridge.logPlaybackPause).not.toHaveBeenCalled();
      expect(analyticsEvent).not.toHaveBeenCalled();
    });
  });

  describe('playerProgress', () => {
    test('Stores progress and logs it to the server while playing', () => {
      seedSession({ playingTrackIndex: 1 });
      store.dispatch.playerModel.setPlayerState({ playerPlaying: true });
      store.dispatch.playerModel.playerProgress(120);

      expect(store.getState().sessionModel.playingTrackProgress).toBe(120);
      expect(bridge.logPlaybackProgress).toHaveBeenCalledWith(TRACKS[1], 120);
    });

    test('Ignores progress updates while paused', () => {
      store.dispatch.playerModel.playerProgress(120);

      expect(store.getState().sessionModel.playingTrackProgress).toBe(0);
      expect(bridge.logPlaybackProgress).not.toHaveBeenCalled();
    });
  });

  describe('playerPrev', () => {
    test('Restarts the current track when progress is greater than 5 seconds', () => {
      seedSession({ playingTrackIndex: 2 });
      vi.mocked(playerX.getCurrentProgress).mockReturnValue(42);
      store.dispatch.playerModel.playerPrev();

      expect(playerX.restart).toHaveBeenCalledTimes(1);
      expect(playerX.loadTrack).not.toHaveBeenCalled();
      const state = store.getState();
      expect(state.sessionModel.playingTrackIndex).toBe(2);
      expect(state.playerModel.playerPlaying).toBe(true);
      expect(state.playerModel.playerInteractionCount).toBe(1);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Restart Track');
    });

    test('Loads the previous track when progress is 5 seconds or less', () => {
      seedSession({ playingTrackIndex: 2 });
      vi.mocked(playerX.getCurrentProgress).mockReturnValue(3);
      store.dispatch.playerModel.playerPrev();

      expect(playerX.restart).not.toHaveBeenCalled();
      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[1], undefined, true);
      expect(store.getState().sessionModel.playingTrackIndex).toBe(1);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Previous Track');
    });

    test('Wraps to the last track when at track 0 with repeat all', () => {
      seedSession({ playingTrackIndex: 0, playingRepeatAll: true });
      store.dispatch.playerModel.playerPrev();

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[4], undefined, true);
      expect(store.getState().sessionModel.playingTrackIndex).toBe(4);
      expect(store.getState().playerModel.playerPlaying).toBe(true);
    });

    test('Restarts the current track when at track 0 without repeat all', () => {
      seedSession({ playingTrackIndex: 0 });
      store.dispatch.playerModel.playerPrev();

      expect(playerX.restart).toHaveBeenCalledTimes(1);
      expect(playerX.loadTrack).not.toHaveBeenCalled();
      expect(store.getState().sessionModel.playingTrackIndex).toBe(0);
    });
  });

  describe('playerNext', () => {
    test('Manual next advances to the next track and plays it', () => {
      seedSession({ playingTrackIndex: 1 });
      store.dispatch.playerModel.playerNext();

      expect(playerX.loadTrack).toHaveBeenCalledTimes(1);
      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[2], undefined, true);
      const state = store.getState();
      expect(state.sessionModel.playingTrackIndex).toBe(2);
      expect(state.playerModel.playerPlaying).toBe(true);
      expect(state.playerModel.playerTrackLoaded).toBe(true);
      expect(state.playerModel.playerTrackError).toBe(false);
      expect(bridge.logPlaybackPlay).toHaveBeenCalledWith(TRACKS[2], undefined);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Next Track');
    });

    test('Manual next at the last track without repeat loads track 0 without playing and logs a stop', () => {
      seedSession({ playingTrackIndex: 4 });
      store.dispatch.playerModel.playerNext();

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[0], undefined, false);
      const state = store.getState();
      expect(state.sessionModel.playingTrackIndex).toBe(0);
      expect(state.playerModel.playerPlaying).toBe(false);
      expect(bridge.logPlaybackStop).toHaveBeenCalledWith(TRACKS[4]);
      expect(bridge.logPlaybackPlay).not.toHaveBeenCalled();
    });

    test('Manual next at the last track with repeat all wraps to track 0 and plays it', () => {
      seedSession({ playingTrackIndex: 4, playingRepeatAll: true });
      store.dispatch.playerModel.playerNext();

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[0], undefined, true);
      const state = store.getState();
      expect(state.sessionModel.playingTrackIndex).toBe(0);
      expect(state.playerModel.playerPlaying).toBe(true);
      expect(bridge.logPlaybackStop).not.toHaveBeenCalled();
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Next Track (Restart)');
    });

    test('Auto next (track ended) with repeat once reloads the same track', () => {
      seedSession({ playingTrackIndex: 2, playingRepeatOnce: true });
      store.dispatch.playerModel.playerNext(true);

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[2], undefined, true);
      const state = store.getState().sessionModel;
      expect(state.playingTrackIndex).toBe(2);
      // repeat once is only cleared when the track index actually changes
      expect(state.playingRepeatOnce).toBe(true);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Next Track (Repeat Once) (Auto)');
    });

    test('Manual next with repeat once skips to the next track and reverts repeat once to repeat all', () => {
      seedSession({ playingTrackIndex: 1, playingRepeatOnce: true });
      store.dispatch.playerModel.playerNext();

      expect(playerX.loadTrack).toHaveBeenCalledWith(TRACKS[2], undefined, true);
      const state = store.getState().sessionModel;
      expect(state.playingTrackIndex).toBe(2);
      // disableRepeatOnceOnTrackChange (default on) clears repeat once, and
      // revertRepeatOnceToRepeatAll (default on) re-enables repeat all
      expect(state.playingRepeatOnce).toBe(false);
      expect(state.playingRepeatAll).toBe(true);
    });
  });

  describe('playerRepeatToggle', () => {
    test('Cycles repeat from off to all to once to off', () => {
      // off -> repeat all
      store.dispatch.playerModel.playerRepeatToggle();
      let state = store.getState().sessionModel;
      expect(state.playingRepeatAll).toBe(true);
      expect(state.playingRepeatOnce).toBe(false);
      expect(analyticsEvent).toHaveBeenLastCalledWith('Plex / Music / Repeat All');

      // repeat all -> repeat once
      store.dispatch.playerModel.playerRepeatToggle();
      state = store.getState().sessionModel;
      expect(state.playingRepeatAll).toBe(false);
      expect(state.playingRepeatOnce).toBe(true);
      expect(analyticsEvent).toHaveBeenLastCalledWith('Plex / Music / Repeat Once');

      // repeat once -> off
      store.dispatch.playerModel.playerRepeatToggle();
      state = store.getState().sessionModel;
      expect(state.playingRepeatAll).toBe(false);
      expect(state.playingRepeatOnce).toBe(false);
      expect(analyticsEvent).toHaveBeenLastCalledWith('Plex / Music / Repeat Off');
    });
  });

  describe('playerShuffleToggle', () => {
    test('Shuffle on recomputes the track keys keeping the playing track at the new index', () => {
      seedSession({ playingTrackIndex: 2 });
      store.dispatch.playerModel.playerShuffleToggle();

      const state = store.getState().sessionModel;
      expect(state.playingShuffle).toBe(true);
      // the new keys are a permutation of all five tracks
      expect([...state.playingTrackKeys].sort((a: number, b: number) => a - b)).toEqual([0, 1, 2, 3, 4]);
      // the entry at the new index is still the real track that was playing (real index 2)
      expect(state.playingTrackKeys[state.playingTrackIndex]).toBe(2);
      // getTrackKeys pins the playing track to the front of a fresh shuffle
      expect(state.playingTrackIndex).toBe(0);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Shuffle On');
    });

    test('Shuffle off restores sequential keys and repositions the playing track', () => {
      seedSession({ playingShuffle: true, playingTrackKeys: [3, 0, 2, 4, 1], playingTrackIndex: 2 });
      store.dispatch.playerModel.playerShuffleToggle();

      const state = store.getState().sessionModel;
      expect(state.playingShuffle).toBe(false);
      expect(state.playingTrackKeys).toEqual([0, 1, 2, 3, 4]);
      // real track 2 was playing (keys[2] of the shuffled order) and remains selected
      expect(state.playingTrackIndex).toBe(2);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Shuffle Off');
    });
  });

  //
  // VOLUME CONTROLS
  //

  describe('volumeRefresh', () => {
    test('Applies the saved volume level to the player', () => {
      seedSession({ volumeLevel: 60, volumeMuted: false });
      store.dispatch.playerModel.volumeRefresh();

      expect(playerX.setVolume).toHaveBeenCalledWith(60);
    });

    test('Applies a volume of 0 to the player when muted', () => {
      seedSession({ volumeLevel: 60, volumeMuted: true });
      store.dispatch.playerModel.volumeRefresh();

      expect(playerX.setVolume).toHaveBeenCalledWith(0);
    });
  });

  describe('volumeLevelSet', () => {
    test('Sets the volume level, unmutes, and updates the player volume', () => {
      seedSession({ volumeLevel: 10, volumeMuted: true });
      store.dispatch.playerModel.volumeLevelSet(30);

      const state = store.getState().sessionModel;
      expect(state.volumeLevel).toBe(30);
      expect(state.volumeMuted).toBe(false);
      expect(playerX.setVolume).toHaveBeenCalledWith(30);
    });
  });

  describe('volumeMuteToggle', () => {
    test('Unmutes and restores the default volume when muted at volume 0', () => {
      seedSession({ volumeMuted: true, volumeLevel: 0 });
      store.dispatch.playerModel.volumeMuteToggle();

      const state = store.getState().sessionModel;
      expect(state.volumeLevel).toBe(75);
      expect(state.volumeMuted).toBe(false);
      expect(playerX.setVolume).toHaveBeenCalledWith(75);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Mute Off');
    });

    test('Unmutes and keeps the saved volume when muted at a non-zero volume', () => {
      seedSession({ volumeMuted: true, volumeLevel: 60 });
      store.dispatch.playerModel.volumeMuteToggle();

      const state = store.getState().sessionModel;
      expect(state.volumeLevel).toBe(60);
      expect(state.volumeMuted).toBe(false);
      expect(playerX.setVolume).toHaveBeenCalledWith(60);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Mute Off');
    });

    test('Unmutes and restores the default volume when unmuted at volume 0', () => {
      seedSession({ volumeMuted: false, volumeLevel: 0 });
      store.dispatch.playerModel.volumeMuteToggle();

      const state = store.getState().sessionModel;
      expect(state.volumeLevel).toBe(75);
      expect(state.volumeMuted).toBe(false);
      expect(playerX.setVolume).toHaveBeenCalledWith(75);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Mute Off');
    });

    test('Mutes when unmuted at a non-zero volume', () => {
      seedSession({ volumeMuted: false, volumeLevel: 60 });
      store.dispatch.playerModel.volumeMuteToggle();

      const state = store.getState().sessionModel;
      expect(state.volumeLevel).toBe(60);
      expect(state.volumeMuted).toBe(true);
      expect(playerX.setVolume).toHaveBeenCalledWith(0);
      expect(analyticsEvent).toHaveBeenCalledWith('Plex / Music / Mute On');
    });
  });
});
