// ======================================================================
// IMPORTS
// ======================================================================

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
  allLibraries: null,
};

const plexLibraryState = {
  allArtists: null,
  allArtistAlbums: {},
  allArtistRelated: {},
  allAlbums: null,
  allAlbumTracks: {},
  allPlaylists: null,
  allPlaylistTracks: {},
};

const state = Object.assign(appState, userState, plexServerState, plexLibraryState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setAppState(rootState, payload) {
    // console.log('%c--- setAppState ---', 'color:#079189');
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
    console.log('%c--- init ---', 'color:#079189');
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
    // initialise plex
    plex.init();
  },

  //
  // AUTH
  //

  doLogin(payload, rootState) {
    console.log('%c--- login ---', 'color:#079189');
    plex.login();
  },

  doLogout(payload, rootState) {
    console.log('%c--- logout ---', 'color:#079189');
    plex.logout();
    rootState.appModel.history.replace('/');
  },

  setLoggedIn(payload, rootState) {
    console.log('%c--- setLoggedIn ---', 'color:#079189');
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
    console.log('%c--- setLoggedOut ---', 'color:#079189');
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
    // console.log('%c--- plexErrorLogin ---', 'color:#079189');
    dispatch.appModel.setAppState({
      plexErrorLogin: true,
    });
  },

  dismissPlexErrorLogin(payload, rootState) {
    // console.log('%c--- dismissPlexErrorLogin ---', 'color:#079189');
    if (rootState.appModel.isInited) {
      dispatch.appModel.setAppState({
        plexErrorLogin: false,
      });
    } else {
      window.location.reload();
    }
  },

  clearPlexServerState(payload, rootState) {
    console.log('%c--- clearPlexServerState ---', 'color:#079189');
    dispatch.appModel.setAppState({
      ...plexServerState,
      ...plexLibraryState,
    });
    dispatch.appModel.playerUnload();
  },

  clearPlexLibraryState(payload, rootState) {
    console.log('%c--- clearPlexLibraryState ---', 'color:#079189');
    dispatch.appModel.setAppState({
      ...plexLibraryState,
    });
    rootState.appModel.history.push('/');
    plex.getAllPlaylists();
  },

  storeAllServers(payload, rootState) {
    // console.log('%c--- storeAllServers ---', 'color:#079189');
    dispatch.appModel.setAppState({
      allServers: payload,
    });
    dispatch.sessionModel.refreshCurrentServer(payload);
    plex.getAllLibraries();
  },

  storeAllLibraries(payload, rootState) {
    // console.log('%c--- storeAllLibraries ---', 'color:#079189');
    dispatch.appModel.setAppState({
      allLibraries: payload,
    });
    dispatch.sessionModel.refreshCurrentLibrary(payload);
  },

  storeArtistDetails(payload, rootState) {
    console.log('%c--- storeArtistDetails ---', 'color:#079189');
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
    console.log('%c--- storeArtistAlbums ---', 'color:#079189');
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
    console.log('%c--- storeArtistRelated ---', 'color:#079189');
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

  storeAlbumDetails(payload, rootState) {
    console.log('%c--- storeAlbumDetails ---', 'color:#079189');
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
    console.log('%c--- storeAlbumTracks ---', 'color:#079189');
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

  storePlaylistDetails(payload, rootState) {
    console.log('%c--- storePlaylistDetails ---', 'color:#079189');
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
    console.log('%c--- storePlaylistTracks ---', 'color:#079189');
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
  // PLAYER
  //

  playerInit(payload, rootState) {
    // console.log('%c--- playerInit ---', 'color:#079189');
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
      dispatch.appModel.playerNext();
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
    console.log('%c--- playerUnload ---', 'color:#079189');
    const playerElement = rootState.appModel.playerElement;
    playerElement.pause();
    playerElement.src = '';
    playerElement.load();
    dispatch.appModel.setAppState({
      playerPlaying: false,
    });
  },

  playerRefresh(payload, rootState) {
    console.log('%c--- playerRefresh ---', 'color:#079189');
    const playingTrackIndex = rootState.sessionModel.playingTrackIndex;
    const playingTrackProgress = rootState.sessionModel.playingTrackProgress;
    if (playingTrackIndex || playingTrackIndex === 0) {
      dispatch.appModel.playerLoadIndex({ index: playingTrackIndex, play: false, progress: playingTrackProgress });
    }
  },

  playerLoadList(payload, rootState) {
    // console.log('%c--- playerLoadList ---', 'color:#079189');
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
    // console.log('%c--- playerLoadIndex ---', 'color:#079189');
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
    // console.log('%c--- playerPlay ---', 'color:#079189');
    const playerElement = rootState.appModel.playerElement;
    playerElement.play().catch((error) => null);
    dispatch.appModel.setAppState({
      playerPlaying: true,
    });
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#079189');
    const playerElement = rootState.appModel.playerElement;
    playerElement.pause();
    dispatch.appModel.setAppState({
      playerPlaying: false,
    });
  },

  playerRestart(payload, rootState) {
    // console.log('%c--- playerRestart ---', 'color:#079189');
    const playerElement = rootState.appModel.playerElement;
    playerElement.currentTime = 0;
    dispatch.appModel.setAppState({
      playerInteractionCount: rootState.appModel.playerInteractionCount + 1,
    });
  },

  playerPrev(payload, rootState) {
    // console.log('%c--- playerPrev ---', 'color:#079189');
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
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext ---', 'color:#079189');
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
  },

  playerVolumeSet(payload, rootState) {
    // console.log('%c--- playerVolumeSet ---', 'color:#079189');
    dispatch.appModel.setAppState({
      playerVolume: payload,
      playerMuted: false,
    });
    const playerElement = rootState.appModel.playerElement;
    playerElement.volume = payload / 100;
  },

  playerMuteToggle(payload, rootState) {
    // console.log('%c--- playerMuteToggle ---', 'color:#079189');
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
