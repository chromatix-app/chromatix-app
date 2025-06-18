// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';

import config from 'js/_config/config';
import { getBrowserName, getLocalStorage, raceToSuccess, setLocalStorage } from 'js/utils';
import * as plexTranspose from 'js/services/plexTranspose';

// ======================================================================
// OPTIONS
// ======================================================================

const appName = 'Chromatix';
const clientId = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const storagePinKey = config.storagePinKey;
const storageServiceKey = config.storageServiceKey;
const storageTokenKey = config.storageTokenKey;

const redirectPath = window.location.origin;
const redirectQuery = 'plex-login';
const redirectUrl = `${redirectPath}?${redirectQuery}=true`;

const artistExcludeFields = 'art,guid,lastRatedAt,parentRatingKey,parentTitle,skipCount,summary,updatedAt,viewCount';
const albumExcludeFields =
  'art,guid,lastRatedAt,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,parentThumb,skipCount,studio,summary,updatedAt,viewCount';
const artistAndAlbumExcludeFields =
  'art,guid,lastRatedAt,librarySectionTitle,librarySectionID,librarySectionKey,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,parentThumb,rating,skipCount,studio,summary,updatedAt,viewCount';
const playlistExcludeFields = 'guid,lastRatedAt,summary,updatedAt,viewCount';
const trackExcludeFields =
  'art,grandparentArt,grandparentThumb,guid,librarySectionTitle,librarySectionID,librarySectionKey,musicAnalysisVersion,parentStudio,parentThumb,summary,updatedAt';
const searchExcludeFields = 'summary';

const excludeElements = 'Collection,Director,Image,UltraBlurColors';
const artistRelatedExcludeElements = 'Country,Director,Guid,Image,Location,Mood,Similar,Style,UltraBlurColors';

// ======================================================================
// ENDPOINTS
// ======================================================================

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
  search: {
    searchLibrary: (baseUrl) => `${baseUrl}/library/search`,
  },
  artist: {
    getAllArtists: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getArtistDetails: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}`,
    getAllArtistAlbums: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}/children`,
    // getAllArtistRelated: (baseUrl, artistId) => `${baseUrl}/library/metadata/${artistId}/related`,
    getAllArtistAppearanceTracks: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getAllArtistTracks: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
  },
  album: {
    getAllAlbums: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getAlbumDetails: (baseUrl, albumId) => `${baseUrl}/library/metadata/${albumId}`,
    getAlbumTracks: (baseUrl, albumId) => `${baseUrl}/library/metadata/${albumId}/children`,
  },
  folder: {
    getFolderItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/folder`,
  },
  playlist: {
    getAllPlaylists: (baseUrl) => `${baseUrl}/playlists`,
    getPlaylistDetails: (baseUrl, playlistId) => `${baseUrl}/playlists/${playlistId}`,
    getPlaylistTracks: (baseUrl, playlistId) => `${baseUrl}/playlists/${playlistId}/items`,
  },
  collection: {
    getAllCollections: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/collections`,
    getCollectionItems: (baseUrl, collectionId) => `${baseUrl}/library/collections/${collectionId}/children`,
  },
  tags: {
    getAllArtistGenres: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/genre`,
    getAllArtistMoods: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/mood`,
    getAllArtistStyles: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/style`,

    getAllAlbumGenres: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/genre`,
    getAllAlbumMoods: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/mood`,
    getAllAlbumStyles: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/style`,

    getArtistGenreItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getArtistMoodItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getArtistStyleItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,

    getAlbumGenreItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getAlbumMoodItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
    getAlbumStyleItems: (baseUrl, libraryId) => `${baseUrl}/library/sections/${libraryId}/all`,
  },
  rating: {
    setStarRating: (baseUrl) => `${baseUrl}/:/rate`,
  },
  status: {
    logPlaybackStatus: (baseUrl) => `${baseUrl}/:/timeline`,
  },
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

