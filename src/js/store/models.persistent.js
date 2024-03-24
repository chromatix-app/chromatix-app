// ======================================================================
// IMPORTS
// ======================================================================

import config from 'js/_config/config';
// import * as utils from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

// PERSISTENT STATE
// Anything to be saved in localstorage for use on reload

const persistentState = {
  debugConsole: false,
  invitation: null,
  persistentEmail: null,
};

// GET PERSISTENT STATE
// Using localstorage

let localStorageState = {};
try {
  localStorageState = localStorage.getItem(config.persistentStoreId)
    ? JSON.parse(localStorage.getItem(config.persistentStoreId))
    : {};
} catch (e) {
  // browser does not support local storage, or local storage item does not exist
}

// COMBINE ALL STATES

const state = Object.assign(persistentState, localStorageState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setPersistentState(rootState, payload) {
    console.log('%c--- setPersistentState ---', 'color:#91074A');
    return { ...rootState, ...payload };
  },

  // setInviteId(rootState, payload) {
  //   console.log('%c--- setInviteId - ' + payload + ' ---', 'color:#91074A');
  //   if (payload === null) {
  //     return {
  //       ...rootState,
  //       invitation: null,
  //     };
  //   } else {
  //     return {
  //       ...rootState,
  //       invitation: {
  //         id: payload,
  //         time: new Date().getTime(),
  //       },
  //     };
  //   }
  // },

  // setPersistentEmail(rootState, payload) {
  //   console.log('%c--- setPersistentEmail - ' + payload + ' ---', 'color:#91074A');
  //   if (payload === null) {
  //     return {
  //       ...rootState,
  //       persistentEmail: null,
  //     };
  //   } else {
  //     return {
  //       ...rootState,
  //       persistentEmail: {
  //         email: payload,
  //         time: new Date().getTime(),
  //       },
  //     };
  //   }
  // },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  // loginChecks(payload, rootState) {
  //   console.log('%c--- loginChecks ---', 'color:#91074A');
  //   // clear user email if it exists
  //   const persistentEmail = rootState.persistentModel.persistentEmail;
  //   if (persistentEmail) {
  //     dispatch.persistentModel.setPersistentEmail(null);
  //   }
  // },
  // getPersistentEmail(payload, rootState) {
  //   const emailIsExpired = (persistentEmail) => {
  //     const threeMinutes = 1000 * 60 * 3;
  //     const savedTime = persistentEmail.time;
  //     const nowTime = new Date().getTime();
  //     const difference = nowTime - savedTime;
  //     return difference > threeMinutes;
  //   };
  //   // get email
  //   const persistentEmail = rootState.persistentModel.persistentEmail;
  //   // check if email is expired
  //   if (persistentEmail) {
  //     if (emailIsExpired(persistentEmail)) {
  //       // clear email
  //       dispatch.persistentModel.setPersistentEmail(null);
  //       return null;
  //     } else {
  //       // refresh expiration and return email
  //       dispatch.persistentModel.setPersistentEmail(persistentEmail.email);
  //       return persistentEmail.email;
  //     }
  //   }
  //   return null;
  // },
});

// ======================================================================
// EXPORT
// ======================================================================

export const persistentModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
