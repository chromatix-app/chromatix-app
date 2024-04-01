// ======================================================================
// IMPORTS
// ======================================================================

import * as plex from 'js/services/plex';

// ======================================================================
// STATE
// ======================================================================

const appState = {
  inited: false,
  standalone: false,
  history: null,

  playerElement: null,
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

const playingState = {
  playingVariant: null,
  playingServerId: null,
  playingLibraryId: null,
  playingAlbumId: null,
  playingPlaylistId: null,
  playingTrackList: null,
  playingTrackCount: null,
  playingTrackIndex: null,
};

const state = Object.assign(appState, userState, plexServerState, plexLibraryState, playingState);

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
    // initialise plex
    plex.init();
    // initialise player
    dispatch.appModel.playerInit();
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
    dispatch.sessionModel.refresh();
    plex.getAllServers();
    plex.getAllLibraries();
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#079189');
    dispatch.appModel.setAppState({
      inited: true,
      ...userState,
      ...plexServerState,
      ...plexLibraryState,
      ...playingState,
    });
    dispatch.sessionModel.refresh();
  },

  //
  // PLEX
  //

  clearPlexLibraryState(payload, rootState) {
    console.log('%c--- clearPlexLibraryState ---', 'color:#079189');
    dispatch.appModel.setAppState({
      ...plexLibraryState,
    });
    rootState.appModel.history.push('/');
    plex.getAllPlaylists();
  },

  storeArtistDetails(payload, rootState) {
    console.log('%c--- storeArtistDetails ---', 'color:#079189');
    const allArtists = [...rootState.appModel.allArtists];
    const artistIndex = allArtists.findIndex((artist) => artist.artistId === payload.artistId);
    if (artistIndex === -1) {
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
    allArtistAlbums[libraryId + '-' + artistId] = artistAlbums;
    dispatch.appModel.setAppState({
      allArtistAlbums,
    });
  },

  storeArtistRelated(payload, rootState) {
    console.log('%c--- storeArtistRelated ---', 'color:#079189');
    const { libraryId, artistId, artistRelated } = payload;
    const allArtistRelated = { ...rootState.appModel.allArtistRelated };
    allArtistRelated[libraryId + '-' + artistId] = artistRelated;
    dispatch.appModel.setAppState({
      allArtistRelated,
    });
  },

  storeAlbumTracks(payload, rootState) {
    console.log('%c--- storeAlbumTracks ---', 'color:#079189');
    const { libraryId, albumId, albumTracks } = payload;
    const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
    allAlbumTracks[libraryId + '-' + albumId] = albumTracks;
    dispatch.appModel.setAppState({
      allAlbumTracks,
    });
  },

  storePlaylistTracks(payload, rootState) {
    console.log('%c--- storePlaylistTracks ---', 'color:#079189');
    const { libraryId, playlistId, playlistTracks } = payload;
    const allPlaylistTracks = { ...rootState.appModel.allPlaylistTracks };
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
    playerElement.volume = playerMuted ? 0 : playerVolume;
    dispatch.appModel.setAppState({
      playerElement,
    });
    // play next track when current track ends
    playerElement.addEventListener('ended', () => {
      dispatch.appModel.playerNext();
    });
  },

  playerLoadList(payload, rootState) {
    // console.log('%c--- playerLoadList ---', 'color:#079189');
    dispatch.appModel.setAppState({
      playerPlaying: true,
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
    const playingTrackList = rootState.appModel.playingTrackList;
    if (payload || payload === 0) {
      playerElement.src = playingTrackList[payload].src;
      playerElement.load();
      playerElement.play().catch((error) => null);
    }
    // handle null payload - load first track and stop playing
    else if (payload === null) {
      playerElement.src = playingTrackList[0].src;
      playerElement.load();
    }
  },

  playerPlay(payload, rootState) {
    // console.log('%c--- playerPlay ---', 'color:#079189');
    dispatch.appModel.setAppState({
      playerPlaying: true,
    });
    const playerElement = rootState.appModel.playerElement;
    playerElement.play().catch((error) => null);
  },

  playerPause(payload, rootState) {
    // console.log('%c--- playerPause ---', 'color:#079189');
    dispatch.appModel.setAppState({
      playerPlaying: false,
    });
    const playerElement = rootState.appModel.playerElement;
    playerElement.pause();
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
    const playingTrackIndex = rootState.appModel.playingTrackIndex;
    // go to previous track, if available
    if (playingTrackIndex > 0 && playerElement.currentTime <= 5) {
      dispatch.appModel.setAppState({
        playingTrackIndex: playingTrackIndex - 1,
      });
      dispatch.appModel.playerLoadIndex(playingTrackIndex - 1);
    }
    // restart the current track
    else {
      dispatch.appModel.playerRestart();
    }
  },

  playerNext(payload, rootState) {
    // console.log('%c--- playerNext ---', 'color:#079189');
    const playingTrackIndex = rootState.appModel.playingTrackIndex;
    const playingTrackCount = rootState.appModel.playingTrackCount;
    if (playingTrackIndex < playingTrackCount - 1) {
      dispatch.appModel.setAppState({
        playerPlaying: true,
        playingTrackIndex: playingTrackIndex + 1,
      });
      dispatch.appModel.playerLoadIndex(playingTrackIndex + 1);
    }
    // handle last track - loop back to first track and stop playing
    else {
      dispatch.appModel.setAppState({
        playerPlaying: false,
        playingTrackIndex: 0,
      });
      dispatch.appModel.playerLoadIndex(null);
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
