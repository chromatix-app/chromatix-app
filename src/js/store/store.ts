// ======================================================================
// IMPORTS
// ======================================================================

import { init } from '@rematch/core';
import sha3 from 'crypto-js/sha3';

import { appModel } from 'js/store/models.app';
import { persistentModel } from 'js/store/models.persistent';
import { playerModel } from 'js/store/models.player';
import { popupsModel } from 'js/store/models.popups';
import { sessionModel } from 'js/store/models.session';
import config from 'js/_config/config';

// ======================================================================
// TYPES
// ======================================================================

// For now, we'll use a simpler typing approach
// TODO: Improve typing when models are converted to TypeScript
type Store = any;

// ======================================================================
// STORE
// ======================================================================

const store: Store = init({
  models: {
    appModel,
    persistentModel,
    playerModel,
    popupsModel,
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

let saveDataTimeout: ReturnType<typeof setTimeout> | undefined;
const saveDataDebounce: number = 100;

const saveData = (): void => {
  clearTimeout(saveDataTimeout);
  saveDataTimeout = setTimeout(function () {
    savePersistentData();
    saveSessionData();
  }, saveDataDebounce);
};

// actually save the data

let persistentString: string | null = null;
let sessionString: string | null = null;

const savePersistentData = (): void => {
  const newPersistentString = JSON.stringify(store.getState().persistentModel);
  if (newPersistentString !== persistentString) {
    // console.log('%cSAVE PERSISTENT DATA', 'color:#1fb800');
    persistentString = newPersistentString;
    localStorage.setItem(config.storagePersistentKey, persistentString);
  }
};

const saveSessionData = (): void => {
  const loggedIn = store.getState().appModel.loggedIn;
  if (loggedIn) {
    const userName = store.getState().appModel.currentUser?.userId;
    if (userName) {
      const newSessionString = JSON.stringify(store.getState().sessionModel);
      if (newSessionString !== sessionString) {
        // console.log('%cSAVE SESSION DATA', 'color:#1fb800');
        sessionString = newSessionString;
        const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
        const sessionKey = config.storageSessionKey + '-' + userHash;
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
  (window as any).store = store;

  // store.getState().appModel.xxxxxx
  // store.dispatch.appModel.xxxxxx
}

// ======================================================================
// EXPORT
// ======================================================================

export default store;
export type { Store };
