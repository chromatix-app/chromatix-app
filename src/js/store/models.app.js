// ======================================================================
// IMPORTS
// ======================================================================

import { track } from '@vercel/analytics';

import * as plex from 'js/services/plex';

// ======================================================================
// OPTIONS
// ======================================================================

const maxDataLength = 5;

// ======================================================================
// STATE
// ======================================================================

const appState = {
  inited: false,
  standalone: false,
  history: null,

  plexErrorGeneral: false,
  plexErrorLogin: false,
  plexErrorServer: false,

  scrollToPlaying: false,

  playerElement: null,
  playerLoading: false,
  playerPlaying: false,
  playerVolume: 100,
  playerMuted: false,
  playerInteractionCount: 0,
};

const userState = {
  loggedIn: false,
  currentUser: null,
  allServers: null,
};

const plexServerState = {
  plexBaseUrl: null,
  allLibraries: null,
};

const plexLibraryState = {
  // artists
  allArtists: null,
  allArtistAlbums: {},
  allArtistRelated: {},
  // albums
  allAlbums: null,
  allAlbumTracks: {},
  // playlists
  allPlaylists: null,
  allPlaylistTracks: {},
  // collections
  allCollections: null,
  allCollectionItems: {},
  // genres
  allArtistGenres: null,
  allArtistGenreItems: {},
  allAlbumGenres: null,
  allAlbumGenreItems: {},
  // styles
  allArtistStyles: null,
  allArtistStyleItems: {},
  allAlbumStyles: null,
  allAlbumStyleItems: {},
  // moods
  allArtistMoods: null,
  allArtistMoodItems: {},
  allAlbumMoods: null,
  allAlbumMoodItems: {},
};

