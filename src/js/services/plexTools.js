// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';

import config from 'js/_config/config';

// ======================================================================
// OPTIONS
// ======================================================================

const secretKey = 'your_secret_key_here';

const appName = 'Chromatix';
const clientIdentifier = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const storagePinKey = config.storagePinKey;
const storageTokenKey = config.storageTokenKey;

const redirectPath = window.location.origin;
const redirectQuery = 'plex-login';
const redirectUrl = `${redirectPath}?${redirectQuery}=true`;

const endpointConfig = {
  auth: {
    login: () => 'https://plex.tv/api/v2/pins',
    pinStatus: (pinId) => `https://plex.tv/api/v2/pins/${pinId}`,
  },
  user: {
    getUserInfo: () => 'https://plex.tv/users/account',
  },
  server: {
    getAllServers: () => 'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&includeIPv6=1',
    // getAllServers: () => '/api/servers.json',
  },
  library: {
    getAllLibraries: (base) => `${base}/library/sections`,
  },
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

// SET AND GET ENCRYPTED LOCAL STORAGE

export const setLocalStorage = (key, value) => {
  const stringValue = String(value);
  const encryptedValue = CryptoJS.AES.encrypt(stringValue, secretKey).toString();
  window.localStorage.setItem(key, encryptedValue);
};

export const getLocalStorage = (key) => {
  const encryptedValue = window.localStorage.getItem(key);
  if (encryptedValue) {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, secretKey);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
  }
  return null;
};

// A CUSTOM PROMISE FUNCTION THAT WAITS FOR THE FIRST RESOLVED PROMISE
// (i.e. something in between Promise.race and Promise.allSettled)

const raceToSuccess = (promises, errorMessage) => {
  return new Promise((resolve, reject) => {
    let count = promises.length;
    promises.forEach((promise) => {
      (function () {
        promise
          .then(resolve) // if a promise resolves, resolve the main promise
          .catch((error) => {
            count--; // if a promise rejects, decrease the count
            if (count === 0) {
              // if all promises have rejected, reject the main promise
              reject(errorMessage || error);
            }
          });
      })();
    });
  });
};

// ======================================================================
// INITIALISE
// ======================================================================

export const init = () => {
  return new Promise((resolve, reject) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPlexLoginRedirect = urlParams.get(redirectQuery);
    // if the URL contains our redirect query param, we need to check the PIN status
    if (isPlexLoginRedirect) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const pinId = getLocalStorage(storagePinKey);
      if (pinId) {
        checkPlexPinStatus(pinId).then(resolve).catch(reject);
      } else {
        reject({
          code: 'init.1',
          message: 'No pin ID found',
          error: null,
        });
      }
    }
    // otherwise, check if the user is already logged in
    else {
      const authToken = getLocalStorage(storageTokenKey);
      if (authToken) {
        resolve();
      } else {
        reject({
          code: 'init.2',
          message: 'No auth token found',
          error: null,
        });
      }
    }
  });
};

// ======================================================================
// LOGIN
// ======================================================================

