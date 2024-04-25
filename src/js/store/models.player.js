// ======================================================================
// IMPORTS
// ======================================================================

import { track } from '@vercel/analytics';

import * as plex from 'js/services/plex';

// ======================================================================
// STATE
// ======================================================================

const playerState = {
  playerElement: null,
  playerLoading: false,
  playerPlaying: false,
  playerVolume: 100,
  playerMuted: false,
  playerInteractionCount: 0,
};

const state = Object.assign({}, playerState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setPlayerState(rootState, payload) {
    // console.log('%c--- setPlayerState ---', 'color:#5c16b1');
    return { ...rootState, ...payload };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  //
  // INITIALISE
  //

  playerInit(payload, rootState) {
    // console.log('%c--- playerInit ---', 'color:#5c16b1');
    const playerElement = document.createElement('audio');
    const playerVolume = rootState.playerModel.playerVolume / 100;
    const playerMuted = rootState.playerModel.playerMuted;
    let loadstartTimeoutId = null;
    playerElement.volume = playerMuted ? 0 : playerVolume;
    dispatch.playerModel.setPlayerState({
      playerElement,
    });
    // load events
    playerElement.addEventListener('loadstart', () => {
      // console.log('loadstart');
      clearTimeout(loadstartTimeoutId);
      loadstartTimeoutId = setTimeout(() => {
        dispatch.playerModel.playerSetLoading(true);
      }, 1000);
    });
    playerElement.addEventListener('canplay', () => {
      // console.log('canplay');
      clearTimeout(loadstartTimeoutId);
      dispatch.playerModel.playerSetLoading(false);
    });
    // play next track when current track ends
    playerElement.addEventListener('ended', () => {
      dispatch.playerModel.playerNext(true);
    });
  },

  playerRefresh(payload, rootState) {
    console.log('%c--- playerRefresh ---', 'color:#5c16b1');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    if (playingTrackIndex || playingTrackIndex === 0) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex, play: false, progress: playingTrackProgress });
    }
  },

  playerSetLoading(payload, rootState) {
    const playerLoading = rootState.playerModel.playerLoading;
    if (playerLoading !== payload) {
      dispatch.playerModel.setPlayerState({
        playerLoading: payload,
      });
    }
  },

  playerUnload(payload, rootState) {
    console.log('%c--- playerUnload ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    playerElement.pause();
    playerElement.src = '';
    playerElement.load();
    dispatch.playerModel.setPlayerState({
      playerPlaying: false,
    });
  },

  //
  // LOAD TRACKS
  //

  playerLoadTrackItem(payload, rootState) {
    const { playingVariant, playingAlbumId, playingPlaylistId, playingTrackIndex } = payload;
    if (playingVariant === 'albums') {
      dispatch.playerModel.playerLoadAlbum({ albumId: playingAlbumId, trackIndex: playingTrackIndex });
    } else if (playingVariant === 'playlists') {
      dispatch.playerModel.playerLoadPlaylist({ playlistId: playingPlaylistId, trackIndex: playingTrackIndex });
    }
  },

  async playerLoadAlbum(payload, rootState) {
    const { albumId, trackIndex = 0 } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allAlbumTracks = rootState.appModel.allAlbumTracks;
    const currentAlbumTracks = allAlbumTracks[libraryId + '-' + albumId];

    if (!currentAlbumTracks) {
      await plex.getAlbumTracks(libraryId, albumId);
      dispatch.playerModel.playerLoadAlbum({ albumId, trackIndex });
      return;
    }

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'albums',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingAlbumId: albumId,
      playingPlaylistId: null,
      playingTrackIndex: trackIndex,
      playingTrackList: currentAlbumTracks,
      playingTrackCount: currentAlbumTracks.length,
      playingTrackProgress: 0,
    });

    track('Plex: Load Album');
  },

  async playerLoadPlaylist(payload, rootState) {
    const { playlistId, trackIndex = 0 } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allPlaylistTracks = rootState.appModel.allPlaylistTracks;
    const currentPlaylistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

    if (!currentPlaylistTracks) {
      await plex.getPlaylistTracks(libraryId, playlistId);
      dispatch.playerModel.playerLoadPlaylist({ playlistId, trackIndex });
      return;
    }

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'playlists',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingAlbumId: null,
      playingPlaylistId: playlistId,
      playingTrackIndex: trackIndex,
      playingTrackList: currentPlaylistTracks,
      playingTrackCount: currentPlaylistTracks.length,
      playingTrackProgress: 0,
    });

    track('Plex: Load Playlist');
  },

  playerLoadTrackList(payload, rootState) {
    // console.log('%c--- playerLoadTrackList ---', 'color:#5c16b1');
    dispatch.playerModel.setPlayerState({
      playerPlaying: true,
    });
    dispatch.sessionModel.setSessionState({
      ...payload,
    });
    // start playing
    const playerElement = rootState.playerModel.playerElement;
    playerElement.src = payload.playingTrackList[payload.playingTrackIndex].src;
    playerElement.load();
    playerElement.play().catch((error) => null);
    dispatch.playerModel.setPlayerState({
      playerInteractionCount: rootState.playerModel.playerInteractionCount + 1,
    });
  },

  playerLoadIndex(payload, rootState) {
    // console.log('%c--- playerLoadIndex ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const { index, play, progress } = payload;
    if (index || index === 0) {
      playerElement.src = playingTrackList[index].src;
      playerElement.load();
      if (progress) {
        playerElement.currentTime = progress / 1000;
      }
      if (play) {
        playerElement.play().catch((error) => null);
      }
    }
  },

  //
  // PLAYER CONTROLS
  //

  playerPlay(payload, rootState) {
    // console.log('%c--- playerPlay ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    playerElement.play().catch((error) => null);
    dispatch.playerModel.setPlayerState({
      playerPlaying: true,
    });
    track('Plex: Play');
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    playerElement.pause();
    dispatch.playerModel.setPlayerState({
      playerPlaying: false,
    });
    track('Plex: Pause');
  },

  playerRestart(payload, rootState) {
    // console.log('%c--- playerRestart ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    playerElement.currentTime = 0;
    dispatch.playerModel.setPlayerState({
      playerInteractionCount: rootState.playerModel.playerInteractionCount + 1,
    });
  },

  playerPrev(payload, rootState) {
    // console.log('%c--- playerPrev ---', 'color:#5c16b1');
    const playerElement = rootState.playerModel.playerElement;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingRepeat = rootState.sessionModel.playingRepeat;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    // play previous track, if available
    if (playingTrackIndex > 0 && playerElement.currentTime <= 5) {
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: playingTrackIndex - 1,
      });
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex - 1, play: true });
    }
    // else play last track, if on repeat
    else if (playingRepeat && playerElement.currentTime <= 5) {
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: playingTrackCount - 1,
      });
      dispatch.playerModel.playerLoadIndex({ index: playingTrackCount - 1, play: true });
    }
    // else restart current track
    else {
      dispatch.playerModel.playerRestart();
    }
    track('Plex: Previous Track');
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext ---', 'color:#5c16b1');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const playingRepeat = rootState.sessionModel.playingRepeat;
    // play next track, if available
    if (playingTrackIndex < playingTrackCount - 1) {
      dispatch.playerModel.setPlayerState({
        playerPlaying: true,
      });
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: playingTrackIndex + 1,
      });
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex + 1, play: true });
    }
    // else play first track, if on repeat
    else if (playingRepeat) {
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: 0,
      });
      dispatch.playerModel.playerLoadIndex({ index: 0, play: true });
    }
    // else load first track, but don't play
    else {
      dispatch.playerModel.setPlayerState({
        playerPlaying: false,
      });
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: 0,
      });
      dispatch.playerModel.playerLoadIndex({ index: 0, play: false });
    }
    if (payload === true) {
      track('Plex: Next Track (Auto)');
    } else {
      track('Plex: Next Track');
    }
  },

  playerVolumeSet(payload, rootState) {
    // console.log('%c--- playerVolumeSet ---', 'color:#5c16b1');
    dispatch.playerModel.setPlayerState({
      playerVolume: payload,
      playerMuted: false,
    });
    const playerElement = rootState.playerModel.playerElement;
    playerElement.volume = payload / 100;
  },

  playerMuteToggle(payload, rootState) {
    // console.log('%c--- playerMuteToggle ---', 'color:#5c16b1');
    const playerVolume = rootState.playerModel.playerVolume;
    const playerMuted = rootState.playerModel.playerMuted;
    let newVolume;
    let newMuted;
    // if muted and volume is 0, unmute and set volume to 100
    if (playerMuted && playerVolume === 0) {
      newVolume = 75;
      newMuted = false;
    }
    // if muted and volume is not 0, unmute
    else if (playerMuted) {
      newVolume = playerVolume;
      newMuted = false;
    }
    // if not muted and volume is 0, unmute and set volume to 100
    else if (!playerMuted && playerVolume === 0) {
      newVolume = 75;
      newMuted = false;
    }
    // if not muted and volume is not 0, mute
    else {
      newVolume = playerVolume;
      newMuted = true;
    }
    // save state
    dispatch.playerModel.setPlayerState({
      playerVolume: newVolume,
      playerMuted: newMuted,
    });
    const playerElement = rootState.playerModel.playerElement;
    playerElement.volume = newMuted ? 0 : newVolume / 100;
  },

  playerToggleRepeat(payload, rootState) {
    // console.log('%c--- toggleRepeat ---', 'color:#5c16b1');
    const playingRepeat = rootState.sessionModel.playingRepeat;
    dispatch.sessionModel.setSessionState({
      playingRepeat: !playingRepeat,
    });
  },

  playerToggleShuffle(payload, rootState) {
    // console.log('%c--- toggleShuffle ---', 'color:#5c16b1');
    const playingShuffle = rootState.sessionModel.playingShuffle;
    dispatch.sessionModel.setSessionState({
      playingShuffle: !playingShuffle,
    });
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const playerModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
