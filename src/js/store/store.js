// ======================================================================
// IMPORTS
// ======================================================================

import { init } from '@rematch/core';
// import sha3 from 'crypto-js/sha3';

import { appModel } from 'js/store/models.app';
import { persistentModel } from 'js/store/models.persistent';
import { sessionModel } from 'js/store/models.session';
import config from 'js/_config/config';

// ======================================================================
// STORE
// ======================================================================

const store = init({
  models: {
    appModel,
    persistentModel,
    sessionModel,
  },
});

// ======================================================================
// LOCALSTORAGE - cache state of store for subsequent visits
// ======================================================================

store.subscribe(() => {
  try {
    saveData();
  } catch (e) {
    // browser does not support local storage
  }
});

// debounce - use timeout to prevent writing data too many times in quick succession

let saveDataTimeout;
const saveDataInterval = 100;

const saveData = () => {
  clearTimeout(saveDataTimeout);
  saveDataTimeout = setTimeout(function () {
    doSaveData();
  }, saveDataInterval);
};

// save relevant store data to localstorage

const doSaveData = () => {
  // const loggedIn = store.getState().appModel.loggedIn;
  // localStorage.setItem(config.persistentStoreId, JSON.stringify(store.getState().persistentModel));
  // if (loggedIn) {
  //   const userName = store.getState().appModel.currentUserInfo.username;
  //   if (userName) {
  //     const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
  //     const sessionKey = config.sessionStoreId + '-' + userHash;
  //     localStorage.setItem(sessionKey, JSON.stringify(store.getState().sessionModel));
  //   }
  // }
};

// ======================================================================
// GLOBAL ACCESS
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

if (isLocal && config.globalStore) {
  window.store = store;

  // store.getState().appModel.xxxxxx
  // store.dispatch.appModel.xxxxxx
}

// ======================================================================
// EXPORT
// ======================================================================

export default store;
