// ======================================================================
// IMPORTS
// ======================================================================

import sha3 from 'crypto-js/sha3';

import config from 'js/_config/config';
// import * as utils from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

const sessionState = {
  currentServer: null,
  currentLibrary: null,

  currentTheme: 'black-pink',
  currentColorBackground: '#111',
  currentColorText: '#fff',
  currentColorPrimary: '#f7277a',
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
  playingTrackProgress: 0,
};

const state = Object.assign({}, sessionState, playingState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setSessionState(rootState, payload) {
    console.log('%c--- setSessionState ---', 'color:#0f60b7');
    return { ...rootState, ...payload };
  },

  //
  // THEME
  //

  setTheme(rootState, payload) {
    return {
      ...rootState,
      currentTheme: payload,
    };
  },

  setColorBackground(rootState, payload) {
    return {
      ...rootState,
      currentColorBackground: payload,
    };
  },

  setColorText(rootState, payload) {
    return {
      ...rootState,
      currentColorText: payload,
    };
  },

  setColorPrimary(rootState, payload) {
    return {
      ...rootState,
      currentColorPrimary: payload,
    };
  },

  //
  // SERVER & LIBRARY
  //

  setCurrentServer(rootState, payload) {
    console.log('%c--- setCurrentServer ---', 'color:#0f60b7');
    return {
      ...rootState,
      currentServer: payload,
      currentLibrary: null,
      ...playingState,
    };
  },

  setCurrentLibrary(rootState, payload) {
    console.log('%c--- setCurrentLibrary ---', 'color:#0f60b7');
    return {
      ...rootState,
      currentLibrary: payload,
    };
  },

  refreshCurrentServer(rootState, payload) {
    console.log('%c--- refreshCurrentServer ---', 'color:#0f60b7');
    const currentServerToken = rootState.currentServer ? rootState.currentServer.serverId : null;
    const refreshedServer = payload?.find((server) => server.serverId === currentServerToken);
    if (refreshedServer) {
      return {
        ...rootState,
        currentServer: refreshedServer,
      };
    } else {
      return {
        ...rootState,
        currentServer: null,
        currentLibrary: null,
        ...playingState,
      };
    }
  },

  refreshCurrentLibrary(rootState, payload) {
    console.log('%c--- refreshCurrentLibrary ---', 'color:#0f60b7');
    const currentLibraryToken = rootState.currentLibrary ? rootState.currentLibrary.libraryId : null;
    const refreshedLibrary = payload?.find((library) => library.libraryId === currentLibraryToken);
    return {
      ...rootState,
      currentLibrary: refreshedLibrary ? refreshedLibrary : null,
    };
  },

  setPlayingTrackProgress(rootState, payload) {
    // console.log('%c--- setPlayingTrackProgress ---', 'color:#0f60b7');
    return {
      ...rootState,
      playingTrackProgress: payload,
    };
  },

  // setSortTasks(rootState, payload) {
  //   let sortTasksKey = payload;
  //   let sortTasksOrder = 'ASC';
  //   if (sortTasksKey === rootState.sortTasksKey) {
  //     if (rootState.sortTasksOrder === 'ASC') {
  //       sortTasksOrder = 'DESC';
  //     } else {
  //       sortTasksKey = 'created';
  //     }
  //   }
  //   return {
  //     ...rootState,
  //     sortTasksKey,
  //     sortTasksOrder,
  //   };
  // },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  loadLocalStorage(payload, rootState) {
    console.log('%c--- loadLocalStorage ---', 'color:#0f60b7');
    let localStorageState = { ...sessionState };
    // attempt to retrieve the current user's session state from local storage
    const loggedIn = rootState.appModel.loggedIn;
    if (loggedIn) {
      const userName = rootState.appModel.currentUser.userId;
      const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
      const sessionKey = config.sessionStoreId + '-' + userHash;
      try {
        localStorageState = localStorage.getItem(sessionKey) ? JSON.parse(localStorage.getItem(sessionKey)) : {};
      } catch (e) {
        // browser does not support local storage, or local storage item does not exist
      }
    }
    dispatch.sessionModel.setSessionState({
      ...localStorageState,
    });
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#0f60b7');
    dispatch.sessionModel.setSessionState({
      ...sessionState,
      ...playingState,
    });
  },

  unsetCurrentServer(rootState, payload) {
    console.log('%c--- unsetCurrentServer ---', 'color:#0f60b7');
    dispatch.sessionModel.setSessionState({
      currentServer: null,
      currentLibrary: null,
      ...playingState,
    });
    dispatch.appModel.clearPlexServerState();
  },

  switchCurrentServer(payload, rootState) {
    console.log('%c--- switchCurrentServer ---', 'color:#0f60b7');
    const currentServer = rootState.sessionModel.currentServer;
    const currentServerId = currentServer ? currentServer.serverId : null;
    if (currentServerId !== payload) {
      // TODO
      const newServer = rootState.appModel.allServers.find((server) => server.serverId === payload);
      // TODO: what if currentServer is null?
      dispatch.sessionModel.setSessionState({
        ...rootState,
        currentServer: newServer,
        currentLibrary: null,
        ...playingState,
      });
      dispatch.appModel.clearPlexServerState();
      dispatch.persistentModel.clearHistoryState();
    }
  },

  switchCurrentLibrary(payload, rootState) {
    console.log('%c--- switchCurrentLibrary ---', 'color:#0f60b7');
    const currentLibrary = rootState.sessionModel.currentLibrary;
    const currentLibraryId = currentLibrary ? currentLibrary.libraryId : null;
    if (currentLibraryId !== payload) {
      const newLibrary = rootState.appModel.allLibraries.find((library) => library.libraryId === payload);
      // TODO: what if currentLibrary is null?
      dispatch.sessionModel.setSessionState({
        currentLibrary: newLibrary,
      });
      dispatch.appModel.clearPlexLibraryState();
      dispatch.persistentModel.clearHistoryState();
    }
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const sessionModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
