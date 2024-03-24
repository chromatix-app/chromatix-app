// ======================================================================
// IMPORTS
// ======================================================================

// import sha3 from 'crypto-js/sha3';

// import config from 'js/_config/config';
// import * as utils from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

// SESSION STATE
// Anything related to the session to be saved in localstorage for use on reload

const sessionState = {
  backgroundColor: '#111',
};

// GET PERSISTENT STATE
// Using localstorage

// let localStorageState = {};
// try {
//   localStorageState = localStorage.getItem(config.sessionStoreId)
//     ? JSON.parse(localStorage.getItem(config.sessionStoreId))
//     : {};
// } catch (e) {
//   // browser does not support local storage, or local storage item does not exist
// }

// COMBINE ALL STATES

const state = Object.assign(sessionState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setSessionState(rootState, payload) {
    console.log('%c--- setSessionState ---', 'color:#91074A');
    return { ...rootState, ...payload };
  },

  // setProject(rootState, payload) {
  //   console.log('%c--- setProject - ' + payload + ' ---', 'color:#91074A');
  //   return {
  //     ...rootState,
  //     currentProjectId: payload,
  //   };
  // },

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
  // refresh(payload, rootState) {
  //   console.log('%c--- refresh ---', 'color:#91074A');
  //   let localStorageState = { ...sessionState };
  //   // attempt to retrieve the current user's session state from local storage
  //   const loggedIn = rootState.appModel.loggedIn;
  //   if (loggedIn) {
  //     const userName = rootState.appModel.currentUserInfo.username;
  //     const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
  //     const sessionKey = config.sessionStoreId + '-' + userHash;
  //     try {
  //       localStorageState = localStorage.getItem(sessionKey) ? JSON.parse(localStorage.getItem(sessionKey)) : {};
  //     } catch (e) {
  //       // browser does not support local storage, or local storage item does not exist
  //     }
  //   }
  //   dispatch.sessionModel.setSessionState({
  //     ...localStorageState,
  //   });
  // },
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
