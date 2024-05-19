// ======================================================================
// IMPORTS
// ======================================================================

import { init } from '@rematch/core';
import sha3 from 'crypto-js/sha3';

import { appModel } from 'js/store/models.app';
import { persistentModel } from 'js/store/models.persistent';
import { playerModel } from 'js/store/models.player';
import { sessionModel } from 'js/store/models.session';
import config from 'js/_config/config';

// ======================================================================
// STORE
// ======================================================================

const store = init({
  models: {
    appModel,
    persistentModel,
    playerModel,
    sessionModel,
  },
});

// ======================================================================
// LOCALSTORAGE - cache state of store for subsequent visits
// ======================================================================

store.subscribe(() => {
  try {
    saveData();
  } catch (error) {
    // browser does not support local storage
  }
});

// debounce - use timeout to prevent writing data too many times in quick succession

let saveDataTimeout;
const saveDataInterval = 100;

const saveData = () => {
  clearTimeout(saveDataTimeout);
  saveDataTimeout = setTimeout(function () {
    savePersistentData();
    saveSessionData();
  }, saveDataInterval);
};

// actually save the data

let persistentString = null;
let sessionString = null;

const savePersistentData = () => {
  const newPersistentString = JSON.stringify(store.getState().persistentModel);
  if (newPersistentString !== persistentString) {
    // console.log('%cSAVE PERSISTENT DATA', 'color:#1fb800');
    persistentString = newPersistentString;
    localStorage.setItem(config.persistentStoreKey, persistentString);
  }
};

const saveSessionData = () => {
  const loggedIn = store.getState().appModel.loggedIn;
  if (loggedIn) {
    const userName = store.getState().appModel.currentUser.userId;
    if (userName) {
      const newSessionString = JSON.stringify(store.getState().sessionModel);
      if (newSessionString !== sessionString) {
        // console.log('%cSAVE SESSION DATA', 'color:#1fb800');
        sessionString = newSessionString;
        const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
        const sessionKey = config.sessionStoreKey + '-' + userHash;
        localStorage.setItem(sessionKey, sessionString);
      }
    }
  }
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
