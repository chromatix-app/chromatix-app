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

  backgroundColor: '#111',
};

const state = Object.assign(sessionState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setSessionState(rootState, payload) {
    console.log('%c--- setSessionState ---', 'color:#91074A');
    return { ...rootState, ...payload };
  },

  setCurrentServer(rootState, payload) {
    console.log('%c--- setCurrentServer ---', 'color:#91074A');
    return {
      ...rootState,
      currentServer: payload,
    };
  },

  setCurrentLibrary(rootState, payload) {
    console.log('%c--- setCurrentLibrary ---', 'color:#91074A');
    return {
      ...rootState,
      currentLibrary: payload,
    };
  },

  refreshCurrentServer(rootState, payload) {
    console.log('%c--- refreshCurrentServer ---', 'color:#91074A');
    const currentServerToken = rootState.currentServer ? rootState.currentServer.serverId : null;
    const refreshedServer = payload.find((server) => server.serverId === currentServerToken);
    // TODO: what if refreshedServer is null?
    return {
      ...rootState,
      currentServer: refreshedServer ? refreshedServer : null,
    };
  },

  refreshCurrentLibrary(rootState, payload) {
    console.log('%c--- refreshCurrentLibrary ---', 'color:#91074A');
    const currentLibraryToken = rootState.currentLibrary ? rootState.currentLibrary.libraryId : null;
    const refreshedLibrary = payload.find((library) => library.libraryId === currentLibraryToken);
    // TODO: what if refreshedLibrary is null?
    return {
      ...rootState,
      currentLibrary: refreshedLibrary ? refreshedLibrary : null,
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
  refresh(payload, rootState) {
    console.log('%c--- refresh ---', 'color:#91074A');
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

  switchCurrentServer(payload, rootState) {
    console.log('%c--- switchCurrentServer ---', 'color:#91074A');
    const currentServer = rootState.sessionModel.currentServer;
    const currentServerId = currentServer ? currentServer.serverId : null;
    if (currentServerId !== payload) {
      // TODO
      // const newServer = rootState.appModel.allServers.find((server) => server.serverId === payload);
      // // TODO: what if currentServer is null?
      // dispatch.sessionModel.setSessionState({
      //   currentServer: newServer,
      // });
      // dispatch.appModel.clearPlexLibraryState();
    }
  },

  switchCurrentLibrary(payload, rootState) {
    console.log('%c--- switchCurrentLibrary ---', 'color:#91074A');
    const currentLibrary = rootState.sessionModel.currentLibrary;
    const currentLibraryId = currentLibrary ? currentLibrary.libraryId : null;
    if (currentLibraryId !== payload) {
      const newLibrary = rootState.appModel.allLibraries.find((library) => library.libraryId === payload);
      // TODO: what if currentLibrary is null?
      dispatch.sessionModel.setSessionState({
        currentLibrary: newLibrary,
      });
      dispatch.appModel.clearPlexLibraryState();
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
