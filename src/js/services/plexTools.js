// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';

// ======================================================================
// OPTIONS
// ======================================================================

const secretKey = 'your_secret_key_here';

const appName = 'Chromatix';
const clientIdentifier = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const storagePinKey = 'chromatix-pin-id';
const storageTokenKey = 'chromatix-auth-token';

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

// A CUSTOM PROMISE FUNCTION THAT WAIST FOR THE FIRST RESOLVED PROMISE
// (i.e. something in between Promise.race and Promise.allSettled)

function raceToSuccess(promises) {
  return new Promise((resolve, reject) => {
    let count = promises.length;
    promises.forEach((promise) => {
      (function () {
        promise
          .then(resolve) // if a promise resolves, resolve the main promise
          .catch(() => {
            count--; // if a promise rejects, decrease the count
            if (count === 0) {
              // if all promises have rejected, reject the main promise
              reject(new Error('All promises were rejected'));
            }
          });
      })();
    });
  });
}

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
        console.error('No pin ID found');
        reject('No pin ID found');
      }
    }
    // otherwise, check if the user is already logged in
    else {
      const authToken = getLocalStorage(storageTokenKey);
      if (authToken) {
        resolve();
      } else {
        console.error('No auth token found');
        reject('No auth token found');
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
        .catch((e) => {
          console.error('Failed to generate PIN:', e);
          reject('Failed to generate PIN: ' + e);
        });
    } catch (e) {
      console.error('Failed to generate PIN:', e);
      reject('Failed to generate PIN: ' + e);
    }
  });
};

// ======================================================================
// CHECK PLEX PIN STATUS
// ======================================================================

export const checkPlexPinStatus = (pinId, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.auth.pinStatus(pinId);
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
            // limit to 5 retries
            if (retryCount < 5) {
              setTimeout(() => checkPlexPinStatus(pinId, retryCount + 1), 1000);
            } else {
              reject('Failed to authorize PIN after 5 attempts');
            }
          }
        })
        .catch((e) => {
          console.error('Failed to check PIN status:', e);
          reject('Failed to check PIN status: ' + e);
        });
    } catch (e) {
      console.error('Failed to check PIN status:', e);
      reject('Failed to check PIN status: ' + e);
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
        .catch((e) => {
          console.error('Failed to get user info:', e);
          window.localStorage.removeItem(storageTokenKey);
          reject('Failed to get user info: ' + e);
        });
    } catch (e) {
      console.error('Failed to get user info:', e);
      reject('Failed to get user info: ' + e);
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
            'X-Plex-Client-Identifier': 'chromatix.app',
          },
        })
        .then((response) => {
          const data = response?.data?.filter((resource) => resource.provides === 'server');
          resolve(data);
        })
        .catch((e) => {
          console.error('Failed to get user servers:', e);
          reject(e);
        });
    } catch (e) {
      console.error('Failed to get all servers:', e);
      reject('Failed to get all servers: ' + e);
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
            },
            timeout: 3000,
          })
          .then(() => resolve(connection))
          .catch((error) => {
            console.error(`Failed to connect to ${connection.uri}:`, error);
            reject(error);
          });
      }, delay);
    });
  });

  // return the first connection that responds
  return raceToSuccess(requests).then((activeConnection) => {
    return activeConnection;
  });
};

// ======================================================================
// GET USER LIBRARIES
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
          },
        })
        .then((response) => {
          resolve(response?.data?.MediaContainer.Directory);
        })
        .catch((error) => {
          console.error('Failed to get user libraries:', error);
          reject(error);
        });
    } catch (e) {
      console.error('Failed to get all libraries:', e);
      reject('Failed to get all libraries: ' + e);
    }
  });
};