// STANDARD HEADERS FOR MOST REQUESTS

const getRequestHeaders = (accessToken) => {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Plex-Token': accessToken,
    'X-Plex-Client-Identifier': clientId,
  };
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
            code: 'plex.login.1',
            message: 'Failed to generate PIN',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.login.2',
        message: 'Failed to generate PIN',
        error: error,
      });
    }
  });
};

// ======================================================================
// CHECK AUTH PIN STATUS
// ======================================================================

export const checkPinStatus = () => {
  return new Promise((resolve, reject) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPlexLoginRedirect = urlParams.get(redirectQuery);
    // if the URL contains our redirect query param, we need to check the PIN status
    if (isPlexLoginRedirect) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const pinId = getLocalStorage(storagePinKey);
      if (pinId) {
        checkPinStatus2(pinId).then(resolve).catch(reject);
      } else {
        reject({
          code: 'plex.checkPinStatus.1',
          message: 'No pin ID found',
          error: null,
        });
      }
    } else {
      resolve();
    }
  });
};

const checkPinStatus2 = (pinId, retryCount = 0) => {
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
            setLocalStorage(storageServiceKey, 'plex');
            setLocalStorage(storageTokenKey, pinStatusData.authToken);
            window.localStorage.removeItem(storagePinKey);
            resolve();
          }
          // if the PIN is not yet authorized, check again in a second
          else {
            // limit number of retries
            if (retryCount < maxRetries) {
              setTimeout(() => checkPinStatus2(pinId, retryCount + 1), 1000);
            } else {
              reject({
                code: 'plex.checkPinStatus2.1',
                message: 'Failed to authorize PIN after ' + maxRetries + ' attempts',
                error: null,
              });
            }
          }
        })
        .catch((error) => {
          reject({
            code: 'plex.checkPinStatus2.2',
            message: 'Failed to check PIN status',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.checkPinStatus2.3',
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
  window.localStorage.removeItem(storageServiceKey);
  window.localStorage.removeItem(storageTokenKey);
};

// ======================================================================
// GET USER INFO
// ======================================================================

export const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.user.getUserInfo();
      axios
        .get(endpoint, {
          headers: {
            'X-Plex-Token': accessToken,
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
            code: 'plex.getUserInfo.1',
            message: 'Failed to get user info: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getUserInfo.2',
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
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.server.getAllServers();
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
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
            code: 'plex.getAllServers.1',
            message: 'Failed to get all servers: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getAllServers.2',
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
              code: 'plex.getFastestConnection.1',
              message: `Failed to connect to ${connection.uri}: ${error?.message}`,
              error,
            });
          });
      }, delay);
    });
  });

  // return the first connection that responds
  return raceToSuccess(requests, {
    code: 'plex.getFastestConnection.2',
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
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(plexTranspose.transposeLibraryArray(response));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllLibraries.1',
            message: 'Failed to get all libraries: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getAllLibraries.2',
        message: 'Failed to get all libraries: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

export const getAllArtists = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtists(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            type: 8,
            excludeFields: artistExcludeFields,
            excludeElements: excludeElements,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtists.1',
            message: 'Failed to get all artists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtists.2',
        message: 'Failed to get all artists: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ARTIST DETAILS
// ======================================================================

export const getArtistDetails = (baseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(baseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistDetails(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getArtistDetails.1',
            message: 'Failed to get artist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getArtistDetails.2',
        message: 'Failed to get artist details: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST ALBUMS
// ======================================================================

export const getAllArtistAlbums = (baseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAlbums(baseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeFields: albumExcludeFields,
            excludeElements: excludeElements,
            // excludeAllLeaves: 1,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistAlbums.1',
            message: 'Failed to get all artist albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistAlbums.2',
        message: 'Failed to get all artist albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST RELATED ALBUMS
// ======================================================================

export const getAllArtistRelated = (baseUrl, libraryId, artistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(baseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            includeRelated: 1,
            includeRelatedCount: 999,
            excludeFields: albumExcludeFields,
            excludeElements: artistRelatedExcludeElements,
            // excludeAllLeaves: 1,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistRelatedArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistRelated.1',
            message: 'Failed to get all artist related albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistRelated.2',
        message: 'Failed to get all artist related albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST APPEARANCES
// ======================================================================

export const getAllArtistAppearanceAlbums = (baseUrl, libraryId, artistName, store, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      getAllArtistAppearanceAlbumIds(baseUrl, libraryId, artistName, accessToken)
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
                getAlbumDetails(baseUrl, libraryId, albumId, accessToken)
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
                  code: 'plex.getAllArtistAppearanceAlbums.1',
                  message: 'Failed to get all artist appearance albums: ' + error?.message,
                  error: error,
                });
              });
          }
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistAppearanceAlbums.2',
            message: 'Failed to get all artist appearance albums: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistAppearanceAlbums.3',
        message: 'Failed to get all artist appearance albums: ' + error?.message,
        error: error,
      });
    }
  });
};

