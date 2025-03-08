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

const appName = 'Chromatix';
const clientId = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const storagePinKey = config.storagePinKey;
const storageAuthKey = config.storageAuthKey;
const storageSecretKey = 'your_secret_key_here';

const redirectPath = window.location.origin;
const redirectQuery = 'plex-login';
const redirectUrl = `${redirectPath}?${redirectQuery}=true`;

const artistExcludes = 'summary,guid,key,parentRatingKey,parentTitle,skipCount';
const albumExcludes =
  'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,parentThumb,studio';
const artistAndAlbumExcludes =
  'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,skipCount,studio';
const searchExcludes = 'summary';

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
    getAllLibraries: (plexBaseUrl) => `${plexBaseUrl}/library/sections`,
  },
  search: {
    searchHub: (plexBaseUrl) => `${plexBaseUrl}/hubs/search`,
    searchLibrary: (plexBaseUrl) => `${plexBaseUrl}/library/search`,
  },
  artist: {},
  album: {
    getAllAlbums: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumDetails: (plexBaseUrl, albumId) => `${plexBaseUrl}/library/metadata/${albumId}`,
    getAlbumTracks: (plexBaseUrl, albumId) => `${plexBaseUrl}/library/metadata/${albumId}/children`,
  },
  folder: {
    getFolderItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/folder`,
  },
  playlist: {
    getAllPlaylists: (plexBaseUrl) => `${plexBaseUrl}/playlists`,
    getPlaylistDetails: (plexBaseUrl, playlistId) => `${plexBaseUrl}/playlists/${playlistId}`,
    getPlaylistTracks: (plexBaseUrl, playlistId) => `${plexBaseUrl}/playlists/${playlistId}/items`,
  },
  collection: {
    getAllCollections: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/collections`,
    getCollectionItems: (plexBaseUrl, collectionId) => `${plexBaseUrl}/library/collections/${collectionId}/children`,
  },
  tags: {
    getAllArtistGenres: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/genre`,
    getAllArtistMoods: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/mood`,
    getAllArtistStyles: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/style`,

    getAllAlbumGenres: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/genre`,
    getAllAlbumMoods: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/mood`,
    getAllAlbumStyles: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/style`,

    getArtistGenreItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
    getArtistMoodItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
    getArtistStyleItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,

    getAlbumGenreItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumMoodItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumStyleItems: (plexBaseUrl, libraryId) => `${plexBaseUrl}/library/sections/${libraryId}/all`,
  },
  rating: {
    setStarRating: (plexBaseUrl) => `${plexBaseUrl}/:/rate`,
  },
  status: {
    logPlaybackStatus: (plexBaseUrl) => `${plexBaseUrl}/:/timeline`,
  },
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

// SET AND GET ENCRYPTED LOCAL STORAGE

export const setLocalStorage = (key, value) => {
  const stringValue = String(value);
  const encryptedValue = CryptoJS.AES.encrypt(stringValue, storageSecretKey).toString();
  window.localStorage.setItem(key, encryptedValue);
};

export const getLocalStorage = (key) => {
  const encryptedValue = window.localStorage.getItem(key);
  if (encryptedValue) {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, storageSecretKey);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
  }
  return null;
};

// STANDARD HEADERS FOR MOST REQUESTS

const getRequestHeaders = (plexToken) => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Plex-Token': plexToken,
    'X-Plex-Client-Identifier': clientId,
  };
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
          headers: getRequestHeaders(authToken),
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
            headers: getRequestHeaders(accessToken),
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

export const getAllLibraries = (plexBaseUrl, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.library.getAllLibraries(plexBaseUrl);
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
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
// SEARCH
// ======================================================================

// /hubs/search?query=Epica&excludeFields=summary&limit=4&includeCollections=1&contentDirectoryID=23&includeFields=thumbBlurHash

export const searchHub = (plexBaseUrl, libraryId, accessToken, query, limit = 25, includeCollections = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.search.searchHub(plexBaseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            query,
            limit,
            includeCollections,
            contentDirectoryID: libraryId,
            excludeFields: searchExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(response?.data?.MediaContainer?.Hub);
        })
        .catch((error) => {
          reject({
            code: 'searchHub.1',
            message: 'Failed to search hub: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'searchHub.2',
        message: 'Failed to search hub: ' + error.message,
        error: error,
      });
    }
  });
};

