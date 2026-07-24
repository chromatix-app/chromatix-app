// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';

import config from 'js/_config/config';
import { getEnvironment, getLocalStorage, raceToSuccess, setLocalStorage } from 'js/utils';
import * as plexTranspose from 'js/services/plexTranspose';

// ======================================================================
// OPTIONS
// ======================================================================

const envData = getEnvironment();

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
    getAllUsers: () => 'https://plex.tv/api/v2/home/users',
    switchUser: (uuid) => `https://plex.tv/api/v2/home/users/${uuid}/switch`,
    getUserInfo: () => 'https://plex.tv/api/v2/user',
  },
  server: {
    getAllServers: () => 'https://plex.tv/api/v2/resources',
  },
  library: {
    getAllLibraries: (serverBaseUrl) => `${serverBaseUrl}/library/sections`,
  },
  search: {
    searchLibrary: (serverBaseUrl) => `${serverBaseUrl}/hubs/search`,
  },
  artist: {
    getAllArtists: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getArtistDetails: (serverBaseUrl, artistId) => `${serverBaseUrl}/library/metadata/${artistId}`,
    getAllArtistAlbums: (serverBaseUrl, artistId) => `${serverBaseUrl}/library/metadata/${artistId}/children`,
    // getAllArtistRelatedAlbums: (serverBaseUrl, artistId) => `${serverBaseUrl}/library/metadata/${artistId}/related`,
    getAllArtistTracks: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getAllArtistAppearanceTracks: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
  },
  album: {
    getAllAlbums: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumDetails: (serverBaseUrl, albumId) => `${serverBaseUrl}/library/metadata/${albumId}`,
    getAlbumTracks: (serverBaseUrl, albumId) => `${serverBaseUrl}/library/metadata/${albumId}/children`,
  },
  folder: {
    getFolderItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/folder`,
  },
  playlist: {
    getAllPlaylists: (serverBaseUrl) => `${serverBaseUrl}/playlists`,
    getPlaylistDetails: (serverBaseUrl, playlistId) => `${serverBaseUrl}/playlists/${playlistId}`,
    getPlaylistTracks: (serverBaseUrl, playlistId) => `${serverBaseUrl}/playlists/${playlistId}/items`,
    createPlaylist: (serverBaseUrl) => `${serverBaseUrl}/playlists`,
    editPlaylist: (serverBaseUrl, playlistId) => `${serverBaseUrl}/playlists/${playlistId}`,
    deletePlaylist: (serverBaseUrl, playlistId) => `${serverBaseUrl}/playlists/${playlistId}`,
    addTracksToPlaylist: (serverBaseUrl, playlistId) => `${serverBaseUrl}/playlists/${playlistId}/items`,
    removeTrackFromPlaylist: (serverBaseUrl, playlistId, playlistItemId) =>
      `${serverBaseUrl}/playlists/${playlistId}/items/${playlistItemId}`,
    movePlaylistItem: (serverBaseUrl, playlistId, playlistItemId) =>
      `${serverBaseUrl}/playlists/${playlistId}/items/${playlistItemId}/move`,
  },
  shared: {
    getSharedMedia: (serverBaseUrl) => `${serverBaseUrl}/library/shared/all`,
  },
  collection: {
    getAllCollections: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/collections`,
    getCollectionItems: (serverBaseUrl, collectionId) =>
      `${serverBaseUrl}/library/collections/${collectionId}/children`,
    createCollection: (serverBaseUrl) => `${serverBaseUrl}/library/collections`,
    editCollection: (serverBaseUrl, collectionId) => `${serverBaseUrl}/library/collections/${collectionId}`,
    deleteCollection: (serverBaseUrl, collectionId) => `${serverBaseUrl}/library/collections/${collectionId}`,
    addItemsToCollection: (serverBaseUrl, collectionId) => `${serverBaseUrl}/library/collections/${collectionId}/items`,
    removeItemFromCollection: (serverBaseUrl, collectionId, itemId) =>
      `${serverBaseUrl}/library/collections/${collectionId}/items/${itemId}`,
  },
  tags: {
    getAllArtistGenres: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/genre`,
    getAllArtistMoods: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/mood`,
    getAllArtistStyles: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/style`,

    getAllAlbumGenres: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/genre`,
    getAllAlbumMoods: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/mood`,
    getAllAlbumStyles: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/style`,

    getArtistGenreItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getArtistMoodItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getArtistStyleItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,

    getAlbumGenreItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumMoodItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
    getAlbumStyleItems: (serverBaseUrl, libraryId) => `${serverBaseUrl}/library/sections/${libraryId}/all`,
  },
  rating: {
    setStarRating: (serverBaseUrl) => `${serverBaseUrl}/:/rate`,
  },
  status: {
    logPlaybackStatus: (serverBaseUrl) => `${serverBaseUrl}/:/timeline`,
  },
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

