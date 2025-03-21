// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import CryptoJS from 'crypto-js';

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
  artist: {
    getAllArtists: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getArtistDetails: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}`,
    getAllArtistAlbums: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}/children`,
    // getAllArtistRelated: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}/related`,
    getAllArtistAppearanceTracks: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
  },
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
          resolve(plexTranspose.transposeUserData(response));
        })
        .catch((error) => {
          if (error?.code !== 'ERR_NETWORK') {
            logout();
          }
          reject({
            code: 'getUserInfo.1',
            message: 'Failed to get user info: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getUserInfo.2',
        message: 'Failed to get user info: ' + error?.message,
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
          resolve(plexTranspose.transposeServerArray(response));
        })
        .catch((error) => {
          reject({
            code: 'getAllServers.1',
            message: 'Failed to get all servers: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getAllServers.2',
        message: 'Failed to get all servers: ' + error?.message,
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
              message: `Failed to connect to ${connection.uri}: ${error?.message}`,
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
          resolve(plexTranspose.transposeLibraryArray(response));
        })
        .catch((error) => {
          reject({
            code: 'getAllLibraries.1',
            message: 'Failed to get all libraries: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getAllLibraries.2',
        message: 'Failed to get all libraries: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

export const getAllArtists = (plexBaseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtists(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            type: 8,
            excludeFields: artistExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllArtists.1',
            message: 'Failed to get all artists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllArtists.2',
        message: 'Failed to get all artists: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ARTIST DETAILS
// ======================================================================

export const getArtistDetails = (plexBaseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(plexBaseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistDetails(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getArtistDetails.1',
            message: 'Failed to get artist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getArtistDetails.2',
        message: 'Failed to get artist details: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST ALBUMS
// ======================================================================

export const getAllArtistAlbums = (plexBaseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAlbums(plexBaseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeAllLeaves: 1,
            excludeFields: albumExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllArtistAlbums.1',
            message: 'Failed to get all artist albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllArtistAlbums.2',
        message: 'Failed to get all artist albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST RELATED ALBUMS
// ======================================================================

export const getAllArtistRelated = (plexBaseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(plexBaseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            includeRelated: 1,
            includeRelatedCount: 999,
            excludeFields: 'summary',
            excludeElements: 'Country,Genre,Guid,Image,Location,Mood,Similar,Style,UltraBlurColors',
            // excludeAllLeaves: 1,
            // excludeFields: albumExcludes,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistRelatedArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllArtistRelated.1',
            message: 'Failed to get all artist related albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllArtistRelated.2',
        message: 'Failed to get all artist related albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST APPEARANCES
// ======================================================================

export const getAllArtistAppearanceAlbums = (plexBaseUrl, libraryId, artistName, store, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      getAllArtistAppearanceAlbumIds(plexBaseUrl, libraryId, artistName, accessToken)
        .then((response) => {
          if (response.length <= 0) {
            resolve([]);
          } else {
            let artistCompilationAlbums = [];
            const allAlbums1 = store.getState().appModel.allAlbums;

            // For each returned album ID, get the album details
            const albumPromises = response.map((albumId) => {
              // Check to see if we already have the album info in the store
              const albumInfo1 = allAlbums1 ? allAlbums1?.find((album) => album.albumId === albumId) : null;
              if (albumInfo1) {
                artistCompilationAlbums.push(albumInfo1);
                return Promise.resolve();
              }

              // If not, get the album details
              return new Promise((resolve2) => {
                getAlbumDetails(plexBaseUrl, libraryId, albumId, accessToken)
                  .then((response) => {
                    artistCompilationAlbums.push(response);
                    resolve2();
                  })
                  .catch((_error) => {});
              });
            });

            Promise.all(albumPromises)
              .then(() => {
                resolve(artistCompilationAlbums);
              })
              .catch((error) => {
                reject({
                  code: 'getAllArtistAppearanceAlbums.1',
                  message: 'Failed to get all artist appearance albums: ' + error?.message,
                  error: error,
                });
              });
          }
        })
        .catch((error) => {
          reject({
            code: 'getAllArtistAppearanceAlbums.2',
            message: 'Failed to get all artist appearance albums: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'getAllArtistAppearanceAlbums.3',
        message: 'Failed to get all artist appearance albums: ' + error?.message,
        error: error,
      });
    }
  });
};

export const getAllArtistAppearanceAlbumIds = (plexBaseUrl, libraryId, artistName, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAppearanceTracks(plexBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      // We are using a query string ebcause of the use of a != operator
      const queryString = `?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=summary`;

      axios
        .get(endpoint + queryString, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistAppearanceAlbumIdsArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllArtistAppearanceAlbumIds.1',
            message: 'Failed to get all artist appearance album IDs: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllArtistAppearanceAlbumIds.2',
        message: 'Failed to get all artist appearance album IDs: ' + error?.message,
        error: error,
      });
    }
  });
};

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
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllAlbums.1',
            message: 'Failed to get all albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllAlbums.2',
        message: 'Failed to get all albums: ' + error?.message,
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
          resolve(plexTranspose.transposeAlbumDetails(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAlbumDetails.1',
            message: 'Failed to get album details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAlbumDetails.2',
        message: 'Failed to get album details: ' + error?.message,
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
          resolve(plexTranspose.transposeTrackArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAlbumTracks.1',
            message: 'Failed to get album tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAlbumTracks.2',
        message: 'Failed to get album tracks: ' + error?.message,
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
          resolve(plexTranspose.transposeFolderArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getFolderItems.1',
            message: 'Failed to get folder items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getFolderItems.2',
        message: 'Failed to get folder items: ' + error?.message,
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
          resolve(plexTranspose.transposePlaylistArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllPlaylists.1',
            message: 'Failed to get all playlists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllPlaylists.2',
        message: 'Failed to get all playlists: ' + error?.message,
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
          resolve(plexTranspose.transposePlaylistDetails(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getPlaylistDetails.1',
            message: 'Failed to get playlist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getPlaylistDetails.2',
        message: 'Failed to get playlist details: ' + error?.message,
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
          resolve(plexTranspose.transposeTrackArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getPlaylistTracks.1',
            message: 'Failed to get playlist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getPlaylistTracks.2',
        message: 'Failed to get playlist tracks: ' + error?.message,
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
          resolve(plexTranspose.transposeCollectionArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'getAllCollections.1',
            message: 'Failed to get all collections: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllCollections.2',
        message: 'Failed to get all collections: ' + error?.message,
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
          resolve(plexTranspose.transposeCollectionItemArray(response, libraryId, plexBaseUrl, accessToken, typeKey));
        })
        .catch((error) => {
          reject({
            code: 'getCollectionItems.1',
            message: 'Failed to get all collection items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getCollectionItems.2',
        message: 'Failed to get all collection items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

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
          resolve(plexTranspose.transposeTagArray(response, libraryId, typeKey));
        })
        .catch((error) => {
          reject({
            code: 'getAllTags.1',
            message: 'Failed to get all tags: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getAllTags.2',
        message: 'Failed to get all tags: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET TAG ITEMS
// ======================================================================

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
          resolve(plexTranspose.transposeTagItemArray(response, libraryId, plexBaseUrl, accessToken, typeKey));
        })
        .catch((error) => {
          reject({
            code: 'getTagItems.1',
            message: 'Failed to get all tag items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'getTagItems.2',
        message: 'Failed to get all tag items: ' + error?.message,
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
          resolve(plexTranspose.transposeSearchResultsArray(response, libraryId, plexBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'searchHub.1',
            message: 'Failed to search hub: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'searchHub.2',
        message: 'Failed to search hub: ' + error?.message,
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
//             message: 'Failed to search library: ' + error?.message,
//             error: error,
//           });
//         })
//         .finally(() => {
//           abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
//         });
//     } catch (error) {
//       reject({
//         code: 'searchLibrary.2',
//         message: 'Failed to search library: ' + error?.message,
//         error: error,
//       });
//     }
//   });
// };

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
        .then((_response) => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'setStarRating.1',
            message: `Failed to set star rating for ${ratingKey}: ${error?.message}`,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'setStarRating.2',
        message: `Failed to set star rating for ${ratingKey}: ${error?.message}`,
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
        .then((_response) => {
          resolve();
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
