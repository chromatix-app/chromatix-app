// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { XMLParser } from 'fast-xml-parser';

import config from 'js/_config/config';
import * as plexTranspose from 'js/services/plexTranspose';

// ======================================================================
// OPTIONS
// ======================================================================

const secretKey = 'your_secret_key_here';

const appName = 'Chromatix';
const clientId = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const storagePinKey = config.storagePinKey;
const storageAuthKey = config.storageAuthKey;

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
    getAllServers: () => 'https://plex.tv/api/v2/resources',
  },
  library: {
    getAllLibraries: (baseUrl) => `${baseUrl}/library/sections`,
  },
  album: {
    getAllAlbums: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getDetails: (baseUrl, albumId) => `${baseUrl}/library/metadata/${albumId}`,
    getTracks: (baseUrl, albumId) => `${baseUrl}/library/metadata/${albumId}/children`,
  },
  search: {
    searchLibrary: (baseUrl) => `${baseUrl}/library/search`,
    searchHub: (baseUrl) => `${baseUrl}/hubs/search`,
  },
  rating: {
    setStarRating: (baseUrl) => `${baseUrl}/:/rate`,
  },
  status: {
    postPlaybackStatus: (baseUrl) => `${baseUrl}/:/timeline`,
  },
};

// const artistExcludes = 'summary,guid,key,parentRatingKey,parentTitle,skipCount';
const albumExcludes =
  'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,parentThumb,studio';
// const artistAndAlbumExcludes =
//   'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,skipCount,studio';

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

// A SIMPLE FUNCTION TO GET THE BROWSER NAME

const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  const browsers = [
    { name: 'Microsoft Edge', identifier: 'Edg' },
    { name: 'Brave', identifier: 'Brave' },
    { name: 'Opera', identifier: ['Opera', 'OPR'] },
    { name: 'Chrome', identifier: 'Chrome' },
    { name: 'Chromium', identifier: 'Chromium' },
    { name: 'Firefox', identifier: 'Firefox' },
    { name: 'Safari', identifier: 'Safari' },
    { name: 'Samsung Internet', identifier: 'SamsungBrowser' },
    { name: 'Microsoft Internet Explorer', identifier: 'Trident' },
  ];
  const browser = browsers.find((b) =>
    Array.isArray(b.identifier) ? b.identifier.some((id) => userAgent.includes(id)) : userAgent.includes(b.identifier)
  );
  return browser ? browser.name : 'Unknown';
};

// ======================================================================
// ABORT HANDLING
// ======================================================================

let abortControllers = [];

export const abortAllRequests = () => {
  if (abortControllers.length > 0) {
    console.log('%c### plexTools - abortAllRequests ###', 'color:#f00;');
    abortControllers.forEach((controller) => {
      controller.abort();
    });
    abortControllers = [];
  }
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
      const authToken = getLocalStorage(storageAuthKey);
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
              'X-Plex-Client-Identifier': clientId,
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
          const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientId}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
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
            'X-Plex-Client-Identifier': clientId,
          },
        })
        .then((response) => {
          const pinStatusData = response.data;

          // if valid, store the authToken in the local storage
          if (pinStatusData.authToken) {
            setLocalStorage(storageAuthKey, pinStatusData.authToken);
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
  window.localStorage.removeItem(storageAuthKey);
};

// ======================================================================
// GET USER INFO
// ======================================================================

export const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    try {
      const authToken = getLocalStorage(storageAuthKey);
      const endpoint = endpointConfig.user.getUserInfo();
      axios
        .get(endpoint, {
          headers: {
            'X-Plex-Token': authToken,
          },
        })
        .then((response) => {
          const parser = new XMLParser({ ignoreAttributes: false });
          const data = plexTranspose.transposeUserData(parser.parse(response.data).user);
          resolve(data);
        })
        .catch((error) => {
          if (error?.code !== 'ERR_NETWORK') {
            logout();
          }
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
      const authToken = getLocalStorage(storageAuthKey);
      const endpoint = endpointConfig.server.getAllServers();
      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
            'X-Plex-Client-Identifier': clientId,
          },
          params: {
            includeHttps: 1,
            includeRelay: 1,
            includeIPv6: 1,
          },
        })
        .then((response) => {
          const data =
            response?.data
              ?.filter((resource) => resource.provides === 'server')
              ?.map((server) => plexTranspose.transposeServerData(server)) || [];
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

export const getFastestConnection = (server) => {
  let { accessToken, connections } = server;

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
              'X-Plex-Token': accessToken,
              'X-Plex-Client-Identifier': clientId,
            },
            timeout: 3000,
          })
          .then(() => resolve(connection.uri))
          .catch((error) => {
            reject({
              code: 'getFastestConnection.1',
              message: `Failed to connect to ${connection.uri}: ${error.message}`,
              error,
            });
          });
      }, delay);
    });
  });

  // return the first connection that responds
  return raceToSuccess(requests, {
    code: 'getFastestConnection.2',
    message: 'No active connection found',
    error: null,
  }).then((activeConnection) => {
    return activeConnection;
  });
};