export const getAllArtistAppearanceAlbumIds = (baseUrl, libraryId, artistName, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAppearanceTracks(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      // We are using a query string because of the use of a != operator
      const queryString = `?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=${albumExcludeFields}`;

      axios
        .get(endpoint + queryString, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistAppearanceAlbumIdsArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistAppearanceAlbumIds.1',
            message: 'Failed to get all artist appearance album IDs: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistAppearanceAlbumIds.2',
        message: 'Failed to get all artist appearance album IDs: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ARTIST TRACKS
// ======================================================================

export const getAllArtistTracks = (baseUrl, libraryId, artistId, artistName, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistTracks(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            type: 10,
            'artist.id': artistId,
            excludeFields: albumExcludeFields,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistTracks.1',
            message: 'Failed to get all artist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistTracks.2',
        message: 'Failed to get all artist tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

export const getAllArtistAppearanceTracks = (baseUrl, libraryId, artistId, artistName, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistTracks(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      // We are using a query string because of the use of a != operator
      const queryString = `?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=${albumExcludeFields}`;

      axios
        .get(endpoint + queryString, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistAppearanceTracks.1',
            message: 'Failed to get all artist appearance tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistAppearanceTracks.2',
        message: 'Failed to get all artist appearance tracks: ' + error?.message,
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
          headers: getRequestHeaders(accessToken),
          params: {
            type: 9,
            excludeFields: albumExcludeFields,
            excludeElements: excludeElements,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllAlbums.1',
            message: 'Failed to get all albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllAlbums.2',
        message: 'Failed to get all albums: ' + error?.message,
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
      const endpoint = endpointConfig.album.getAlbumDetails(baseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeAlbumDetails(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAlbumDetails.1',
            message: 'Failed to get album details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAlbumDetails.2',
        message: 'Failed to get album details: ' + error?.message,
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
      const endpoint = endpointConfig.album.getAlbumTracks(baseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeFields: trackExcludeFields,
            excludeElements: excludeElements,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAlbumTracks.1',
            message: 'Failed to get album tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAlbumTracks.2',
        message: 'Failed to get album tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET FOLDER ITEMS
// ======================================================================

export const getFolderItems = (baseUrl, libraryId, folderId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.folder.getFolderItems(baseUrl, libraryId);
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
          resolve(plexTranspose.transposeFolderArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getFolderItems.1',
            message: 'Failed to get folder items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getFolderItems.2',
        message: 'Failed to get folder items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

export const getAllPlaylists = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getAllPlaylists(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            playlistType: 'audio',
            sectionID: libraryId,
            excludeFields: playlistExcludeFields,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposePlaylistArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllPlaylists.1',
            message: 'Failed to get all playlists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllPlaylists.2',
        message: 'Failed to get all playlists: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET PLAYLIST DETAILS
// ======================================================================

export const getPlaylistDetails = (baseUrl, libraryId, playlistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistDetails(baseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposePlaylistDetails(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getPlaylistDetails.1',
            message: 'Failed to get playlist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getPlaylistDetails.2',
        message: 'Failed to get playlist details: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET PLAYLIST TRACKS
// ======================================================================

export const getPlaylistTracks = (baseUrl, libraryId, playlistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistTracks(baseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeFields: trackExcludeFields,
            excludeElements: excludeElements,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getPlaylistTracks.1',
            message: 'Failed to get playlist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getPlaylistTracks.2',
        message: 'Failed to get playlist tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

export const getAllCollections = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getAllCollections(baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeCollectionArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllCollections.1',
            message: 'Failed to get all collections: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllCollections.2',
        message: 'Failed to get all collections: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

export const getCollectionItems = (baseUrl, libraryId, collectionId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getCollectionItems(baseUrl, collectionId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            excludeFields: artistAndAlbumExcludeFields,
            excludeElements: excludeElements,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeCollectionItemArray(response, libraryId, baseUrl, accessToken, typeKey));
        })
        .catch((error) => {
          reject({
            code: 'plex.getCollectionItems.1',
            message: 'Failed to get all collection items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getCollectionItems.2',
        message: 'Failed to get all collection items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

export const getAllTags = (baseUrl, libraryId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.tags[`getAll${typeKey}`](baseUrl, libraryId);
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
            code: 'plex.getAllTags.1',
            message: 'Failed to get all tags: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllTags.2',
        message: 'Failed to get all tags: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET TAG ITEMS
// ======================================================================

export const getTagItems = (baseUrl, libraryId, tagId, typeKey, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.tags[`get${typeKey}`](baseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            ...(typeKey === 'ArtistGenreItems' && {
              type: 8,
              genre: tagId,
              excludeFields: artistExcludeFields,
              excludeElements: excludeElements,
            }),
            ...(typeKey === 'ArtistMoodItems' && {
              type: 8,
              mood: tagId,
              excludeFields: artistExcludeFields,
              excludeElements: excludeElements,
            }),
            ...(typeKey === 'ArtistStyleItems' && {
              type: 8,
              style: tagId,
              excludeFields: artistExcludeFields,
              excludeElements: excludeElements,
            }),

            ...(typeKey === 'AlbumGenreItems' && {
              type: 9,
              genre: tagId,
              excludeFields: albumExcludeFields,
              excludeElements: excludeElements,
            }),
            ...(typeKey === 'AlbumMoodItems' && {
              type: 9,
              mood: tagId,
              excludeFields: albumExcludeFields,
              excludeElements: excludeElements,
            }),
            ...(typeKey === 'AlbumStyleItems' && {
              type: 9,
              style: tagId,
              excludeFields: albumExcludeFields,
              excludeElements: excludeElements,
            }),
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeTagItemArray(response, libraryId, baseUrl, accessToken, typeKey));
        })
        .catch((error) => {
          reject({
            code: 'plex.getTagItems.1',
            message: 'Failed to get all tag items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getTagItems.2',
        message: 'Failed to get all tag items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SEARCH
// ======================================================================

export const searchLibrary = (baseUrl, libraryId, accessToken, query, limit = 25, includeCollections = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.search.searchLibrary(baseUrl);
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
            excludeFields: searchExcludeFields,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeSearchResultsArray(response, libraryId, baseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.searchLibrary.1',
            message: 'Error searching library: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.searchLibrary.2',
        message: 'Error searching library: ' + error?.message,
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
        .then((_response) => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.setStarRating.1',
            message: `Failed to set star rating for ${ratingKey}: ${error?.message}`,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.setStarRating.2',
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
      const endpoint = endpointConfig.status.logPlaybackStatus(baseUrl);
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
            code: 'plex.logPlaybackStatus.1',
            message: 'Failed to update playback status',
            error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.logPlaybackStatus.2',
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
    const endpoint = endpointConfig.status.logPlaybackStatus(baseUrl);
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