// STANDARD HEADERS FOR MOST REQUESTS

const getRequestHeaders = (accessToken) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Plex-Token': accessToken,
    'X-Plex-Client-Identifier': clientId,
  };

  // // [TODO]
  // if (restrictionProfileId) {
  //   headers['X-Plex-Restriction-Profile'] = restrictionProfileId;
  // }

  return headers;
};

const getPlaybackHeaders = (accessToken, sessionId) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Plex-Token': accessToken,
    'X-Plex-Client-Identifier': clientId,
    'X-Plex-Session-Identifier': sessionId,
    'X-Plex-Product': envData.appName,
    'X-Plex-Device-Name': envData.deviceName,
    'X-Plex-Platform': envData.appPlatformName,
    'X-Plex-Device-Icon': clientIcon,
  };

  // // [TODO]
  // if (restrictionProfileId) {
  //   headers['X-Plex-Restriction-Profile'] = restrictionProfileId;
  // }

  return headers;
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
              'X-Plex-Product': envData.appName,
              'X-Plex-Client-Identifier': clientId,
              'X-Plex-Device-Icon': clientIcon, // [NOTE] this doesn't seem to work
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
            envData.appName
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
// LOGOUT
// ======================================================================

export const logout = () => {
  window.localStorage.removeItem(storageServiceKey);
  window.localStorage.removeItem(storageTokenKey);
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
            Accept: 'application/json',
            'X-Plex-Token': accessToken,
            'X-Plex-Client-Identifier': clientId,
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
// GET ALL USERS
// ======================================================================

export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.user.getAllUsers();
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(plexTranspose.transposeAllUsersArray(response));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllUsers.1',
            message: 'Failed to get all users: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getAllUsers.2',
        message: 'Failed to get all users: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SWITCH USER
// ======================================================================

export const switchUser = ({ uuid, pin }) => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.user.switchUser(uuid);

      axios
        .post(
          endpoint,
          {
            includeSubscriptions: 1,
            includeProviders: 1,
            includeSettings: 1,
            includeSharedSettings: 1,
            pin: pin,
          },
          {
            headers: getRequestHeaders(accessToken),
          }
        )
        .then((response) => {
          resolve(response?.data?.authToken);
        })
        .catch((error) => {
          reject({
            code: 'plex.switchUser.1',
            message: 'Failed to switch home user: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.switchUser.2',
        message: 'Failed to switch home user: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL SERVERS
// ======================================================================

export const getAllServers = ({ userToken }) => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = userToken || getLocalStorage(storageTokenKey);
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

export const getFastestConnection = ({ server }) => {
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
  return raceToSuccess(requests)
    .then((activeConnection) => {
      return activeConnection;
    })
    .catch((error) => {
      throw new Error('No active connection found');
    });
};

// ======================================================================
// GET ALL LIBRARIES
// ======================================================================

export const getAllLibraries = ({ accessToken, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.library.getAllLibraries(serverBaseUrl);
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

export const getAllArtists = ({ accessToken, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtists(serverBaseUrl, libraryId);
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
          resolve(plexTranspose.transposeArtistArray(response, libraryId, serverBaseUrl, accessToken));
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
// GET ALL ALBUM ARTISTS
// ======================================================================

/*
This is not required when using the Plex API, but is here for compatibility with other services.
*/

export const getAllAlbumArtists = ({ accessToken, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
};

// ======================================================================
// GET ARTIST DETAILS
// ======================================================================

export const getArtistDetails = ({ accessToken, artistId, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(serverBaseUrl, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeArtistDetails(response, libraryId, serverBaseUrl, accessToken));
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

export const getAllArtistAlbums = ({ accessToken, artistId, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAlbums(serverBaseUrl, artistId);
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
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, serverBaseUrl, accessToken));
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

export const getAllArtistRelatedAlbums = ({ accessToken, artistId, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(serverBaseUrl, artistId);
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
          resolve(plexTranspose.transposeArtistRelatedArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistRelatedAlbums.1',
            message: 'Failed to get all artist related albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistRelatedAlbums.2',
        message: 'Failed to get all artist related albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST APPEARANCES
// ======================================================================

export const getAllArtistAppearanceAlbums = ({
  accessToken,
  artistId,
  artistName,
  libraryId,
  serverBaseUrl,
  store,
  userId,
}) => {
  return new Promise((resolve, reject) => {
    try {
      getAllArtistAppearanceAlbumIds({
        accessToken,
        artistName,
        serverBaseUrl,
        libraryId,
      })
        .then((response) => {
          if (response.length <= 0) {
            resolve([]);
          } else {
            let artistAppearanceAlbums = [];
            const allAlbums1 = store.getState().appModel.allAlbums;

            // For each returned album ID, get the album details
            const albumPromises = response.map((albumId) => {
              // Check to see if we already have the album info in the store
              const albumInfo1 = allAlbums1 ? allAlbums1?.find((album) => album.albumId === albumId) : null;
              if (albumInfo1) {
                artistAppearanceAlbums.push(albumInfo1);
                return Promise.resolve();
              }

              // If not, get the album details
              return new Promise((resolve2) => {
                getAlbumDetails({
                  accessToken,
                  albumId,
                  libraryId,
                  serverBaseUrl,
                })
                  .then((response) => {
                    artistAppearanceAlbums.push(response);
                    resolve2();
                  })
                  .catch((error) => {
                    reject({
                      code: 'plex.getAllArtistAppearanceAlbums.1',
                      message: 'Failed to get all artist appearance albums: ' + error?.message,
                      error: error,
                    });
                  });
              });
            });

            Promise.all(albumPromises)
              .then(() => {
                resolve(artistAppearanceAlbums);
              })
              .catch((error) => {
                reject({
                  code: 'plex.getAllArtistAppearanceAlbums.2',
                  message: 'Failed to get all artist appearance albums: ' + error?.message,
                  error: error,
                });
              });
          }
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistAppearanceAlbums.3',
            message: 'Failed to get all artist appearance albums: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.getAllArtistAppearanceAlbums.4',
        message: 'Failed to get all artist appearance albums: ' + error?.message,
        error: error,
      });
    }
  });
};

export const getAllArtistAppearanceAlbumIds = ({ accessToken, artistName, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAppearanceTracks(serverBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      // [NOTE] we are using a query string because of the use of a != operator
      const queryString = `?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=${albumExcludeFields}`;

      axios
        .get(endpoint + queryString, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(
            plexTranspose.transposeArtistAppearanceAlbumIdsArray(response, libraryId, serverBaseUrl, accessToken)
          );
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

export const getAllArtistTracks = ({ accessToken, artistId, artistName, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistTracks(serverBaseUrl, libraryId);
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      abortControllers.push(controller1, controller2);

      // Request 1: Get artist's own tracks
      const artistTracksRequest = axios.get(endpoint, {
        headers: getRequestHeaders(accessToken),
        params: {
          type: 10,
          'artist.id': artistId,
          excludeFields: albumExcludeFields,
        },
        signal: controller1.signal,
      });

      // Request 2: Get artist appearance tracks
      // [NOTE] we are using a query string because of the use of a != operator
      const queryString = `?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=${albumExcludeFields}`;
      const appearanceTracksRequest = axios.get(endpoint + queryString, {
        headers: getRequestHeaders(accessToken),
        signal: controller2.signal,
      });

      Promise.all([artistTracksRequest, appearanceTracksRequest])
        .then(([artistResponse, appearanceResponse]) => {
          const artistTracks = plexTranspose.transposeTrackArray(artistResponse, libraryId, serverBaseUrl, accessToken);
          const appearanceTracks = plexTranspose.transposeTrackArray(
            appearanceResponse,
            libraryId,
            serverBaseUrl,
            accessToken
          );
          resolve([...artistTracks, ...appearanceTracks]);
        })
        .catch((error) => {
          reject({
            code: 'plex.getAllArtistTracks.1',
            message: 'Failed to get all artist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller1 && ctrl !== controller2);
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

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

export const getAllAlbums = ({ accessToken, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAllAlbums(serverBaseUrl, libraryId);
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
          resolve(plexTranspose.transposeAlbumArray(response, libraryId, serverBaseUrl, accessToken));
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

export const getAlbumDetails = ({ accessToken, albumId, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAlbumDetails(serverBaseUrl, albumId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeAlbumDetails(response, libraryId, serverBaseUrl, accessToken));
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

export const getAlbumTracks = ({ accessToken, albumId, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAlbumTracks(serverBaseUrl, albumId);
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
          resolve(plexTranspose.transposeTrackArray(response, libraryId, serverBaseUrl, accessToken));
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

export const getFolderItems = ({ accessToken, folderId, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.folder.getFolderItems(serverBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      if (folderId !== 'root' && (isNaN(folderId) || folderId === null || folderId === undefined)) {
        const error = new Error('Invalid folder ID');
        error.status = 404;
        reject({
          code: 'plex.getFolderItems.1',
          message: 'Invalid folder ID provided',
          error: error,
        });
        return;
      }

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            parent: folderId,
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeFolderArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'plex.getFolderItems.2',
            message: 'Failed to get folder items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getFolderItems.3',
        message: 'Failed to get folder items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

export const getAllPlaylists = ({ accessToken, libraryId, serverBaseUrl, timeStamp, allPlaylistEdits, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getAllPlaylists(serverBaseUrl, libraryId);
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
          resolve(
            plexTranspose.transposePlaylistArray(
              response,
              libraryId,
              serverBaseUrl,
              accessToken,
              timeStamp,
              allPlaylistEdits
            )
          );
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

export const getPlaylistDetails = ({ accessToken, libraryId, playlistId, serverBaseUrl, timeStamp, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistDetails(serverBaseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposePlaylistDetails(response, libraryId, serverBaseUrl, accessToken, timeStamp));
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

export const getPlaylistTracks = ({ accessToken, libraryId, playlistId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistTracks(serverBaseUrl, playlistId);
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
          resolve(plexTranspose.transposeTrackArray(response, libraryId, serverBaseUrl, accessToken));
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
// CREATE PLAYLIST
// ======================================================================

export const createPlaylist = ({ accessToken, libraryId, serverId, serverBaseUrl, title }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.createPlaylist(serverBaseUrl);
      axios
        .post(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            title,
            type: 'audio',
            smart: 0,
            sectionID: libraryId,
            uri: `server://${serverId}/com.plexapp.plugins.library/library/sections/${libraryId}`,
          },
        })
        .then((response) => {
          resolve(response.data?.MediaContainer?.Metadata?.[0]);
        })
        .catch((error) => {
          reject({
            code: 'plex.createPlaylist.1',
            message: 'Failed to create playlist: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.createPlaylist.2',
        message: 'Failed to create playlist: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// EDIT PLAYLIST
// ======================================================================

export const editPlaylist = ({ accessToken, serverBaseUrl, playlistId, title }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.editPlaylist(serverBaseUrl, playlistId);
      axios
        .put(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            ...(title !== undefined && { title }),
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.editPlaylist.1',
            message: 'Failed to edit playlist: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.editPlaylist.2',
        message: 'Failed to edit playlist: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// DELETE PLAYLIST
// ======================================================================

export const deletePlaylist = ({ accessToken, serverBaseUrl, playlistId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.deletePlaylist(serverBaseUrl, playlistId);
      axios
        .delete(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.deletePlaylist.1',
            message: 'Failed to delete playlist: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.deletePlaylist.2',
        message: 'Failed to delete playlist: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// ADD TRACK TO PLAYLIST
// ======================================================================

export const addTracksToPlaylist = ({ accessToken, serverBaseUrl, playlistId, serverId, trackIds }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.addTracksToPlaylist(serverBaseUrl, playlistId);
      axios
        .put(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            uri: `server://${serverId}/com.plexapp.plugins.library/library/metadata/${trackIds.join(',')}`,
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.addTracksToPlaylist.1',
            message: 'Failed to add track to playlist: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.addTracksToPlaylist.2',
        message: 'Failed to add track to playlist: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// REMOVE TRACK FROM PLAYLIST
// ======================================================================

export const removeTrackFromPlaylist = ({ accessToken, serverBaseUrl, playlistId, playlistItemId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.removeTrackFromPlaylist(serverBaseUrl, playlistId, playlistItemId);
      axios
        .delete(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.removeTrackFromPlaylist.1',
            message: 'Failed to remove track from playlist: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.removeTrackFromPlaylist.2',
        message: 'Failed to remove track from playlist: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// REMOVE TRACKS FROM PLAYLIST
// ======================================================================

// [NOTE] Plex has no bulk-remove endpoint, so this just loops removeTrackFromPlaylist -
// exists purely so bridge.js can call the same function name across both services

export const removeTracksFromPlaylist = ({ accessToken, serverBaseUrl, playlistId, playlistItemIds }) => {
  return Promise.all(
    playlistItemIds.map((playlistItemId) =>
      removeTrackFromPlaylist({ accessToken, serverBaseUrl, playlistId, playlistItemId })
    )
  );
};

// ======================================================================
// MOVE PLAYLIST ITEM
// ======================================================================

export const movePlaylistItem = ({ accessToken, serverBaseUrl, playlistId, playlistItemId, afterPlaylistItemId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.movePlaylistItem(serverBaseUrl, playlistId, playlistItemId);
      axios
        .put(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            ...(afterPlaylistItemId != null && {
              after: afterPlaylistItemId,
            }),
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.movePlaylistItem.1',
            message: 'Failed to move playlist item: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.movePlaylistItem.2',
        message: 'Failed to move playlist item: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET SHARED MEDIA
// ======================================================================

export const getSharedMedia = ({ accessToken, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.shared.getSharedMedia(serverBaseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          params: {
            includeCollections: 1,
            includeExternalMedia: 1,
            includeAdvanced: 1,
            includeMeta: 1,
            type: '8,9,10,15', // artists, albums, tracks, playlists
          },
          signal: controller.signal,
        })
        .then((response) => {
          resolve(response.data.MediaContainer.Metadata);
        })
        .catch((error) => {
          reject({
            code: 'plex.getSharedMedia.1',
            message: 'Failed to get shared media: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getSharedMedia.2',
        message: 'Failed to get shared media: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

export const getAllCollections = ({ accessToken, libraryId, serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getAllCollections(serverBaseUrl, libraryId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(plexTranspose.transposeCollectionArray(response, libraryId, serverBaseUrl, accessToken));
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

export const getCollectionItems = ({ accessToken, collectionId, libraryId, serverBaseUrl, typeKey }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.getCollectionItems(serverBaseUrl, collectionId);
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
          resolve(plexTranspose.transposeCollectionItemArray(response, libraryId, serverBaseUrl, accessToken, typeKey));
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
// CREATE COLLECTION
// ======================================================================

export const createCollection = ({ accessToken, libraryId, serverId, serverBaseUrl, title, type, itemIds }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.createCollection(serverBaseUrl);
      axios
        .post(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            title,
            type: type === 'artist' ? 8 : 9,
            smart: 0,
            sectionId: libraryId,
            uri: `server://${serverId}/com.plexapp.plugins.library/library/metadata/${itemIds.join(',')}`,
          },
        })
        .then((response) => {
          resolve(response.data?.MediaContainer?.Metadata?.[0]);
        })
        .catch((error) => {
          reject({
            code: 'plex.createCollection.1',
            message: 'Failed to create collection: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.createCollection.2',
        message: 'Failed to create collection: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// EDIT COLLECTION
// ======================================================================

export const editCollection = ({ accessToken, serverBaseUrl, collectionId, title }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.editCollection(serverBaseUrl, collectionId);
      axios
        .put(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            ...(title !== undefined && { title }),
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.editCollection.1',
            message: 'Failed to edit collection: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.editCollection.2',
        message: 'Failed to edit collection: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// DELETE COLLECTION
// ======================================================================

export const deleteCollection = ({ accessToken, serverBaseUrl, collectionId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.deleteCollection(serverBaseUrl, collectionId);
      axios
        .delete(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.deleteCollection.1',
            message: 'Failed to delete collection: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.deleteCollection.2',
        message: 'Failed to delete collection: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// ADD ITEMS TO COLLECTION
// ======================================================================

export const addItemsToCollection = ({ accessToken, serverBaseUrl, collectionId, serverId, itemIds }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.addItemsToCollection(serverBaseUrl, collectionId);
      axios
        .put(endpoint, null, {
          headers: getRequestHeaders(accessToken),
          params: {
            uri: `server://${serverId}/com.plexapp.plugins.library/library/metadata/${itemIds.join(',')}`,
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.addItemsToCollection.1',
            message: 'Failed to add items to collection: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.addItemsToCollection.2',
        message: 'Failed to add items to collection: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// REMOVE ITEM FROM COLLECTION
// ======================================================================

export const removeItemFromCollection = ({ accessToken, serverBaseUrl, collectionId, itemId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.collection.removeItemFromCollection(serverBaseUrl, collectionId, itemId);
      axios
        .delete(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'plex.removeItemFromCollection.1',
            message: 'Failed to remove item from collection: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'plex.removeItemFromCollection.2',
        message: 'Failed to remove item from collection: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

export const getAllTags = ({ accessToken, libraryId, serverBaseUrl, typeKey }) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate typeKey is one of the expected values for Plex
      if (!['Genre', 'Mood', 'Style'].some((value) => typeKey.includes(value))) {
        resolve([]);
        return;
      }

      const endpoint = endpointConfig.tags[`getAll${typeKey}`](serverBaseUrl, libraryId);
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

export const getTagItems = ({ accessToken, libraryId, serverBaseUrl, tagId, typeKey }) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate typeKey is one of the expected values for Plex
      if (!['Genre', 'Mood', 'Style'].some((value) => typeKey.includes(value))) {
        const error = new Error('Invalid tag ID');
        error.status = 404;
        reject({
          code: 'plex.getTagItems.1',
          message: 'Failed to get all tag items: ' + error?.message,
          error: error,
        });
        return;
      }

      const endpoint = endpointConfig.tags[`get${typeKey}`](serverBaseUrl, libraryId);
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
          const tagItems = plexTranspose.transposeTagItemArray(
            response,
            libraryId,
            serverBaseUrl,
            accessToken,
            typeKey
          );
          if (tagItems.length > 0) {
            resolve(tagItems);
          } else {
            const error = new Error('Invalid tag ID');
            error.status = 404;
            reject({
              code: 'plex.getTagItems.2',
              message: 'Failed to get all tag items: ' + error?.message,
              error: error,
            });
          }
        })
        .catch((error) => {
          reject({
            code: 'plex.getTagItems.3',
            message: 'Failed to get all tag items: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'plex.getTagItems.4',
        message: 'Failed to get all tag items: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// SEARCH
// ======================================================================

export const searchLibrary = ({
  accessToken,
  includeCollections = 1,
  libraryId,
  limit = 25,
  query,
  serverBaseUrl,
  userId,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.search.searchLibrary(serverBaseUrl);
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
          resolve(plexTranspose.transposeSearchResultsArray(response, libraryId, serverBaseUrl, accessToken));
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

export const setStarRating = ({ accessToken, rating, ratingKey, serverBaseUrl, sessionId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.rating.setStarRating(serverBaseUrl, ratingKey, rating);
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
            ...getPlaybackHeaders(accessToken, sessionId),
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

export const logPlaybackStatus = ({
  accessToken,
  currentTime,
  duration,
  itemId,
  serverBaseUrl,
  sessionId,
  state,
  trackId,
  type,
  userId,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.status.logPlaybackStatus(serverBaseUrl);
      const params = {
        type: type,
        key: trackId,
        ratingKey: itemId,
        state: state, // playing, paused, stopped
        time: Math.floor(currentTime) || 0, // time in milliseconds
        playbackTime: Math.floor(currentTime) || 0, // time in milliseconds
        duration: Math.floor(duration) || 0, // duration of the media in milliseconds
        context: 'source:content.library',
        hasMDE: 1,

        // key: /library/metadata/163447
        // ratingKey: 163447
        // state: paused
        // time: 12000
        // playbackTime: 13028
        // duration: 312000

        // playQueueItemID: 72308
        // hasMDE: 1
        // context: source:content.library
        // row: 0
        // col: 3

        // X-Plex-Token: AgZbxPCWXyXf9W_ZYsxS
        // X-Plex-Client-Identifier: 255eyov5|k265zbpmyp7ivrp
        // X-Plex-Session-Identifier: anmOezmv3vaq3roxwgz3h67f
        // X-Plex-Product: Plex Web
        // X-Plex-Version: 4.146.0
        // X-Plex-Device-Name: Microsoft Edge
        // X-Plex-Platform: Microsoft Edge
        // X-Plex-Platform-Version: 138.0

        // X-Plex-Features: external-media, indirect-media, hub-style-list
        // X-Plex-Model: bundled
        // X-Plex-Device: OSX
        // X-Plex-Device-Screen-Resolution: 2433x1240,2560×1440
        // X-Plex-Language: en-GB
        // X-Plex-Session-Id: def04ee4-856-48de-81ab-0b027587b985
        // X-Plex-Playback-Session-Id: a682497b-6201-4152-8df4-a988097e5757
        // X-Plex-Playback-Id: 132f2f13-6d95-45b8-808c-d562779e0dcO
        // X-Plex-Drm: none
        // X-Plex-Text-Format: plain
        // X-Plex-Provider-Version: 7.2
      };
      axios
        .get(endpoint, {
          params: params,
          headers: getPlaybackHeaders(accessToken, sessionId),
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

export const logPlaybackQuit = ({
  accessToken,
  currentTime,
  duration,
  itemId,
  serverBaseUrl,
  sessionId,
  state,
  trackId,
  type,
  userId,
}) => {
  try {
    const endpoint = endpointConfig.status.logPlaybackStatus(serverBaseUrl);
    const params = new URLSearchParams({
      type: type,
      key: trackId,
      ratingKey: itemId,
      state: state, // playing, paused, stopped
      time: Math.floor(currentTime) || 0, // time in milliseconds
      playbackTime: Math.floor(currentTime) || 0, // time in milliseconds
      duration: Math.floor(duration) || 0, // duration of the media in milliseconds
    }).toString();

    const fetchUrl = `${endpoint}?${params}`;

    fetch(fetchUrl, {
      method: 'GET',
      keepalive: true,
      headers: getPlaybackHeaders(accessToken, sessionId),
    });
  } catch (error) {
    // do nothing
  }
};
