// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const secretKey = 'your_secret_key_here';

const appName = 'Chromatix';
const clientIdentifier = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png'; // doesn't seem to work

const storagePinKey = 'chromatix-pin-id';
const storageTokenKey = 'chromatix-auth-token';

const currentProtocol = window.location.protocol + '//';
const currentHost = window.location.host;

const redirectUrlLocal = currentProtocol + currentHost + '?plex-login=true';
const redirectUrlProd = 'https://chromatix.app?plex-login=true';
const redirectUrl = isProduction ? redirectUrlProd : redirectUrlLocal;

const endpointConfig = {
  auth: {
    login: () => 'https://plex.tv/api/v2/pins',
    pinStatus: (pinId) => `https://plex.tv/api/v2/pins/${pinId}`,
  },
  user: {
    getUserInfo: () => 'https://plex.tv/users/account',
  },
  // server: {
  //   getAllServers: () => 'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&includeIPv6=1',
  // },
  // library: {
  //   getAllLibraries: (base) => `${base}/library/sections`,
  // },
};

// ======================================================================
// ENCRYPTED LOCAL STORAGE HELPER FUNCTIONS
// ======================================================================

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

// ======================================================================
// INITIALISE
// ======================================================================

// export const init = () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const isPlexLogin = urlParams.get('plex-login');

//   if (isPlexLogin) {
//     window.history.replaceState({}, document.title, window.location.pathname);
//     const pinId = window.localStorage.getItem(storagePinKey);
//     if (pinId) {
//       checkPlexPinStatus(pinId);
//     } else {
//       store.dispatch.appModel.setLoggedOut();
//     }
//   } else {
//     const authToken = getLocalStorage(storageTokenKey);
//     if (authToken) {
//       getUserInfo();
//     } else {
//       store.dispatch.appModel.setLoggedOut();
//     }
//   }
// };

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
              'X-Plex-Device-Icon': clientIcon,
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

// // ======================================================================
// // GET USER SERVERS
// // ======================================================================

// let getUserServersRunning;

// export const getAllServers = async () => {
//   if (!getUserServersRunning) {
//     const prevAllResources = store.getState().appModel.allServers;
//     if (!prevAllResources) {
//       console.log('%c--- plex - getAllServers ---', 'color:#f9743b;');
//       getUserServersRunning = true;

//       try {
//         const authToken = getLocalStorage(storageTokenKey);
//         const endpoint = endpointConfig.server.getAllServers();
//         const response = await fetch(endpoint, {
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             'X-Plex-Token': authToken,
//             'X-Plex-Client-Identifier': 'chromatix.app',
//           },
//         });

//         // error handling
//         if (!response.ok) {
//           console.error('Failed to get user servers:', response.statusText);
//           store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
//           return;
//         }

//         const data = await response.json();

//         // console.log(data);

//         const allServers = data
//           .filter((resource) => resource.provides === 'server')
//           .map((resource) => {
//             // resource.connections.push(resource.connections.shift());

//             const connectionLocal = resource.connections.filter((connection) => connection.local);
//             const connectionUrls = resource.connections.map((connection) => connection.uri);
//             delete resource.connections;
//             resource.serverId = resource.clientIdentifier;
//             resource.serverBaseUrls = connectionUrls;
//             resource.serverBaseUrlCurrent = connectionUrls[0];
//             resource.serverBaseUrlIndex = 0;
//             resource.serverBaseUrlTotal = connectionUrls.length;
//             resource.serverArtUrl = connectionLocal?.[0]
//               ? `${connectionLocal[0].protocol}://localhost:${connectionLocal[0].port}`
//               : null;
//             return resource;
//           });

//         // console.log('allServers', allServers);

//         store.dispatch.appModel.storeAllServers(allServers);
//       } catch (e) {
//         // error handling
//         console.error('Failed to get user servers:', e);
//         store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
//       }

//       getUserServersRunning = false;
//     }
//   }
// };

// // ======================================================================
// // GET USER LIBRARIES
// // ======================================================================

// let getUserLibrariesRunning;

// export const getAllLibraries = async () => {
//   if (!getUserLibrariesRunning) {
//     const prevAllLibraries = store.getState().appModel.allLibraries;
//     if (!prevAllLibraries) {
//       const currentServer = store.getState().sessionModel.currentServer;
//       if (currentServer) {
//         console.log('%c--- plex - getAllLibraries ---', 'color:#f9743b;');
//         getUserLibrariesRunning = true;

//         // we need to cycle through the serverBaseUrls to find the first one that works
//         const { serverBaseUrls, serverBaseUrlCurrent, serverBaseUrlIndex, serverBaseUrlTotal } = currentServer;

//         try {
//           const authToken = getLocalStorage(storageTokenKey);
//           const endpoint = endpointConfig.library.getAllLibraries(serverBaseUrlCurrent);
//           const response = await axios.get(endpoint, {
//             timeout: 5000, // 5 seconds
//             headers: {
//               Accept: 'application/json',
//               'Content-Type': 'application/json',
//               'X-Plex-Token': authToken,
//             },
//           });

//           const data = response.data;

//           // console.log(data.MediaContainer.Directory);

//           const allLibraries = data.MediaContainer.Directory.filter((library) => library.type === 'artist');

//           allLibraries.forEach((library) => {
//             library.libraryId = library.key;
//             // library.thumb = library.composite
//             //   ? `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
//             //       `${serverArtUrl}${library.composite}`
//             //     )}&X-Plex-Token=${authToken}`
//             //   : null;
//           });

//           // console.log('allLibraries', allLibraries);

//           store.dispatch.sessionModel.refreshCurrentLibrary(allLibraries);
//           store.dispatch.appModel.setAppState({ allLibraries });
//         } catch (e) {
//           // error handling
//           console.error('Failed to get user libraries:', e);
//           // let's make sure we've tried every connection url before giving up
//           if (serverBaseUrlIndex < serverBaseUrlTotal - 1) {
//             // retry the request with the next connection url
//             console.log('TRY NEXT BASE URL');
//             store.dispatch.sessionModel.setServerIndex({
//               serverBaseUrlCurrent: serverBaseUrls[serverBaseUrlIndex + 1],
//               serverBaseUrlIndex: serverBaseUrlIndex + 1,
//             });
//             getUserLibrariesRunning = false;
//             getAllLibraries();
//           } else {
//             // default error handling
//             if (e.code === 'ECONNABORTED') {
//               console.error('Request timed out');
//               store.dispatch.sessionModel.unsetCurrentServer();
//             } else {
//               store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
//             }
//           }
//         }

//         getUserLibrariesRunning = false;
//       }
//     }
//   }
// };