// export const searchLibrary = (
//   plexBaseUrl,
//   accessToken,
//   query,
//   limit = 100,
//   searchTypes = 'music',
//   includeCollections = 1
// ) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const endpoint = endpointConfig.search.searchLibrary(plexBaseUrl);
//       const controller = new AbortController();
//       abortControllers.push(controller);

//       axios
//         .get(endpoint, {
//           headers: getRequestHeaders(accessToken),
//           params: {
//             query,
//             limit,
//             searchTypes,
//             includeCollections,
//           },
//           signal: controller.signal,
//         })
//         .then((response) => {
//           resolve(response?.data?.MediaContainer?.SearchResult);
//         })
//         .catch((error) => {
//           reject({
//             code: 'searchLibrary.1',
//             message: 'Failed to search library: ' + error.message,
//             error: error,
//           });
//         })
//         .finally(() => {
//           abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
//         });
//     } catch (error) {
//       reject({
//         code: 'searchLibrary.2',
//         message: 'Failed to search library: ' + error.message,
//         error: error,
//       });
//     }
//   });
// };

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

export const getAllAlbums = (plexBaseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAllAlbums(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            type: 9,
            excludeFields: albumExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const data = response?.data?.MediaContainer?.Metadata?.map((album) =>
            plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
          );
          resolve(data);
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

export const getAlbumDetails = (plexBaseUrl, libraryId, albumId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAlbumDetails(plexBaseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          const album = response?.data?.MediaContainer?.Metadata[0];
          const albumDetails = plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken);
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

export const getAlbumTracks = (plexBaseUrl, libraryId, albumId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAlbumTracks(plexBaseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((track) =>
              plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
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
// GET FOLDER ITEMS
// ======================================================================

export const getFolderItems = (plexBaseUrl, libraryId, folderId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.folder.getFolderItems(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            parent: folderId,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((item, index) =>
              plexTranspose.transposeFolderData(item, index, libraryId, plexBaseUrl, accessToken)
            ).filter((item) => item !== null) || [];

          // Sort folderItems
          data.sort((a, b) => {
            if (a.kind === 'folder' && b.kind === 'track') return -1;
            if (a.kind === 'track' && b.kind === 'folder') return 1;
            if (a.kind === 'folder' && b.kind === 'folder') return a.title.localeCompare(b.title);
            if (a.kind === 'track' && b.kind === 'track') {
              if (a.album !== b.album) return a.album.localeCompare(b.album);
              if (a.discNumber !== b.discNumber) return a.discNumber - b.discNumber;
              return a.trackNumber - b.trackNumber;
            }
            return 0;
          });

          // Add sortOrder properties to each object
          let trackSortOrder = 0;
          data.forEach((item, index) => {
            item.sortOrder = index;
            if (item.kind === 'track') {
              item.trackSortOrder = trackSortOrder;
              trackSortOrder++;
            }
          });

          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getFolderItems.1',
            message: 'Failed to get folder items: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getFolderItems.2',
        message: 'Failed to get folder items: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

export const getAllPlaylists = (plexBaseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getAllPlaylists(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            playlistType: 'audio',
            sectionID: libraryId,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((playlist) =>
              plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getAllPlaylists.1',
            message: 'Failed to get all playlists: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllPlaylists.2',
        message: 'Failed to get all playlists: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET PLAYLIST DETAILS
// ======================================================================

export const getPlaylistDetails = (plexBaseUrl, libraryId, playlistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistDetails(plexBaseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          const playlist = response?.data?.MediaContainer?.Metadata[0];
          const playlistDetails = plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken);
          resolve(playlistDetails);
        })
        .catch((error) => {
          reject({
            code: 'getPlaylistDetails.1',
            message: 'Failed to get playlist details: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getPlaylistDetails.2',
        message: 'Failed to get playlist details: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET PLAYLIST TRACKS
// ======================================================================

export const getPlaylistTracks = (plexBaseUrl, libraryId, playlistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistTracks(plexBaseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((track) =>
              plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getPlaylistTracks.1',
            message: 'Failed to get playlist tracks: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getPlaylistTracks.2',
        message: 'Failed to get playlist tracks: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

export const getAllCollections = (plexBaseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getAllCollections(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          const allCollections =
            response?.data?.MediaContainer?.Metadata?.filter(
              (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
            ).map((collection) =>
              plexTranspose.transposeCollectionData(collection, libraryId, plexBaseUrl, accessToken)
            ) || [];

          const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
          const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');
          resolve({
            allArtistCollections,
            allAlbumCollections,
          });
        })
        .catch((error) => {
          reject({
            code: 'getAllCollections.1',
            message: 'Failed to get all collections: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllCollections.2',
        message: 'Failed to get all collections: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

export const getCollectionItems = (plexBaseUrl, libraryId, collectionId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getCollectionItems(plexBaseUrl, collectionId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeFields: artistAndAlbumExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const data =
            response?.data?.MediaContainer?.Metadata?.map((item) =>
              plexTranspose[`transpose${typeKey}Data`](item, libraryId, plexBaseUrl, accessToken)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getCollectionItems.1',
            message: 'Failed to get all collection items: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getCollectionItems.2',
        message: 'Failed to get all collection items: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

const tagOptions = {
  AlbumGenres: { primaryKey: 'album', secondaryKey: 'Genre' },
  AlbumMoods: { primaryKey: 'album', secondaryKey: 'Mood' },
  AlbumStyles: { primaryKey: 'album', secondaryKey: 'Style' },
  ArtistGenres: { primaryKey: 'artist', secondaryKey: 'Genre' },
  ArtistMoods: { primaryKey: 'artist', secondaryKey: 'Mood' },
  ArtistStyles: { primaryKey: 'artist', secondaryKey: 'Style' },
};

export const getAllTags = (plexBaseUrl, libraryId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.tags[`getAll${typeKey}`](plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            type: typeKey.toLowerCase().includes('artist') ? 8 : 9,
          },
          signal: controller.signal,
        })
        .then((response) => {
          const { primaryKey, secondaryKey } = tagOptions[typeKey];
          const data =
            response?.data?.MediaContainer?.Directory?.map((entry) =>
              plexTranspose[`transpose${secondaryKey}Data`](primaryKey, entry, libraryId)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getAllTags.1',
            message: 'Failed to get all tags: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllTags.2',
        message: 'Failed to get all tags: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET TAG ITEMS
// ======================================================================

const tagItemOptions = {
  AlbumGenreItems: { primaryKey: 'Album' },
  AlbumMoodItems: { primaryKey: 'Album' },
  AlbumStyleItems: { primaryKey: 'Album' },
  ArtistGenreItems: { primaryKey: 'Artist' },
  ArtistMoodItems: { primaryKey: 'Artist' },
  ArtistStyleItems: { primaryKey: 'Artist' },
};

export const getTagItems = (plexBaseUrl, libraryId, tagId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.tags[`get${typeKey}`](plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            ...(typeKey === 'ArtistGenreItems' && {
              type: 8,
              genre: tagId,
              excludeFields: artistExcludes,
            }),
            ...(typeKey === 'ArtistMoodItems' && {
              type: 8,
              mood: tagId,
              excludeFields: artistExcludes,
            }),
            ...(typeKey === 'ArtistStyleItems' && {
              type: 8,
              style: tagId,
              excludeFields: artistExcludes,
            }),

            ...(typeKey === 'AlbumGenreItems' && {
              type: 9,
              genre: tagId,
              excludeFields: albumExcludes,
            }),
            ...(typeKey === 'AlbumMoodItems' && {
              type: 9,
              mood: tagId,
              excludeFields: albumExcludes,
            }),
            ...(typeKey === 'AlbumStyleItems' && {
              type: 9,
              style: tagId,
              excludeFields: albumExcludes,
            }),
          },
          signal: controller.signal,
        })
        .then((response) => {
          const { primaryKey } = tagItemOptions[typeKey];
          const data =
            response?.data?.MediaContainer?.Metadata?.map((entry) =>
              plexTranspose[`transpose${primaryKey}Data`](entry, libraryId, plexBaseUrl, accessToken)
            ) || [];
          resolve(data);
        })
        .catch((error) => {
          reject({
            code: 'getTagItems.1',
            message: 'Failed to get all tag items: ' + error.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getTagItems.2',
        message: 'Failed to get all tag items: ' + error.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SET STAR RATING
// ======================================================================

export const setStarRating = (plexBaseUrl, accessToken, sessionId, ratingKey, rating) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.rating.setStarRating(plexBaseUrl, ratingKey, rating);
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
          resolve(response?.data);
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
  plexBaseUrl,
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
      const endpoint = endpointConfig.status.logPlaybackStatus(plexBaseUrl);
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
  plexBaseUrl,
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
    const endpoint = endpointConfig.status.logPlaybackStatus(plexBaseUrl);
    const browserName = getBrowserName();
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
        'X-Plex-Device-Name': browserName,
        'X-Plex-Platform': browserName,
        'X-Plex-Device-Icon': clientIcon,
      },
    });
  } catch (error) {
    // do nothing
  }
};