const state = Object.assign({}, appState, userState, plexServerState, plexLibraryState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setAppState(rootState, payload) {
    // console.log('%c--- setAppState ---', 'color:#07a098');
    return { ...rootState, ...payload };
  },

  // showLoader(rootState) {
  //   return { ...rootState, loaderVisible: true };
  // },

  // hideLoader(rootState) {
  //   return { ...rootState, loaderVisible: false };
  // },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  init(payload, rootState) {
    console.log('%c--- init ---', 'color:#07a098');
    // detect if browser is standalone (i.e. a web app)
    if ('standalone' in window.navigator && !!window.navigator.standalone) {
      dispatch.appModel.setAppState({
        standalone: true,
      });
    }
    // save history for reference within models
    dispatch.appModel.setAppState({
      history: payload.history,
    });
    // initialise player
    dispatch.appModel.playerInit();
    // initialise persistent state
    dispatch.persistentModel.init();
    // initialise plex
    plex.init();
  },

  //
  // AUTH
  //

  doLogin(payload, rootState) {
    console.log('%c--- login ---', 'color:#07a098');
    plex.login();
  },

  doLogout(payload, rootState) {
    console.log('%c--- logout ---', 'color:#07a098');
    plex.logout();
    rootState.appModel.history.replace('/');
  },

  setLoggedIn(payload, rootState) {
    console.log('%c--- setLoggedIn ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      inited: true,
      loggedIn: true,
      currentUser: payload,
    });
    dispatch.sessionModel.loadLocalStorage();
    dispatch.appModel.playerRefresh();
    plex.getAllServers();
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      inited: true,
      ...userState,
      ...plexServerState,
      ...plexLibraryState,
    });
    dispatch.appModel.playerUnload();
    dispatch.sessionModel.setLoggedOut();
  },

  //
  // PLEX
  //

  plexErrorLogin(payload, rootState) {
    // console.log('%c--- plexErrorLogin ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      plexErrorLogin: true,
    });
  },

  dismissPlexErrorLogin(payload, rootState) {
    // console.log('%c--- dismissPlexErrorLogin ---', 'color:#07a098');
    if (rootState.appModel.isInited) {
      dispatch.appModel.setAppState({
        plexErrorLogin: false,
      });
    } else {
      window.location.reload();
    }
  },

  clearPlexServerState(payload, rootState) {
    console.log('%c--- clearPlexServerState ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      ...plexServerState,
      ...plexLibraryState,
    });
    dispatch.appModel.playerUnload();
  },

  clearPlexLibraryState(payload, rootState) {
    console.log('%c--- clearPlexLibraryState ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      ...plexLibraryState,
    });
    rootState.appModel.history.push('/');
    plex.getAllPlaylists();
  },

  storeAllServers(payload, rootState) {
    // console.log('%c--- storeAllServers ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      allServers: payload,
    });
    dispatch.sessionModel.refreshCurrentServer(payload);
    plex.getAllLibraries();
  },

  storeAllLibraries(payload, rootState) {
    // console.log('%c--- storeAllLibraries ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      allLibraries: payload,
    });
    dispatch.sessionModel.refreshCurrentLibrary(payload);
  },

  //
  // PLEX - ARTISTS
  //

  storeArtistDetails(payload, rootState) {
    console.log('%c--- storeArtistDetails ---', 'color:#07a098');
    const allArtists = [...rootState.appModel.allArtists];
    const artistIndex = allArtists.findIndex((artist) => artist.artistId === payload.artistId);
    if (artistIndex === -1) {
      // limit recent entries
      if (allArtists.length >= maxDataLength) {
        allArtists.shift();
      }
      // add the new entry and save
      allArtists.push(payload);
    } else {
      allArtists[artistIndex] = payload;
    }
    dispatch.appModel.setAppState({
      allArtists,
    });
  },

  storeArtistAlbums(payload, rootState) {
    console.log('%c--- storeArtistAlbums ---', 'color:#07a098');
    const { libraryId, artistId, artistAlbums } = payload;
    const allArtistAlbums = { ...rootState.appModel.allArtistAlbums };
    // limit recent entries
    const keys = Object.keys(allArtistAlbums);
    if (keys.length >= maxDataLength) {
      delete allArtistAlbums[keys[0]];
    }
    // add the new entry and save
    allArtistAlbums[libraryId + '-' + artistId] = artistAlbums;
    dispatch.appModel.setAppState({
      allArtistAlbums,
    });
  },

  storeArtistRelated(payload, rootState) {
    console.log('%c--- storeArtistRelated ---', 'color:#07a098');
    const { libraryId, artistId, artistRelated } = payload;
    const allArtistRelated = { ...rootState.appModel.allArtistRelated };
    // limit recent entries
    const keys = Object.keys(allArtistRelated);
    if (keys.length >= maxDataLength) {
      delete allArtistRelated[keys[0]];
    }
    // add the new entry and save
    allArtistRelated[libraryId + '-' + artistId] = artistRelated;
    dispatch.appModel.setAppState({
      allArtistRelated,
    });
  },

  //
  // PLEX - ALBUMS
  //

  storeAlbumDetails(payload, rootState) {
    console.log('%c--- storeAlbumDetails ---', 'color:#07a098');
    const allAlbums = [...rootState.appModel.allAlbums];
    const albumIndex = allAlbums.findIndex((album) => album.albumId === payload.albumId);
    if (albumIndex === -1) {
      // limit recent entries
      if (allAlbums.length >= maxDataLength) {
        allAlbums.shift();
      }
      // add the new entry and save
      allAlbums.push(payload);
    } else {
      allAlbums[albumIndex] = payload;
    }
    dispatch.appModel.setAppState({
      allAlbums,
    });
  },

  storeAlbumTracks(payload, rootState) {
    console.log('%c--- storeAlbumTracks ---', 'color:#07a098');
    const { libraryId, albumId, albumTracks } = payload;
    const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
    // limit recent entries
    const keys = Object.keys(allAlbumTracks);
    if (keys.length >= maxDataLength) {
      delete allAlbumTracks[keys[0]];
    }
    // add the new entry and save
    allAlbumTracks[libraryId + '-' + albumId] = albumTracks;
    dispatch.appModel.setAppState({
      allAlbumTracks,
    });
  },

  //
  // PLEX - PLAYLISTS
  //

  storePlaylistDetails(payload, rootState) {
    console.log('%c--- storePlaylistDetails ---', 'color:#07a098');
    const allPlaylists = [...rootState.appModel.allPlaylists];
    const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === payload.playlistId);
    if (playlistIndex === -1) {
      // limit recent entries
      if (allPlaylists.length >= maxDataLength) {
        allPlaylists.shift();
      }
      // add the new entry and save
      allPlaylists.push(payload);
    } else {
      allPlaylists[playlistIndex] = payload;
    }
    dispatch.appModel.setAppState({
      allPlaylists,
    });
  },

  storePlaylistTracks(payload, rootState) {
    console.log('%c--- storePlaylistTracks ---', 'color:#07a098');
    const { libraryId, playlistId, playlistTracks } = payload;
    const allPlaylistTracks = { ...rootState.appModel.allPlaylistTracks };
    // limit recent entries
    const keys = Object.keys(allPlaylistTracks);
    if (keys.length >= maxDataLength) {
      delete allPlaylistTracks[keys[0]];
    }
    // add the new entry and save
    allPlaylistTracks[libraryId + '-' + playlistId] = playlistTracks;
    dispatch.appModel.setAppState({
      allPlaylistTracks,
    });
  },

  //
  // PLEX - COLLECTIONS
  //

  storeCollectionItems(payload, rootState) {
    console.log('%c--- storeCollectionItems ---', 'color:#07a098');
    const { libraryId, collectionId, collectionItems } = payload;
    const allCollectionItems = { ...rootState.appModel.allCollectionItems };
    // limit recent entries
    const keys = Object.keys(allCollectionItems);
    if (keys.length >= maxDataLength) {
      delete allCollectionItems[keys[0]];
    }
    // add the new entry and save
    allCollectionItems[libraryId + '-' + collectionId] = collectionItems;
    dispatch.appModel.setAppState({
      allCollectionItems,
    });
  },

  //
  // PLEX - GENRES
  //

  storeArtistGenreItems(payload, rootState) {
    console.log('%c--- storeArtistGenreItems ---', 'color:#07a098');
    const { libraryId, genreId, artistGenreItems } = payload;
    const allArtistGenreItems = { ...rootState.appModel.allArtistGenreItems };
    // limit recent entries
    const keys = Object.keys(allArtistGenreItems);
    if (keys.length >= maxDataLength) {
      delete allArtistGenreItems[keys[0]];
    }
    // add the new entry and save
    allArtistGenreItems[libraryId + '-' + genreId] = artistGenreItems;
    dispatch.appModel.setAppState({
      allArtistGenreItems,
    });
  },

  storeAlbumGenreItems(payload, rootState) {
    console.log('%c--- storeAlbumGenreItems ---', 'color:#07a098');
    const { libraryId, genreId, albumGenreItems } = payload;
    const allAlbumGenreItems = { ...rootState.appModel.allAlbumGenreItems };
    // limit recent entries
    const keys = Object.keys(allAlbumGenreItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumGenreItems[keys[0]];
    }
    // add the new entry and save
    allAlbumGenreItems[libraryId + '-' + genreId] = albumGenreItems;
    dispatch.appModel.setAppState({
      allAlbumGenreItems,
    });
  },

  //
  // PLEX - STYLES
  //

  storeArtistStyleItems(payload, rootState) {
    console.log('%c--- storeArtistStyleItems ---', 'color:#07a098');
    const { libraryId, styleId, artistStyleItems } = payload;
    const allArtistStyleItems = { ...rootState.appModel.allArtistStyleItems };
    // limit recent entries
    const keys = Object.keys(allArtistStyleItems);
    if (keys.length >= maxDataLength) {
      delete allArtistStyleItems[keys[0]];
    }
    // add the new entry and save
    allArtistStyleItems[libraryId + '-' + styleId] = artistStyleItems;
    dispatch.appModel.setAppState({
      allArtistStyleItems,
    });
  },

  storeAlbumStyleItems(payload, rootState) {
    console.log('%c--- storeAlbumStyleItems ---', 'color:#07a098');
    const { libraryId, styleId, albumStyleItems } = payload;
    const allAlbumStyleItems = { ...rootState.appModel.allAlbumStyleItems };
    // limit recent entries
    const keys = Object.keys(allAlbumStyleItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumStyleItems[keys[0]];
    }
    // add the new entry and save
    allAlbumStyleItems[libraryId + '-' + styleId] = albumStyleItems;
    dispatch.appModel.setAppState({
      allAlbumStyleItems,
    });
  },

  //
  // PLEX - MOODS
  //

  storeArtistMoodItems(payload, rootState) {
    console.log('%c--- storeArtistMoodItems ---', 'color:#07a098');
    const { libraryId, moodId, artistMoodItems } = payload;
    const allArtistMoodItems = { ...rootState.appModel.allArtistMoodItems };
    // limit recent entries
    const keys = Object.keys(allArtistMoodItems);
    if (keys.length >= maxDataLength) {
      delete allArtistMoodItems[keys[0]];
    }
    // add the new entry and save
    allArtistMoodItems[libraryId + '-' + moodId] = artistMoodItems;
    dispatch.appModel.setAppState({
      allArtistMoodItems,
    });
  },

  storeAlbumMoodItems(payload, rootState) {
    console.log('%c--- storeAlbumMoodItems ---', 'color:#07a098');
    const { libraryId, moodId, albumMoodItems } = payload;
    const allAlbumMoodItems = { ...rootState.appModel.allAlbumMoodItems };
    // limit recent entries
    const keys = Object.keys(allAlbumMoodItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumMoodItems[keys[0]];
    }
    // add the new entry and save
    allAlbumMoodItems[libraryId + '-' + moodId] = albumMoodItems;
    dispatch.appModel.setAppState({
      allAlbumMoodItems,
    });
  },

  //
  // PLAYER
  //

  playerInit(payload, rootState) {
    // console.log('%c--- playerInit ---', 'color:#07a098');
    const playerElement = document.createElement('audio');
    const playerVolume = rootState.appModel.playerVolume / 100;
    const playerMuted = rootState.appModel.playerMuted;
    let loadstartTimeoutId = null;
    playerElement.volume = playerMuted ? 0 : playerVolume;
    dispatch.appModel.setAppState({
      playerElement,
    });
    // load events
    playerElement.addEventListener('loadstart', () => {
      // console.log('loadstart');
      clearTimeout(loadstartTimeoutId);
      loadstartTimeoutId = setTimeout(() => {
        dispatch.appModel.playerSetLoading(true);
      }, 1000);
    });
    playerElement.addEventListener('canplay', () => {
      // console.log('canplay');
      clearTimeout(loadstartTimeoutId);
      dispatch.appModel.playerSetLoading(false);
    });
    // play next track when current track ends
    playerElement.addEventListener('ended', () => {
      dispatch.appModel.playerNext(true);
    });
  },

  playerSetLoading(payload, rootState) {
    const playerLoading = rootState.appModel.playerLoading;
    if (playerLoading !== payload) {
      dispatch.appModel.setAppState({
        playerLoading: payload,
      });
    }
  },

  playerUnload(payload, rootState) {
    console.log('%c--- playerUnload ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
    playerElement.pause();
    playerElement.src = '';
    playerElement.load();
    dispatch.appModel.setAppState({
      playerPlaying: false,
    });
  },

  playerRefresh(payload, rootState) {
    console.log('%c--- playerRefresh ---', 'color:#07a098');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    if (playingTrackIndex || playingTrackIndex === 0) {
      dispatch.appModel.playerLoadIndex({ index: playingTrackIndex, play: false, progress: playingTrackProgress });
    }
  },

  playerLoadTrackItem(payload, rootState) {
    const { playingVariant, playingAlbumId, playingPlaylistId, playingTrackIndex } = payload;
    if (playingVariant === 'albums') {
      dispatch.appModel.playerLoadAlbum({ albumId: playingAlbumId, trackIndex: playingTrackIndex });
    } else if (playingVariant === 'playlists') {
      dispatch.appModel.playerLoadPlaylist({ playlistId: playingPlaylistId, trackIndex: playingTrackIndex });
    }
  },

  async playerLoadAlbum(payload, rootState) {
    const { albumId, trackIndex = 0 } = payload;

    const libraryId = rootState.sessionModel.currentLibrary?.libraryId;
    const allAlbumTracks = rootState.appModel.allAlbumTracks;
    const currentAlbumTracks = allAlbumTracks[libraryId + '-' + albumId];

    if (!currentAlbumTracks) {
      await plex.getAlbumTracks(libraryId, albumId);
      dispatch.appModel.playerLoadAlbum({ albumId, trackIndex });
      return;
    }

    dispatch.appModel.playerLoadTrackList({
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
      dispatch.appModel.playerLoadPlaylist({ playlistId, trackIndex });
      return;
    }

    dispatch.appModel.playerLoadTrackList({
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
    // console.log('%c--- playerLoadTrackList ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      playerPlaying: true,
    });
    dispatch.sessionModel.setSessionState({
      ...payload,
    });
    // start playing
    const playerElement = rootState.appModel.playerElement;
    playerElement.src = payload.playingTrackList[payload.playingTrackIndex].src;
    playerElement.load();
    playerElement.play().catch((error) => null);
    dispatch.appModel.setAppState({
      playerInteractionCount: rootState.appModel.playerInteractionCount + 1,
    });
  },

  playerLoadIndex(payload, rootState) {
    // console.log('%c--- playerLoadIndex ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
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

  playerPlay(payload, rootState) {
    // console.log('%c--- playerPlay ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
    playerElement.play().catch((error) => null);
    dispatch.appModel.setAppState({
      playerPlaying: true,
    });
    track('Plex: Play');
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
    playerElement.pause();
    dispatch.appModel.setAppState({
      playerPlaying: false,
    });
    track('Plex: Pause');
  },

  playerRestart(payload, rootState) {
    // console.log('%c--- playerRestart ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
    playerElement.currentTime = 0;
    dispatch.appModel.setAppState({
      playerInteractionCount: rootState.appModel.playerInteractionCount + 1,
    });
  },

  playerPrev(payload, rootState) {
    // console.log('%c--- playerPrev ---', 'color:#07a098');
    const playerElement = rootState.appModel.playerElement;
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    // go to previous track, if available
    if (playingTrackIndex > 0 && playerElement.currentTime <= 5) {
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: playingTrackIndex - 1,
      });
      dispatch.appModel.playerLoadIndex({ index: playingTrackIndex - 1, play: true });
    }
    // restart the current track
    else {
      dispatch.appModel.playerRestart();
    }
    track('Plex: Previous Track');
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext ---', 'color:#07a098');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackCount = rootState.sessionModel.playingTrackCount;
    if (playingTrackIndex < playingTrackCount - 1) {
      dispatch.appModel.setAppState({
        playerPlaying: true,
      });
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: playingTrackIndex + 1,
      });
      dispatch.appModel.playerLoadIndex({ index: playingTrackIndex + 1, play: true });
    }
    // handle last track - loop back to first track and stop playing
    else {
      dispatch.appModel.setAppState({
        playerPlaying: false,
      });
      dispatch.sessionModel.setSessionState({
        playingTrackIndex: 0,
      });
      dispatch.appModel.playerLoadIndex({ index: 0, play: false });
    }
    if (payload === true) {
      track('Plex: Next Track (Auto)');
    } else {
      track('Plex: Next Track');
    }
  },

  playerVolumeSet(payload, rootState) {
    // console.log('%c--- playerVolumeSet ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      playerVolume: payload,
      playerMuted: false,
    });
    const playerElement = rootState.appModel.playerElement;
    playerElement.volume = payload / 100;
  },

  playerMuteToggle(payload, rootState) {
    // console.log('%c--- playerMuteToggle ---', 'color:#07a098');
    const playerVolume = rootState.appModel.playerVolume;
    const playerMuted = rootState.appModel.playerMuted;
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
    dispatch.appModel.setAppState({
      playerVolume: newVolume,
      playerMuted: newMuted,
    });
    const playerElement = rootState.appModel.playerElement;
    playerElement.volume = newMuted ? 0 : newVolume / 100;
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const appModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
