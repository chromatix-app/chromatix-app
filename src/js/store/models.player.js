// ======================================================================
// IMPORTS
// ======================================================================

import { analyticsEvent, getTrackKeys } from 'js/utils';
import * as playerX from 'js/services/player';
import * as plex from 'js/services/plex';

// ======================================================================
// STATE
// ======================================================================

const playerState = {
  playerInited: false,
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
    console.log('%c--- playerInit ---', 'color:#5c16b1');

    // get saved volume and muted state
    const playerVolume = rootState.playerModel.playerVolume / 100;
    const playerMuted = rootState.playerModel.playerMuted;

    // player events
    let loadstartTimeoutId = null;
    const onLoadStart = () => {
      // console.log('loadstart');
      clearTimeout(loadstartTimeoutId);
      loadstartTimeoutId = setTimeout(() => {
        dispatch.playerModel.playerSetLoading(true);
      }, 1000);
    };
    const onCanPlay = () => {
      // console.log('canplay');
      clearTimeout(loadstartTimeoutId);
      dispatch.playerModel.playerSetLoading(false);
    };
    const onEnded = () => {
      // console.log('ended');
      dispatch.playerModel.playerNext(true);
    };

    // create and save player element
    playerX.init(playerVolume, playerMuted, onLoadStart, onCanPlay, onEnded);
    dispatch.playerModel.setPlayerState({
      playerInited: true,
    });

    // handle quit
    window.addEventListener('beforeunload', () => {
      dispatch.playerModel.playerLogQuit();
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
    playerX.unload();
    dispatch.playerModel.setPlayerState({
      playerPlaying: false,
    });
  },

  playerLogQuit(payload, rootState) {
    // console.log('%c--- playerLogQuit ---', 'color:#5c16b1');
    try {
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      plex.logPlaybackQuit(currentTrack, playingTrackProgress);
    } catch (error) {
      // do nothing
    }
  },

  //
  // LOAD TRACKS
  //

  playerLoadTrackItem(payload, rootState) {
    // console.log('%c--- playerLoadTrackItem ---', 'color:#5c16b1');

    const { playingVariant, playingAlbumId, playingPlaylistId, playingFolderId, playingOrder, playingTrackIndex } =
      payload;
    const isShuffle = rootState.sessionModel.playingShuffle;
    if (playingVariant === 'albums') {
      dispatch.playerModel.playerLoadAlbum({
        albumId: playingAlbumId,
        playingOrder: playingOrder,
        trackIndex: playingTrackIndex,
        isShuffle: isShuffle,
        isTrack: true, // this ensures that the trackIndex is used
      });
    } else if (playingVariant === 'playlists') {
      dispatch.playerModel.playerLoadPlaylist({
        playlistId: playingPlaylistId,
        playingOrder: playingOrder,
        trackIndex: playingTrackIndex,
        isShuffle: isShuffle,
        isTrack: true, // this ensures that the trackIndex is used
      });
    } else if (playingVariant === 'folders') {
      dispatch.playerModel.playerLoadFolder({
        folderId: playingFolderId,
        playingOrder: playingOrder,
        trackIndex: playingTrackIndex,
        isShuffle: isShuffle,
        isTrack: true, // this ensures that the trackIndex is used
      });
    }
  },

  async playerLoadAlbum(payload, rootState) {
    // console.log('%c--- playerLoadAlbum ---', 'color:#5c16b1');
    const { albumId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allAlbumTracks = rootState.appModel.allAlbumTracks;
    const currentAlbumTracks = allAlbumTracks[libraryId + '-' + albumId];

    if (!currentAlbumTracks) {
      await plex.getAlbumTracks(libraryId, albumId);
      dispatch.playerModel.playerLoadAlbum({ albumId, trackIndex });
      return;
    }

    const trackKeys = getTrackKeys(currentAlbumTracks.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'albums',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingAlbumId: albumId,
      playingPlaylistId: null,
      playingFolderId: null,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentAlbumTracks,
      playingTrackCount: currentAlbumTracks.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent('Plex: Play (Album)');
  },

  async playerLoadPlaylist(payload, rootState) {
    // console.log('%c--- playerLoadPlaylist ---', 'color:#5c16b1');
    const { playlistId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allPlaylistTracks = rootState.appModel.allPlaylistTracks;
    const currentPlaylistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

    if (!currentPlaylistTracks) {
      await plex.getPlaylistTracks(libraryId, playlistId);
      dispatch.playerModel.playerLoadPlaylist({ playlistId, trackIndex });
      return;
    }

    const trackKeys = getTrackKeys(currentPlaylistTracks.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'playlists',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingAlbumId: null,
      playingPlaylistId: playlistId,
      playingFolderId: null,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentPlaylistTracks,
      playingTrackCount: currentPlaylistTracks.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent('Plex: Play (Playlist)');
  },

  async playerLoadFolder(payload, rootState) {
    // console.log('%c--- playerLoadFolder ---', 'color:#5c16b1');
    const { folderId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allFolderItems = rootState.appModel.allFolderItems;
    const currentFolderItems = allFolderItems[libraryId + '-' + folderId]?.filter((entry) => entry.kind === 'track');

    if (!currentFolderItems) {
      await plex.getFolderItems(folderId);
      dispatch.playerModel.playerLoadFolder({ folderId, trackIndex });
      return;
    }

    const trackKeys = getTrackKeys(currentFolderItems.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'folders',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingAlbumId: null,
      playingPlaylistId: null,
      playingFolderId: folderId,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentFolderItems,
      playingTrackCount: currentFolderItems.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent('Plex: Play (Folder)');
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
    const currentTrack = payload.playingTrackList[payload.playingTrackKeys[payload.playingTrackIndex]];
    playerX.loadTrack(currentTrack.src);
    dispatch.playerModel.setPlayerState({
      playerInteractionCount: rootState.playerModel.playerInteractionCount + 1,
    });
    plex.logPlaybackPlay(currentTrack);
  },

  playerLoadIndex(payload, rootState) {
    // console.log('%c--- playerLoadIndex ---', 'color:#5c16b1');
    try {
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const { index, play, progress } = payload;
      if (index || index === 0) {
        const currentTrack = playingTrackList[playingTrackKeys[index]];
        dispatch.playerModel.setPlayerState({
          playerPlaying: play,
        });
        dispatch.sessionModel.setSessionState({
          playingTrackIndex: index,
        });
        playerX.loadTrack(currentTrack.src, progress, play);
        if (play) {
          plex.logPlaybackPlay(currentTrack, progress);
          analyticsEvent('Plex: Play (Track)');
        }
      }
    } catch (error) {
      // this catches older users before shuffle was implemented
      dispatch.sessionModel.unloadTrack();
    }
  },

  //
  // PLAYER CONTROLS
  //

  playerResume(payload, rootState) {
    // console.log('%c--- playerResume ---', 'color:#5c16b1');
    playerX.resume();
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
    dispatch.playerModel.setPlayerState({
      playerPlaying: true,
    });
    plex.logPlaybackPlay(currentTrack, playingTrackProgress);
    analyticsEvent('Plex: Play (Resume)');
  },

  playerProgress(payload, rootState) {
    // console.log('%c--- playerProgress ---', 'color:#5c16b1');
    const playerPlaying = rootState.playerModel.playerPlaying;
    if (playerPlaying) {
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      dispatch.sessionModel.setPlayingTrackProgress(payload);
      plex.logPlaybackProgress(currentTrack, payload);
    }
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#5c16b1');
    playerX.pause();
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
    dispatch.playerModel.setPlayerState({
      playerPlaying: false,
    });
    plex.logPlaybackPause(currentTrack, playingTrackProgress);
    analyticsEvent('Plex: Pause');
  },

  playerRestart(payload, rootState) {
    // console.log('%c--- playerRestart ---', 'color:#5c16b1');
    playerX.restart();
    dispatch.playerModel.setPlayerState({
      playerPlaying: true,
      playerInteractionCount: rootState.playerModel.playerInteractionCount + 1,
    });
  },

  playerPrev(payload, rootState) {
    // console.log('%c--- playerPrev ---', 'color:#5c16b1');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingRepeat = rootState.sessionModel.playingRepeat;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const currentTime = playerX.getCurrentProgress();
    // play previous track, if available
    if (playingTrackIndex > 0 && currentTime <= 5) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex - 1, play: true });
    }
    // else play last track, if on repeat
    else if (playingRepeat && currentTime <= 5) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackCount - 1, play: true });
    }
    // else restart current track
    else {
      dispatch.playerModel.playerRestart();
    }
    analyticsEvent('Plex: Previous Track');
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext ---', 'color:#5c16b1');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const playingRepeat = rootState.sessionModel.playingRepeat;
    const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
    // play next track, if available
    if (playingTrackIndex < playingTrackCount - 1) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex + 1, play: true });
      if (payload === true) {
        analyticsEvent('Plex: Next Track (Auto)');
      } else {
        analyticsEvent('Plex: Next Track');
      }
    }
    // else play first track, if on repeat
    else if (playingRepeat) {
      dispatch.playerModel.playerLoadIndex({ index: 0, play: true });
      if (payload === true) {
        analyticsEvent('Plex: Next Track (Restart) (Auto)');
      } else {
        analyticsEvent('Plex: Next Track (Restart)');
      }
    }
    // else load first track, but don't play
    else {
      dispatch.playerModel.playerLoadIndex({ index: 0, play: false });
      plex.logPlaybackStop(currentTrack);
    }
  },

  playerRepeatToggle(payload, rootState) {
    // console.log('%c--- toggleRepeat ---', 'color:#5c16b1');
    const playingRepeat = rootState.sessionModel.playingRepeat;
    dispatch.sessionModel.setSessionState({
      playingRepeat: !playingRepeat,
    });
    analyticsEvent('Plex: Repeat ' + (!playingRepeat ? 'On' : 'Off'));
  },

  playerShuffleToggle(payload, rootState) {
    // console.log('%c--- toggleShuffle ---', 'color:#5c16b1');
    const playingOrder = rootState.sessionModel.playingOrder;
    const playingShuffle = rootState.sessionModel.playingShuffle;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const isShuffle = !playingShuffle;

    const realIndex = rootState.sessionModel.playingTrackKeys[playingTrackIndex];
    const trackKeys = getTrackKeys(playingTrackCount, playingOrder, isShuffle, realIndex);
    const newIndex = trackKeys.indexOf(realIndex);

    dispatch.sessionModel.setSessionState({
      playingShuffle: isShuffle,
      playingTrackIndex: newIndex,
      playingTrackKeys: trackKeys,
    });
    analyticsEvent('Plex: Shuffle ' + (isShuffle ? 'On' : 'Off'));
  },

  //
  // VOLUME CONTROLS
  //

  playerVolumeSet(payload, rootState) {
    // console.log('%c--- playerVolumeSet ---', 'color:#5c16b1');
    dispatch.playerModel.setPlayerState({
      playerVolume: payload,
      playerMuted: false,
    });
    playerX.setVolume(payload);
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
    const actualVolume = newMuted ? 0 : newVolume;
    playerX.setVolume(actualVolume);
    analyticsEvent('Plex: Mute ' + (newMuted ? 'On' : 'Off'));
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