export const login = () => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.auth.login();
      axios
        .post(
          endpoint,
          { strong: true },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Plex-Product': appName,
              'X-Plex-Client-Identifier': clientIdentifier,
              'X-Plex-Device-Icon': clientIcon, // NOTE: this doesn't seem to work
            },
          }
        )
        .then((response) => {
          const pinData = response.data;
          const pinId = pinData.id;
          const pinCode = pinData.code;

          // store the pinId in the local storage
          setLocalStorage(storagePinKey, pinId);

          // redirect to the Plex login page
          const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientIdentifier}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
            appName
          )}&forwardUrl=${encodeURIComponent(redirectUrl)}`;
          window.location.href = authAppUrl;

          // this isn't really necessary, as the user will be redirected to the Plex login page
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'login.1',
            message: 'Failed to generate PIN',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'login.2',
        message: 'Failed to generate PIN',
        error: error,
      });
    }
  });
};

// ======================================================================
// CHECK PLEX PIN STATUS
// ======================================================================

const checkPlexPinStatus = (pinId, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.auth.pinStatus(pinId);
      const maxRetries = 5;
      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Client-Identifier': clientIdentifier,
          },
        })
        .then((response) => {
          const pinStatusData = response.data;

          // if valid, store the authToken in the local storage
          if (pinStatusData.authToken) {
            setLocalStorage(storageTokenKey, pinStatusData.authToken);
            window.localStorage.removeItem(storagePinKey);
            resolve();
          }
          // if the PIN is not yet authorized, check again in a second
          else {
            // limit number of retries
            if (retryCount < maxRetries) {
              setTimeout(() => checkPlexPinStatus(pinId, retryCount + 1), 1000);
            } else {
              reject({
                code: 'checkPlexPinStatus.1',
                message: 'Failed to authorize PIN after ' + maxRetries + ' attempts',
                error: null,
              });
            }
          }
        })
        .catch((error) => {
          reject({
            code: 'checkPlexPinStatus.2',
            message: 'Failed to check PIN status',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'checkPlexPinStatus.3',
        message: 'Failed to check PIN status',
        error: error,
      });
    }
  });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  window.localStorage.removeItem(storageTokenKey);
};

// ======================================================================
// GET USER INFO
// ======================================================================

export const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    try {
      const authToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.user.getUserInfo();
      axios
        .get(endpoint, {
          headers: {
            'X-Plex-Token': authToken,
          },
        })
        .then((response) => {
          const parser = new XMLParser({ ignoreAttributes: false });
          const jsonObj = parser.parse(response.data).user;
          resolve(jsonObj);
        })
        .catch((error) => {
          window.localStorage.removeItem(storageTokenKey);
          reject({
            code: 'getUserInfo.1',
            message: 'Failed to get user info: ' + error.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getUserInfo.2',
        message: 'Failed to get user info: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL SERVERS
// ======================================================================

export const getAllServers = () => {
  return new Promise((resolve, reject) => {
    try {
      const authToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.server.getAllServers();
      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
            'X-Plex-Client-Identifier': clientIdentifier,
          },
        })
        .then((response) => {
          const data = response?.data?.filter((resource) => resource.provides === 'server');
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getAllServers.1',
            message: 'Failed to get all servers: ' + error.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getAllServers.2',
        message: 'Failed to get all servers: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET FASTEST SERVER CONNECTION
// ======================================================================

export const getFastestServerConnection = (server) => {
  let { connections } = server;

  // sort connections based on preference
  connections.sort((a, b) => {
    if (a.local && !b.local) return -1;
    if (!a.local && b.local) return 1;
    if (a.relay && !b.relay) return 1;
    if (!a.relay && b.relay) return -1;
    return 0;
  });

  const requests = connections.map((connection, index) => {
    // incremental delay based on position in sorted array,
    // because we want the preferred connections to be tested first
    const delay = index * 300;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axios
          .head(connection.uri, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Plex-Token': getLocalStorage(storageTokenKey),
              'X-Plex-Client-Identifier': clientIdentifier,
            },
            timeout: 3000,
          })
          .then(() => resolve(connection))
          .catch((error) => {
            reject({
              code: 'getFastestServerConnection.1',
              message: `Failed to connect to ${connection.uri}: ${error.message}`,
              error,
            });
          });
      }, delay);
    });
  });

  // return the first connection that responds
  return raceToSuccess(requests, {
    code: 'getFastestServerConnection.2',
    message: 'No active connection found',
    error: null,
  }).then((activeConnection) => {
    return activeConnection;
  });
};

// ======================================================================
// GET ALL LIBRARIES
// ======================================================================

export const getAllLibraries = (baseUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const authToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.library.getAllLibraries(baseUrl);
      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
            'X-Plex-Client-Identifier': clientIdentifier,
          },
        })
        .then((response) => {
          resolve(response?.data?.MediaContainer.Directory);
        })
        .catch((error) => {
          reject({
            code: 'getAllLibraries.1',
            message: 'Failed to get all libraries: ' + error.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getAllLibraries.2',
        message: 'Failed to get all libraries: ' + error.message,
        error: error,
      });
    }
  });
};
