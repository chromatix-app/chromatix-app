// ======================================================================
// IMPORTS
// ======================================================================

import * as plex from 'js/services/plex';

// ======================================================================
// STATE
// ======================================================================

// APP STATE
// General state unrelated to any user or API data

const appState = {
  inited: false,
  standalone: false,
  history: null,

  loggedIn: false,
  currentUser: null,
};

const plexState = {
  allAlbums: null,
  allAlbumTracks: {},
  allArtists: null,
  allPlaylists: null,
  allPlaylistTracks: {},
};

// COMBINE ALL STATES

const state = Object.assign(appState, plexState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setState(rootState, payload) {
    // console.log('%c--- setState ---', 'color:#079189');
    return { ...rootState, ...payload };
  },

  // showLoader(rootState) {
  //   return { ...rootState, loaderVisible: true };
  // },

  // hideLoader(rootState) {
  //   return { ...rootState, loaderVisible: false };
  // },

  setLoggedIn(rootState, payload) {
    console.log('%c--- setLoggedIn ---', 'color:#079189');
    return {
      ...rootState,
      inited: true,
      loggedIn: true,
      currentUser: payload,
    };
  },

  setLoggedOut(rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#079189');
    return {
      inited: true,
      loggedIn: false,
    };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  init(payload, rootState) {
    console.log('%c--- init ---', 'color:#079189');
    // detect if browser is standalone (i.e. a web app)
    if ('standalone' in window.navigator && !!window.navigator.standalone) {
      dispatch.appModel.setState({
        standalone: true,
      });
    }
    // save history for reference within models
    dispatch.appModel.setState({
      history: payload.history,
    });
    // initialise plex
    plex.init();
  },

  login(payload, rootState) {
    console.log('%c--- login ---', 'color:#079189');
    plex.login();
  },

  storeAlbumTracks(payload, rootState) {
    console.log('%c--- storeAlbumTracks ---', 'color:#079189');
    const { albumId, albumTracks } = payload;

    const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
    allAlbumTracks[albumId] = albumTracks;

    console.log(allAlbumTracks);

    dispatch.appModel.setState({
      allAlbumTracks,
    });
  },

  storePlaylistTracks(payload, rootState) {
    console.log('%c--- storePlaylistTracks ---', 'color:#079189');
    const { playlistId, playlistTracks } = payload;

    const allPlaylistTracks = { ...rootState.appModel.allPlaylistTracks };
    allPlaylistTracks[playlistId] = playlistTracks;

    console.log(allPlaylistTracks);

    dispatch.appModel.setState({
      allPlaylistTracks,
    });
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
