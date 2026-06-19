// ======================================================================
// IMPORTS
// ======================================================================

import { PlaybackErrorMessage } from 'js/components';
import { analyticsEvent, getDashSrc, getTrackKeys, requiresTranscoding } from 'js/utils';
import * as playerX from 'js/services/player';
import * as bridge from 'js/services/bridge';

// ======================================================================
// STATE
// ======================================================================

const playerState = {
  playerInited: false,
  playerLoading: false,
  playerPlaying: false,
  playerTrackLoaded: false,
  playerTrackError: false,
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
    const volumeLevel = rootState.sessionModel.volumeLevel;
    const volumeMuted = rootState.sessionModel.volumeMuted;

    // player events
    let loadstartTimeoutId = null;
    const onLoadStart = () => {
      // console.log('loadstart');
      clearTimeout(loadstartTimeoutId);
      loadstartTimeoutId = setTimeout(() => {
        dispatch.playerModel.playerSetLoading(true);
      }, 600);
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
    playerX.init({
      volumeLevel,
      volumeMuted,
      onLoadStart,
      onCanPlay,
      onEnded,
      onError: dispatch.playerModel.playerError,
    });
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
    dispatch.playerModel.volumeRefresh();
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    if (playingTrackIndex || playingTrackIndex === 0) {
      dispatch.playerModel.playerRefreshTrack({ index: playingTrackIndex, progress: playingTrackProgress });
    }
  },

  playerRefreshTrack(payload, rootState) {
    // For Plex DASH tracks, serverBaseUrl and userToken are needed to build the
    // manifest URL and load asynchronously after login, so retry until both are
    // available. Native-codec Plex tracks and all Jellyfin tracks embed their
    // credentials in the stored src URL and need no waiting.
    const currentService = rootState.appModel.currentService;
    const serverBaseUrl = rootState.appModel.serverBaseUrl;
    const userToken = rootState.appModel.userToken;
    const track = rootState.sessionModel.playingTrackList?.[rootState.sessionModel.playingTrackKeys?.[payload.index]];
    const plexDashCredentialsMissing =
      currentService === 'plex' && requiresTranscoding(track?.codec) && (!serverBaseUrl || !userToken);
    if (plexDashCredentialsMissing) {
      const retryCount = (payload.retryCount || 0) + 1;
      // Give up after ~30 seconds (300 retries × 100 ms). Set playerTrackError so
      // the user can still manually trigger a retry via the play button.
      if (retryCount > 300) {
        console.warn('%c--- playerRefreshTrack - credentials not available after 30s, giving up ---', 'color:#f00');
        dispatch.playerModel.setPlayerState({
          playerTrackLoaded: true,
          playerTrackError: true,
        });
        return;
      }
      setTimeout(() => dispatch.playerModel.playerRefreshTrack({ ...payload, retryCount }), 100);
      return;
    }
    console.log('%c--- playerRefreshTrack ---', 'color:#5c16b1');
    dispatch.playerModel.playerLoadIndex({ index: payload.index, play: false, progress: payload.progress });
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
    dispatch.playerModel.setPlayerState({
      playerPlaying: false,
      playerTrackLoaded: false,
    });
    playerX.unload();
  },

  //
  // PLAYBACK ERROR HANDLING
  //

  playerError(payload, rootState) {
    const { event, playerElement } = payload;
    const mediaError = playerElement.error;
    let errorCode = 'Unknown';
    let errorMessage = 'Unknown';

    // Attempt to determine the error type
    if (mediaError) {
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorCode = 'MEDIA_ERR_ABORTED';
          errorMessage = 'Fetching process aborted by user';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorCode = 'MEDIA_ERR_NETWORK';
          errorMessage = 'Network error occurred while fetching the media';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorCode = 'MEDIA_ERR_DECODE';
          errorMessage = 'Media decoding error - file might be corrupted or unsupported format';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorCode = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
          errorMessage = 'Media source not supported - check format or CORS issues';
          break;
        default:
          break;
      }
      if (mediaError.message) {
        errorMessage += `: ${mediaError.message}`;
      }
    }

    const playerTrackLoaded = rootState.playerModel.playerTrackLoaded;

    // Always log the error so we can diagnose it
    console.error('%c--- player - error ---', 'color:#f00', {
      errorCode,
      errorMessage,
      playerTrackLoaded,
      mediaError,
      sourceURL: playerElement.src,
      originalEvent: event,
    });

    if (playerTrackLoaded) {
      // Player is currently playing - try next track
      dispatch.playerModel.setPlayerState({
        playerTrackError: true,
      });
      dispatch.playerModel.playerErrorPlayback(true);
    }
  },

  playerErrorPlayback(payload, rootState) {
    // Determine the current track
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    const trackCurrent = playingTrackList?.[playingTrackKeys[playingTrackIndex]];

    // Display notification
    dispatch.appModel.addNotification({
      title: 'Playback error',
      description: PlaybackErrorMessage({ trackTitle: trackCurrent.title, trackArtist: trackCurrent.artist }),
    });

    // Try to play the next track (after a short delay)
    if (payload) {
      const isLastTrack = playingTrackIndex === playingTrackKeys.length - 1;
      const playingRepeatAll = rootState.sessionModel.playingRepeatAll;
      const playingRepeatOnce = rootState.sessionModel.playingRepeatOnce;
      if (isLastTrack && (playingRepeatAll || playingRepeatOnce)) {
        dispatch.sessionModel.setSessionState({
          playingRepeatAll: false,
          playingRepeatOnce: false,
        });
      }
      setTimeout(function () {
        dispatch.playerModel.playerErrorNext();
      }, 700);
    }
  },

  playerErrorNext(payload, rootState) {
    if (rootState.playerModel.playerPlaying) {
      dispatch.playerModel.playerNext(true);
    }
  },

  playerLogQuit(payload, rootState) {
    // console.log('%c--- playerLogQuit ---', 'color:#5c16b1');
    try {
      // log playback state to server
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      bridge.logPlaybackQuit(currentTrack, playingTrackProgress);
    } catch (error) {
      // do nothing
    }
  },

  //
  // LOAD TRACKS
  //

  playerLoadTrackItem(payload, rootState) {
    // console.log('%c--- playerLoadTrackItem ---', 'color:#5c16b1');
    const {
      playingVariant,
      playingArtistId,
      playingArtistName,
      playingAlbumId,
      playingPlaylistId,
      playingFolderId,
      playingOrder,
      playingTrackIndex,
    } = payload;
    const isShuffle = rootState.sessionModel.playingShuffle;
    if (playingVariant === 'artists') {
      dispatch.playerModel.playerLoadArtist({
        artistId: playingArtistId,
        artistName: playingArtistName,
        playingOrder: playingOrder,
        trackIndex: playingTrackIndex,
        isShuffle: isShuffle,
        isTrack: true, // this ensures that the trackIndex is used
      });
    } else if (playingVariant === 'albums') {
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

  async playerLoadArtist(payload, rootState) {
    console.log('%c--- playerLoadArtist ---', 'color:#5c16b1');
    const { artistId, artistName, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const currentService = rootState.appModel.currentService;
    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allArtistTracks = rootState.appModel.allArtistTracks;
    const currentArtistTracks = allArtistTracks[libraryId + '-' + artistId];

    // handle playing an artist before tracks are loaded
    if (!currentArtistTracks) {
      await bridge.getAllArtistTracks(libraryId, artistId, artistName);
      dispatch.playerModel.playerLoadArtist(payload);
      return;
    }

    const trackKeys = getTrackKeys(currentArtistTracks.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'artists',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingArtistId: artistId,
      playingAlbumId: null,
      playingPlaylistId: null,
      playingFolderId: null,
      playingLink: `/libraries/${rootState.sessionModel.currentLibrary?.libraryId}/artists/${artistId}`,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentArtistTracks,
      playingTrackCount: currentArtistTracks.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Artist)');
  },

  async playerLoadAlbum(payload, rootState) {
    console.log('%c--- playerLoadAlbum ---', 'color:#5c16b1');
    const { albumId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const currentService = rootState.appModel.currentService;
    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allAlbumTracks = rootState.appModel.allAlbumTracks;
    const currentAlbumTracks = allAlbumTracks[libraryId + '-' + albumId];

    // handle playing an album before tracks are loaded
    if (!currentAlbumTracks) {
      await bridge.getAlbumTracks(libraryId, albumId);
      dispatch.playerModel.playerLoadAlbum(payload);
      return;
    }

    const trackKeys = getTrackKeys(currentAlbumTracks.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'albums',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingArtistId: null,
      playingAlbumId: albumId,
      playingPlaylistId: null,
      playingFolderId: null,
      playingLink: `/libraries/${rootState.sessionModel.currentLibrary?.libraryId}/albums/${albumId}`,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentAlbumTracks,
      playingTrackCount: currentAlbumTracks.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Album)');
  },

  async playerLoadPlaylist(payload, rootState) {
    console.log('%c--- playerLoadPlaylist ---', 'color:#5c16b1');
    const { playlistId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const currentService = rootState.appModel.currentService;
    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allPlaylistTracks = rootState.appModel.allPlaylistTracks;
    const currentPlaylistTracks = allPlaylistTracks[libraryId + '-' + playlistId];

    // handle playing a playlist before tracks are loaded
    if (!currentPlaylistTracks) {
      await bridge.getPlaylistTracks(libraryId, playlistId);
      dispatch.playerModel.playerLoadPlaylist(payload);
      return;
    }

    const trackKeys = getTrackKeys(currentPlaylistTracks.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'playlists',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingArtistId: null,
      playingAlbumId: null,
      playingPlaylistId: playlistId,
      playingFolderId: null,
      playingLink: `/libraries/${rootState.sessionModel.currentLibrary?.libraryId}/playlists/${playlistId}`,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentPlaylistTracks,
      playingTrackCount: currentPlaylistTracks.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Playlist)');
  },

  async playerLoadFolder(payload, rootState) {
    console.log('%c--- playerLoadFolder ---', 'color:#5c16b1');
    const { folderId, playingOrder = null, trackIndex = 0, isShuffle = false, isTrack = false } = payload;

    const currentService = rootState.appModel.currentService;
    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allFolderItems = rootState.appModel.allFolderItems;
    const currentFolderItems = allFolderItems[libraryId + '-' + folderId]?.filter((entry) => entry.kind === 'track');

    // handle playing a folder before tracks are loaded
    if (!currentFolderItems) {
      await bridge.getFolderItems(folderId);
      dispatch.playerModel.playerLoadFolder(payload);
      return;
    }

    const trackKeys = getTrackKeys(currentFolderItems.length, playingOrder, isShuffle, isTrack ? trackIndex : null);
    const realIndex = isTrack ? trackKeys.indexOf(trackIndex) : 0;

    dispatch.playerModel.playerLoadTrackList({
      playingVariant: 'folders',
      playingServerId: rootState.sessionModel.currentServer?.serverId,
      playingLibraryId: rootState.sessionModel.currentLibrary?.libraryId,
      playingArtistId: null,
      playingAlbumId: null,
      playingPlaylistId: null,
      playingFolderId: folderId,
      playingLink: `/libraries/${rootState.sessionModel.currentLibrary?.libraryId}/folders/${folderId}`,
      playingOrder: playingOrder,
      playingTrackIndex: realIndex,
      playingTrackKeys: trackKeys,
      playingTrackList: currentFolderItems,
      playingTrackCount: currentFolderItems.length,
      playingTrackProgress: 0,
      playingShuffle: isShuffle,
    });

    analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Folder)');
  },

  playerLoadTrackList(payload, rootState) {
    // console.log('%c--- playerLoadTrackList ---', 'color:#5c16b1');
    dispatch.playerModel.setPlayerState({
      playerPlaying: true,
      playerTrackLoaded: true,
      playerTrackError: false,
    });
    dispatch.sessionModel.setSessionState({
      ...payload,
    });
    // start playing
    const currentService = rootState.appModel.currentService;
    const serverBaseUrl = rootState.appModel.serverBaseUrl;
    const userToken = rootState.appModel.userToken;
    const sessionId = rootState.sessionModel.sessionId;
    const currentTrack = payload.playingTrackList[payload.playingTrackKeys[payload.playingTrackIndex]];
    playerX.loadTrack(withDashSrc(currentTrack, currentService, serverBaseUrl, userToken, sessionId));

    // Set next track for preloading
    const nextIndex = payload.playingTrackIndex + 1;
    if (nextIndex < payload.playingTrackCount) {
      const nextTrack = payload.playingTrackList[payload.playingTrackKeys[nextIndex]];
      playerX.setNextTrack(withDashSrc(nextTrack, currentService, serverBaseUrl, userToken, sessionId));
    } else {
      playerX.clearNextTrack();
    }

    dispatch.playerModel.setPlayerState({
      playerInteractionCount: rootState.playerModel.playerInteractionCount + 1,
    });
    // log playback state to server
    bridge.logPlaybackPlay(currentTrack);
    // disable repeat once
    const disableRepeatOnceOnSourceChange = rootState.sessionModel.disableRepeatOnceOnSourceChange;
    if (disableRepeatOnceOnSourceChange) {
      dispatch.playerModel.playerRepeatOff();
    }
  },

  playerLoadIndex(payload, rootState) {
    // console.log('%c--- playerLoadIndex ---', 'color:#5c16b1');
    try {
      const currentService = rootState.appModel.currentService;
      const disableRepeatOnceOnTrackChange = rootState.sessionModel.disableRepeatOnceOnTrackChange;
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const { index, play, progress } = payload;
      if (index || index === 0) {
        const currentTrack = playingTrackList[playingTrackKeys[index]];
        const serverBaseUrl = rootState.appModel.serverBaseUrl;
        const userToken = rootState.appModel.userToken;
        const sessionId = rootState.sessionModel.sessionId;
        const trackWithDash = withDashSrc(currentTrack, currentService, serverBaseUrl, userToken, sessionId);
        const trackLoaded = playerX.loadTrack(trackWithDash, progress, play);
        dispatch.playerModel.setPlayerState({
          playerPlaying: play,
          playerTrackLoaded: true,
          playerTrackError: !trackLoaded,
        });
        dispatch.sessionModel.setSessionState({
          playingTrackIndex: index,
        });

        // Set next track for preloading
        const nextIndex = index + 1;
        if (nextIndex < playingTrackKeys.length) {
          const nextTrack = playingTrackList[playingTrackKeys[nextIndex]];
          playerX.setNextTrack(withDashSrc(nextTrack, currentService, serverBaseUrl, userToken, sessionId));
        } else {
          playerX.clearNextTrack();
        }

        // log playback state to server
        if (play) {
          bridge.logPlaybackPlay(currentTrack, progress);
          analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Track)');
        }
        // disable repeat once
        if (playingTrackIndex !== index && disableRepeatOnceOnTrackChange) {
          dispatch.playerModel.playerRepeatOff();
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
    const playerTrackError = rootState.playerModel.playerTrackError;
    // If we know there was previously an error with the current track, try to load it again
    if (playerTrackError) {
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex, play: true });
    }
    // Otherwise, resume as normal
    else {
      playerX.resume();
      dispatch.playerModel.setPlayerState({
        playerPlaying: true,
      });
      // log playback state to server
      const currentService = rootState.appModel.currentService;
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      bridge.logPlaybackPlay(currentTrack, playingTrackProgress);
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Play (Resume)');
    }
  },

  playerProgress(payload, rootState) {
    // console.log('%c--- playerProgress ---', 'color:#5c16b1');
    const playerPlaying = rootState.playerModel.playerPlaying;
    if (playerPlaying) {
      dispatch.sessionModel.setPlayingTrackProgress(payload);

      // Update player with current progress (handles auto-preloading internally)
      playerX.updateProgress(payload);

      // log playback state to server
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      bridge.logPlaybackProgress(currentTrack, payload);
    }
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#5c16b1');
    playerX.pause();
    // log playback state to server
    if (rootState.playerModel.playerPlaying) {
      dispatch.playerModel.setPlayerState({
        playerPlaying: false,
      });
      const currentService = rootState.appModel.currentService;
      const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
      const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
      const playingTrackList = rootState.sessionModel.playingTrackList;
      const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
      const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];
      bridge.logPlaybackPause(currentTrack, playingTrackProgress);
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Pause');
    }
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
    const currentService = rootState.appModel.currentService;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingRepeatAll = rootState.sessionModel.playingRepeatAll;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const currentTime = playerX.getCurrentProgress();
    // play previous track, if available
    if (playingTrackIndex > 0 && currentTime <= 5) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex - 1, play: true });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Previous Track');
    }
    // else play last track, if on repeat
    else if (playingRepeatAll && currentTime <= 5) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackCount - 1, play: true });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Previous Track');
    }
    // else restart current track
    else {
      dispatch.playerModel.playerRestart();
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Restart Track');
    }
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext - ' + (payload === true ? 'true' : 'false') + ' ---', 'color:#5c16b1');
    const currentService = rootState.appModel.currentService;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    const playingTrackList = rootState.sessionModel.playingTrackList;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    const playingRepeatAll = rootState.sessionModel.playingRepeatAll;
    const playingRepeatOnce = rootState.sessionModel.playingRepeatOnce;
    const currentTrack = playingTrackList[playingTrackKeys[playingTrackIndex]];

    // repeat current track, if on repeat once
    if (playingRepeatOnce && payload === true) {
      dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex, play: true });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Next Track (Repeat Once) (Auto)');
    } else {
      // play next track, if available
      if (playingTrackIndex < playingTrackCount - 1) {
        dispatch.playerModel.playerLoadIndex({ index: playingTrackIndex + 1, play: true });
        if (payload === true) {
          analyticsEvent(toUpperFirst(currentService) + ' / Music / Next Track (Auto)');
        } else {
          analyticsEvent(toUpperFirst(currentService) + ' / Music / Next Track');
        }
      }
      // else play first track, if on repeat all
      else if (playingRepeatAll) {
        dispatch.playerModel.playerLoadIndex({ index: 0, play: true });
        if (payload === true) {
          analyticsEvent(toUpperFirst(currentService) + ' / Music / Next Track (Restart) (Auto)');
        } else {
          analyticsEvent(toUpperFirst(currentService) + ' / Music / Next Track (Restart)');
        }
      }
      // else load first track, but don't play
      else {
        dispatch.playerModel.playerLoadIndex({ index: 0, play: false });
        // log playback state to server
        bridge.logPlaybackStop(currentTrack);
      }
    }
  },

  playerRepeatToggle(payload, rootState) {
    // console.log('%c--- playerRepeatToggle ---', 'color:#5c16b1');
    const currentService = rootState.appModel.currentService;
    const playingRepeatAll = rootState.sessionModel.playingRepeatAll;
    const playingRepeatOnce = rootState.sessionModel.playingRepeatOnce;
    if (playingRepeatAll) {
      // repeat once
      dispatch.sessionModel.setSessionState({
        playingRepeatAll: false,
        playingRepeatOnce: true,
      });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Repeat Once');
    } else if (playingRepeatOnce) {
      // repeat off
      dispatch.sessionModel.setSessionState({
        playingRepeatAll: false,
        playingRepeatOnce: false,
      });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Repeat Off');
    } else {
      // repeat all
      dispatch.sessionModel.setSessionState({
        playingRepeatAll: true,
        playingRepeatOnce: false,
      });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Repeat All');
    }

    // Update the next track based on new repeat settings
    dispatch.playerModel.updateNextTrack();
  },

  playerRepeatOff(payload, rootState) {
    const currentService = rootState.appModel.currentService;
    const playingRepeatOnce = rootState.sessionModel.playingRepeatOnce;
    const revertRepeatOnceToRepeatAll = rootState.sessionModel.revertRepeatOnceToRepeatAll;
    if (playingRepeatOnce) {
      console.log('%c--- playerRepeatOff ---', 'color:#5c16b1');
      dispatch.sessionModel.setSessionState({
        playingRepeatAll: revertRepeatOnceToRepeatAll,
        playingRepeatOnce: false,
      });
      analyticsEvent(toUpperFirst(currentService) + ' / Music / Repeat All');

      // Update the next track based on new repeat settings
      dispatch.playerModel.updateNextTrack();
    }
  },

  playerShuffleToggle(payload, rootState) {
    // console.log('%c--- toggleShuffle ---', 'color:#5c16b1');
    const currentService = rootState.appModel.currentService;
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

    // Update the next track based on new order
    dispatch.playerModel.updateNextTrack();

    analyticsEvent(toUpperFirst(currentService) + ' / Music / Shuffle ' + (isShuffle ? 'On' : 'Off'));
  },

  updateNextTrack(payload, rootState) {
    // // Helper function to update the next track for preloading
    // [NOTE] Not currently used, but may be in future
    // const currentService = rootState.appModel.currentService;
    // const serverBaseUrl = rootState.appModel.serverBaseUrl;
    // const userToken = rootState.appModel.userToken;
    // const sessionId = rootState.sessionModel.sessionId;
    // const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    // const playingTrackList = rootState.sessionModel.playingTrackList;
    // const playingTrackKeys = rootState.sessionModel.playingTrackKeys;
    // const nextIndex = playingTrackIndex + 1;
    // if (nextIndex < playingTrackKeys.length) {
    //   const nextTrack = playingTrackList[playingTrackKeys[nextIndex]];
    //   playerX.setNextTrack(withDashSrc(nextTrack, currentService, serverBaseUrl, userToken, sessionId));
    // } else {
    //   playerX.clearNextTrack();
    // }
  },

  //
  // VOLUME CONTROLS
  //

  volumeRefresh(payload, rootState) {
    // console.log('%c--- volumeRefresh ---', 'color:#5c16b1');
    const volumeLevel = rootState.sessionModel.volumeLevel;
    const volumeMuted = rootState.sessionModel.volumeMuted;
    const actualVolume = volumeMuted ? 0 : volumeLevel;
    playerX.setVolume(actualVolume);
  },

  volumeLevelSet(payload, rootState) {
    // console.log('%c--- volumeLevelSet ---', 'color:#5c16b1');
    dispatch.sessionModel.setSessionState({
      volumeLevel: payload,
      volumeMuted: false,
    });
    playerX.setVolume(payload);
  },

  volumeMuteToggle(payload, rootState) {
    // console.log('%c--- volumeMuteToggle ---', 'color:#5c16b1');
    const defaultVolumeLevel = 75;
    const currentService = rootState.appModel.currentService;
    const volumeLevel = rootState.sessionModel.volumeLevel;
    const volumeMuted = rootState.sessionModel.volumeMuted;
    let newVolumeLevel;
    let newVolumeMuted;
    // if muted and volume is 0, unmute and set volume to default
    if (volumeMuted && volumeLevel === 0) {
      newVolumeLevel = defaultVolumeLevel;
      newVolumeMuted = false;
    }
    // if muted and volume is not 0, unmute
    else if (volumeMuted) {
      newVolumeLevel = volumeLevel;
      newVolumeMuted = false;
    }
    // if not muted and volume is 0, unmute and set volume to default
    else if (!volumeMuted && volumeLevel === 0) {
      newVolumeLevel = defaultVolumeLevel;
      newVolumeMuted = false;
    }
    // if not muted and volume is not 0, mute
    else {
      newVolumeLevel = volumeLevel;
      newVolumeMuted = true;
    }
    // save state
    dispatch.sessionModel.setSessionState({
      volumeLevel: newVolumeLevel,
      volumeMuted: newVolumeMuted,
    });
    const actualVolume = newVolumeMuted ? 0 : newVolumeLevel;
    playerX.setVolume(actualVolume);
    analyticsEvent(toUpperFirst(currentService) + ' / Music / Mute ' + (newVolumeMuted ? 'On' : 'Off'));
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

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

const toUpperFirst = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

// Adds a freshly computed dashSrc to a track if the current service is Plex
// and the necessary connection details are available.
const withDashSrc = (track, currentService, serverBaseUrl, accessToken, sessionId) => {
  if (currentService !== 'plex' || !track?.trackKey || !serverBaseUrl || !accessToken || !sessionId) {
    return track;
  }
  return { ...track, dashSrc: getDashSrc(track.trackKey, serverBaseUrl, accessToken, sessionId) };
};
