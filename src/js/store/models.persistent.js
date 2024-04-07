// ======================================================================
// IMPORTS
// ======================================================================

import config from 'js/_config/config';
import { pageWasReloaded } from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

// PERSISTENT STATE
// Anything to be saved in localstorage for use on reload

const historyState = {
  historyLength: 0,
  historyStack: [],
  futureStack: [],
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

console.log(historyState);

const state = Object.assign({}, historyState, localStorageState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setPersistentState(rootState, payload) {
    console.log('%c--- setPersistentState ---', 'color:#91074A');
    return { ...rootState, ...payload };
  },

  setHistoryLength(rootState, payload) {
    return {
      ...rootState,
      historyLength: payload,
    };
  },

  setHistoryStack(rootState, payload) {
    return {
      ...rootState,
      historyStack: payload,
    };
  },

  setFutureStack(rootState, payload) {
    return {
      ...rootState,
      futureStack: payload,
    };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  init(payload, rootState) {
    console.log('%c--- init ---', 'color:#057811');

    if (!pageWasReloaded()) {
      console.log('CLEARING LOCAL STORAGE');
      dispatch.persistentModel.setPersistentState({
        ...historyState,
      });
    }
  },
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