// ======================================================================
// GET ALL LIBRARIES
// ======================================================================

export const getAllLibraries = (baseUrl, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.library.getAllLibraries(baseUrl);
      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
        })
        .then((response) => {
          const data = response?.data?.MediaContainer?.Directory?.filter((library) => library.type === 'artist').map(
            (library) => plexTranspose.transposeLibraryData(library)
          );
          resolve(data);
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

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

export const getAllAlbums = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAllAlbums(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
          params: {
            type: 9,
            excludeFields: albumExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(
            response?.data?.MediaContainer?.Metadata?.map((album) =>
              plexTranspose.transposeAlbumData(album, libraryId, baseUrl, accessToken)
            )
          );
        })
        .catch((error) => {
          reject({
            code: 'getAllAlbums.1',
            message: 'Failed to get all albums: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllAlbums.2',
        message: 'Failed to get all albums: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALBUM DETAILS
// ======================================================================

export const getAlbumDetails = (baseUrl, libraryId, albumId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getDetails(baseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const album = response?.data?.MediaContainer?.Metadata[0];
          const albumDetails = plexTranspose.transposeAlbumData(album, libraryId, baseUrl, accessToken);
          resolve(albumDetails);
        })
        .catch((error) => {
          reject({
            code: 'getAlbumDetails.1',
            message: 'Failed to get album details: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAlbumDetails.2',
        message: 'Failed to get album details: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALBUM TRACKS
// ======================================================================

export const getAlbumTracks = (baseUrl, libraryId, albumId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getTracks(baseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((track) =>
              plexTranspose.transposeTrackData(track, libraryId, baseUrl, accessToken)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getAlbumTracks.1',
            message: 'Failed to get album tracks: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAlbumTracks.2',
        message: 'Failed to get album tracks: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SEARCH
// ======================================================================

// /hubs/search?query=Epica&excludeFields=summary&limit=4&includeCollections=1&contentDirectoryID=23&includeFields=thumbBlurHash

export const searchHub = (baseUrl, libraryId, accessToken, query, limit = 25, includeCollections = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.search.searchHub(baseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
          params: {
            query,
            limit,
            includeCollections,
            contentDirectoryID: libraryId,
            excludeFields: 'summary',
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(response?.data?.MediaContainer?.Hub);
        })
        .catch((error) => {
          reject({
            code: 'searchHub.1',
            message: 'Failed to search library: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'searchHub.2',
        message: 'Failed to search library: ' + error.message,
        error: error,
      });
    }
  });
};

export const searchLibrary = (
  baseUrl,
  accessToken,
  query,
  limit = 100,
  searchTypes = 'music',
  includeCollections = 1
) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.search.searchLibrary(baseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
          },
          params: {
            query,
            limit,
            searchTypes,
            includeCollections,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(response?.data?.MediaContainer?.SearchResult);
        })
        .catch((error) => {
          reject({
            code: 'searchLibrary.1',
            message: 'Failed to search library: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'searchLibrary.2',
        message: 'Failed to search library: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SET STAR RATING
// ======================================================================

export const setStarRating = (baseUrl, accessToken, sessionId, ratingKey, rating) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.rating.setStarRating(baseUrl, ratingKey, rating);
      const browserName = getBrowserName();
      const params = {
        identifier: 'com.plexapp.plugins.library',
        key: ratingKey,
        rating: rating,
      };

      axios
        .get(endpoint, {
          params: params,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
            'X-Plex-Session-Identifier': sessionId,
            'X-Plex-Product': appName,
            'X-Plex-Device-Name': browserName,
            'X-Plex-Platform': browserName,
            'X-Plex-Device-Icon': clientIcon,
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject({
            code: 'setStarRating.1',
            message: `Failed to set star rating for ${ratingKey}: ${error.message}`,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'setStarRating.2',
        message: `Failed to set star rating for ${ratingKey}: ${error.message}`,
        error: error,
      });
    }
  });
};

// ======================================================================
// LOG PLAYBACK STATUS
// ======================================================================

export const logPlaybackStatus = (
  baseUrl,
  accessToken,
  sessionId,
  type,
  ratingKey,
  trackId,
  state,
  currentTime,
  duration
) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.status.postPlaybackStatus(baseUrl);
      const browserName = getBrowserName();
      const params = {
        type: type,
        key: trackId,
        ratingKey: ratingKey,
        state: state, // playing, paused, stopped
        time: currentTime, // time in milliseconds
        playbackTime: currentTime, // time in milliseconds
        duration: duration, // duration of the media in milliseconds
        // Add any other necessary data here
      };
      axios
        .get(endpoint, {
          params: params,
          headers: {
            'Content-Type': 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
            'X-Plex-Session-Identifier': sessionId,
            'X-Plex-Product': appName,
            'X-Plex-Device-Name': browserName,
            'X-Plex-Platform': browserName,
            'X-Plex-Device-Icon': clientIcon,
          },
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject({
            code: 'logPlaybackStatus.1',
            message: 'Failed to update playback status',
            error,
          });
        });
    } catch (error) {
      reject({
        code: 'logPlaybackStatus.2',
        message: 'Failed to update playback status',
        error,
      });
    }
  });
};

// The below variation is used on window unload in order to log playback as stopped.
// The fetch method is used instead of axios, with keepalive set to true.
// This is because axios does not support keepalive, and fetch with keepalive
// will allow the request to complete even if the page is closed.

export const logPlaybackQuit = (
  baseUrl,
  accessToken,
  sessionId,
  type,
  ratingKey,
  trackId,
  state,
  currentTime,
  duration
) => {
  try {
    const endpoint = endpointConfig.status.postPlaybackStatus(baseUrl);
    const params = new URLSearchParams({
      type: type,
      key: trackId,
      ratingKey: ratingKey,
      state: state, // playing, paused, stopped
      time: currentTime, // time in milliseconds
      playbackTime: currentTime, // time in milliseconds
      duration: duration, // duration of the media in milliseconds
      // Add any other necessary data here
    }).toString();
    const fetchUrl = `${endpoint}?${params}`;
    fetch(fetchUrl, {
      method: 'GET',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Plex-Token': accessToken,
        'X-Plex-Client-Identifier': clientId,
        'X-Plex-Session-Identifier': sessionId,
        'X-Plex-Product': appName,
        'X-Plex-Device-Name': getBrowserName(),
        'X-Plex-Platform': getBrowserName(),
        'X-Plex-Device-Icon': clientIcon,
      },
    });
  } catch (error) {
    // do nothing
  }
};

// ======================================================================
// SCROBBLE ITEM
// ======================================================================

// export const scrobbleItem = (baseUrl, accessToken, key, identifier) => {
//   return new Promise((resolve, reject) => {
//     const endpoint = `${baseUrl}/:/scrobble?key=${key}&identifier=${identifier}`;
//     axios
//       .get(endpoint, {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Plex-Token': accessToken,
//           'X-Plex-Client-Identifier': clientId,
//         },
//       })
//       .then((response) => {
//         resolve(response);
//       })
//       .catch((error) => {
//         reject({
//           code: 'scrobbleItem.1',
//           message: `Failed to scrobble item to ${endpoint}: ${error.message}`,
//           error,
//         });
//       });
//   });
// };
