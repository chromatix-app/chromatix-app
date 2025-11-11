// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';

import config from 'js/_config/config';
import { getEnvironment, getLocalStorage, safeDecodeURIComponent, setLocalStorage } from 'js/utils';
import * as jellyTranspose from 'js/services/jellyTranspose';

// ======================================================================
// OPTIONS
// ======================================================================

const envData = getEnvironment();

const storageJellyServerKey = config.storageJellyServerKey;
const storageJellyUserKey = config.storageJellyUserKey;
const storageServiceKey = config.storageServiceKey;
const storageTokenKey = config.storageTokenKey;

const trackFields =
  'CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,MediaStreams,ProductionLocations,Tags,UserData';
const artistAndAlbumFields =
  'BackdropImageTags,CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,ProductionLocations,Tags,UserData';

// ======================================================================
// ENDPOINTS
// ======================================================================

const endpointConfig = {
  auth: {
    login: (serverBaseUrl) => `${serverBaseUrl}/Users/AuthenticateByName`,
  },
  user: {
    getUserInfo: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}`,
  },
  server: {
    getAllServers: (serverBaseUrl) => `${serverBaseUrl}/System/Info`,
  },
  library: {
    getAllLibraries: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Views`,
  },
  search: {
    searchLibrary: (serverBaseUrl) => `${serverBaseUrl}/Items`,
  },
  artist: {
    getAllArtists: (serverBaseUrl) => `${serverBaseUrl}/Artists`,
    getAllAlbumArtists: (serverBaseUrl) => `${serverBaseUrl}/Artists/AlbumArtists`,
    getArtistDetails: (serverBaseUrl, userId, artistId) => `${serverBaseUrl}/Users/${userId}/Items/${artistId}`,
    getAllArtistAlbums: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Items`,
    // getAllArtistRelatedAlbums: null,
    getAllArtistAppearanceAlbums: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Items`,
    getAllArtistTracks: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Items`,
  },
  album: {
    getAllAlbums: (serverBaseUrl) => `${serverBaseUrl}/Items`,
    getAlbumDetails: (serverBaseUrl, albumId) => `${serverBaseUrl}/Items/${albumId}`,
    getAlbumTracks: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Items`,
  },
  folder: {
    getFolderItems: null,
  },
  playlist: {
    getAllPlaylists: (serverBaseUrl, userId) => `${serverBaseUrl}/Users/${userId}/Items`,
    getPlaylistDetails: (serverBaseUrl, userId, playlistId) => `${serverBaseUrl}/Users/${userId}/Items/${playlistId}`,
    getPlaylistTracks: (serverBaseUrl, playlistId) => `${serverBaseUrl}/Playlists/${playlistId}/Items`,
  },
  collection: {
    getAllCollections: null,
    getCollectionItems: null,
  },
  tags: {
    getAllTags: (serverBaseUrl) => `${serverBaseUrl}/Items/Filters`,
  },
  favourite: {
    toggleFavourite: (serverBaseUrl, userId, itemId) => `${serverBaseUrl}/Users/${userId}/FavoriteItems/${itemId}`,
  },
  rating: {
    setStarRating: null,
  },
  status: {
    logPlaybackStart: (serverBaseUrl) => `${serverBaseUrl}/Sessions/Playing`,
    logPlaybackProgress: (serverBaseUrl) => `${serverBaseUrl}/Sessions/Playing/Progress`,
    logPlaybackStopped: (serverBaseUrl) => `${serverBaseUrl}/Sessions/Playing/Stopped`,
  },
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

// STANDARD HEADERS FOR MOST REQUESTS

const getRequestHeaders = (accessToken) => {
  return {
    Accept: 'application/json',
    'X-Emby-Token': accessToken,
    'X-Emby-Client': envData.appName,
    'X-Emby-Device': envData.deviceName,
    'X-Emby-Device-Id': envData.deviceId,
    'X-Emby-Client-Version': envData.webVersion || '0.0.0',
  };
};

// ======================================================================
// ABORT HANDLING
// ======================================================================

let abortControllers = [];

export const abortAllRequests = () => {
  if (abortControllers.length > 0) {
    console.log('%c### jellyTools - abortAllRequests ###', 'color:#f00;');
    abortControllers.forEach((controller) => {
      controller.abort();
    });
    abortControllers = [];
  }
};

// ======================================================================
// LOGIN
// ======================================================================

export const login = (values) => {
  const { server, username, password } = values;
  return new Promise((resolve, reject) => {
    try {
      const parsedServer = server.replace(/\/+$/, '');
      const endpoint = endpointConfig.auth.login(parsedServer);
      axios
        .post(
          endpoint,
          {
            Username: username,
            Pw: password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Emby-Authorization': `MediaBrowser Client="${envData.appName}", Device="${envData.deviceName}", DeviceId="${envData.deviceId}", Version="${envData.webVersion}"`,
            },
            timeout: 10000,
          }
        )
        .then((response) => {
          const accessToken = response?.data?.AccessToken;
          const userId = response?.data?.User?.Id;
          if (accessToken && userId) {
            setLocalStorage(storageJellyServerKey, parsedServer);
            setLocalStorage(storageJellyUserKey, userId);
            setLocalStorage(storageServiceKey, 'jellyfin');
            setLocalStorage(storageTokenKey, accessToken);
            resolve();
          }
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.login.1',
            message: 'Failed to login',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.login.2',
        message: 'Failed to login',
        error: error,
      });
    }
  });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  window.localStorage.removeItem(storageJellyServerKey);
  window.localStorage.removeItem(storageJellyUserKey);
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
      const serverBaseUrl = getLocalStorage(storageJellyServerKey);
      const userId = getLocalStorage(storageJellyUserKey);
      const endpoint = endpointConfig.user.getUserInfo(serverBaseUrl, userId);
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(jellyTranspose.transposeUserData(response, serverBaseUrl, accessToken, userId));
        })
        .catch((error) => {
          if (error?.code !== 'ERR_NETWORK') {
            logout();
          }
          reject({
            code: 'jellyfin.getUserInfo.1',
            message: 'Failed to get user info: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getUserInfo.2',
        message: 'Failed to get user info: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL SERVERS
// ======================================================================

export const getAllServers = ({ serverBaseUrl }) => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.server.getAllServers(serverBaseUrl);
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(jellyTranspose.transposeServerData(response, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllServers.1',
            message: 'Failed to get all servers: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllServers.2',
        message: 'Failed to get all servers: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL LIBRARIES
// ======================================================================

export const getAllLibraries = ({ accessToken, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.library.getAllLibraries(serverBaseUrl, userId);
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(jellyTranspose.transposeLibraryArray(response));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllLibraries.1',
            message: 'Failed to get all libraries: ' + error?.message,
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllLibraries.2',
        message: 'Failed to get all libraries: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

export const getAllArtists = ({ accessToken, genre, libraryId, serverBaseUrl, tag }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtists(serverBaseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            // IncludeItemTypes: 'MusicArtist',
            Recursive: true,
            Genres: genre || null,
            Tags: tag || null,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeArtistArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllArtists.1',
            message: 'Failed to get all artists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllArtists.2',
        message: 'Failed to get all artists: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ALBUM ARTISTS
// ======================================================================

export const getAllAlbumArtists = ({ accessToken, genre, libraryId, serverBaseUrl, tag }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllAlbumArtists(serverBaseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            // IncludeItemTypes: 'MusicArtist',
            Recursive: true,
            Genres: genre || null,
            Tags: tag || null,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArtistArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllAlbumArtists.1',
            message: 'Failed to get all album artists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllAlbumArtists.2',
        message: 'Failed to get all album artists: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ARTIST DETAILS
// ======================================================================

export const getArtistDetails = ({ accessToken, artistId, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(serverBaseUrl, userId, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            Fields: artistAndAlbumFields,
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeArtistDetails(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getArtistDetails.1',
            message: 'Failed to get artist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getArtistDetails.2',
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
      const endpoint = endpointConfig.artist.getAllArtistAlbums(serverBaseUrl, userId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            AlbumArtistIds: artistId,
            IncludeItemTypes: 'MusicAlbum',
            Recursive: true,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // Filters: 'IsNotFolder', // Helps filter out compilation albums
            // ExcludeLocationTypes: 'Virtual', // Excludes virtual items, often compilations
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllArtistAlbums.1',
            message: 'Failed to get all artist albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllArtistAlbums.2',
        message: 'Failed to get all artist albums: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ARTIST RELATED ALBUMS
// ======================================================================

/*
This is not required when using the Jellyfin API, but is here for compatibility with other services.
*/

export const getAllArtistRelatedAlbums = () => {
  return new Promise((resolve, reject) => {
    resolve([]);
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
      const endpoint = endpointConfig.artist.getAllArtistAppearanceAlbums(serverBaseUrl, userId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            ExcludeItemIds: artistId,
            ContributingArtistIds: artistId,
            IncludeItemTypes: 'MusicAlbum',
            Recursive: true,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // Filters: 'IsNotFolder', // Helps filter out compilation albums
            // ExcludeLocationTypes: 'Virtual', // Excludes virtual items, often compilations
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllArtistAppearanceAlbums.1',
            message: 'Failed to get all artist albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllArtistAppearanceAlbums.2',
        message: 'Failed to get all artist albums: ' + error?.message,
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
      const endpoint = endpointConfig.artist.getAllArtistTracks(serverBaseUrl, userId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            ArtistIds: artistId,
            IncludeItemTypes: 'Audio',
            Recursive: true,
            SortBy: 'Album,SortName',
            SortOrder: 'Ascending',
            Fields: trackFields,
            // Filters: 'IsNotFolder', // Helps filter out compilation albums
            // ExcludeLocationTypes: 'Virtual', // Excludes virtual items, often compilations
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeTrackArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jelly.getAllArtistTracks.1',
            message: 'Failed to get all artist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jelly.getAllArtistTracks.2',
        message: 'Failed to get all artist tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

export const getAllAlbums = ({ accessToken, genre, libraryId, serverBaseUrl, tag }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAllAlbums(serverBaseUrl);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: libraryId,
            IncludeItemTypes: 'MusicAlbum',
            Recursive: true,
            Genres: genre || null,
            Tags: tag || null,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllAlbums.1',
            message: 'Failed to get all albums: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllAlbums.2',
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
          params: {
            Fields: artistAndAlbumFields,
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumDetails(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAlbumDetails.1',
            message: 'Failed to get album details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAlbumDetails.2',
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
      const endpoint = endpointConfig.album.getAlbumTracks(serverBaseUrl, userId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            ParentId: albumId,
            IncludeItemTypes: 'Audio',
            SortBy: 'ParentIndexNumber,IndexNumber,SortName',
            SortOrder: 'Ascending',
            Fields: trackFields,
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeTrackArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAlbumTracks.1',
            message: 'Failed to get album tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAlbumTracks.2',
        message: 'Failed to get album tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET FOLDER ITEMS
// ======================================================================

/*
This is not required when using the Jellyfin API, but is here for compatibility with other services.
*/

export const getFolderItems = () => {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

export const getAllPlaylists = ({ accessToken, libraryId, serverBaseUrl, timeStamp, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getAllPlaylists(serverBaseUrl, userId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            IncludeItemTypes: 'Playlist',
            Recursive: true,
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields: artistAndAlbumFields,
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposePlaylistArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllPlaylists.1',
            message: 'Failed to get all playlists: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllPlaylists.2',
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
      const endpoint = endpointConfig.playlist.getPlaylistDetails(serverBaseUrl, userId, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
          params: {
            Fields: artistAndAlbumFields,
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposePlaylistDetails(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getPlaylistDetails.1',
            message: 'Failed to get playlist details: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getPlaylistDetails.2',
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
          signal: controller.signal,
          params: {
            Fields: trackFields,
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeTrackArray(response, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getPlaylistTracks.1',
            message: 'Failed to get playlist tracks: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getPlaylistTracks.2',
        message: 'Failed to get playlist tracks: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

/*
This is not required when using the Jellyfin API, but is here for compatibility with other services.
*/

export const getAllCollections = () => {
  return new Promise((resolve, reject) => {
    resolve({
      allArtistCollections: [],
      allAlbumCollections: [],
    });
  });
};

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

/*
This is not required when using the Jellyfin API, but is here for compatibility with other services.
*/

export const getCollectionItems = () => {
  return new Promise((resolve, reject) => {
    const error = new Error('Not found');
    error.status = 404;
    reject({
      code: 'jelly.getCollectionItems.1',
      message: 'Failed to get all collection items: ' + error?.message,
      error: error,
    });
  });
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

export const getAllTags = ({ accessToken, libraryId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.tags.getAllTags(serverBaseUrl);
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      abortControllers.push(controller1, controller2);

      // Request 1: Get artist filters
      const artistRequest = axios.get(endpoint, {
        headers: getRequestHeaders(accessToken),
        signal: controller1.signal,
        params: {
          UserId: userId,
          ParentId: libraryId,
          IncludeItemTypes: 'MusicArtist',
          // Recursive: true,
        },
      });

      // Request 2: Get album filters
      const albumRequest = axios.get(endpoint, {
        headers: getRequestHeaders(accessToken),
        signal: controller2.signal,
        params: {
          UserId: userId,
          ParentId: libraryId,
          IncludeItemTypes: 'MusicAlbum',
          // Recursive: true,
        },
      });

      Promise.all([artistRequest, albumRequest])
        .then(([artistResponse, albumResponse]) => {
          resolve({
            allArtistGenres: jellyTranspose.transposeTagArray(
              artistResponse?.data?.Genres,
              libraryId,
              'artist',
              'Genre'
            ),
            allAlbumGenres: jellyTranspose.transposeTagArray(albumResponse?.data?.Genres, libraryId, 'album', 'Genre'),
            allArtistTags: jellyTranspose.transposeTagArray(artistResponse?.data?.Tags, libraryId, 'artist', 'Tag'),
            allAlbumTags: jellyTranspose.transposeTagArray(albumResponse?.data?.Tags, libraryId, 'album', 'Tag'),
            allArtistStyles: [],
            allAlbumStyles: [],
            allArtistMoods: [],
            allAlbumMoods: [],
          });
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.getAllTags.1',
            message: 'Error getting tags: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller1 && ctrl !== controller2);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.getAllTags.2',
        message: 'Error getting tags: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// GET TAG ITEMS
// ======================================================================

export const getTagItems = ({ accessToken, libraryId, serverBaseUrl, tagId, typeKey }) => {
  if (typeKey === 'ArtistGenreItems') {
    return getAllArtists({
      accessToken: accessToken,
      libraryId: libraryId,
      serverBaseUrl: serverBaseUrl,
      genre: safeDecodeURIComponent(tagId),
    });
  } else if (typeKey === 'AlbumGenreItems') {
    return getAllAlbums({
      accessToken: accessToken,
      libraryId: libraryId,
      serverBaseUrl: serverBaseUrl,
      genre: safeDecodeURIComponent(tagId),
    });
  } else if (typeKey === 'ArtistTagItems') {
    return getAllArtists({
      accessToken: accessToken,
      libraryId: libraryId,
      serverBaseUrl: serverBaseUrl,
      tag: safeDecodeURIComponent(tagId),
    });
  } else if (typeKey === 'AlbumTagItems') {
    return getAllAlbums({
      accessToken: accessToken,
      libraryId: libraryId,
      serverBaseUrl: serverBaseUrl,
      tag: safeDecodeURIComponent(tagId),
    });
  } else {
    return new Promise((resolve, reject) => {
      const error = new Error('Not found');
      error.status = 404;
      reject({
        code: 'jelly.getTagItems.1',
        message: 'Failed to get all tag items: ' + error?.message,
        error: error,
      });
    });
  }
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
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      abortControllers.push(controller1, controller2);

      // Request 1: Search within library (artists, albums, tracks)
      const libraryRequest = axios.get(endpoint, {
        headers: getRequestHeaders(accessToken),
        signal: controller1.signal,
        params: {
          Fields: '',
          IncludeItemTypes: 'Audio,MusicAlbum,MusicArtist',
          Limit: limit,
          ParentId: libraryId,
          Recursive: true,
          SearchTerm: query,
          SortBy: 'SortName',
          SortOrder: 'Ascending',
          UserId: userId,
        },
      });

      // Request 2: Search for playlists (without ParentId)
      const playlistRequest = axios.get(endpoint, {
        headers: getRequestHeaders(accessToken),
        signal: controller2.signal,
        params: {
          Fields: '',
          IncludeItemTypes: 'Playlist',
          Limit: limit,
          Recursive: true,
          SearchTerm: query,
          SortBy: 'SortName',
          SortOrder: 'Ascending',
          UserId: userId,
        },
      });

      Promise.all([libraryRequest, playlistRequest])
        .then(([libraryResponse, playlistResponse]) => {
          const combinedResponse = {
            data: {
              Items: [...(libraryResponse.data?.Items || []), ...(playlistResponse.data?.Items || [])],
            },
          };
          resolve(jellyTranspose.transposeSearchResultsArray(combinedResponse, libraryId, serverBaseUrl, accessToken));
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.searchLibrary.1',
            message: 'Error searching library: ' + error?.message,
            error: error,
          });
        })
        .finally(() => {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller1 && ctrl !== controller2);
        });
    } catch (error) {
      reject({
        code: 'jellyfin.searchLibrary.2',
        message: 'Error searching library: ' + error?.message,
        error: error,
      });
    }
  });
};

// ======================================================================
// TOGGLE FAVOURITE
// ======================================================================

export const toggleFavourite = ({ accessToken, isFavourite, itemId, serverBaseUrl, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.favourite.toggleFavourite(serverBaseUrl, userId, itemId);
      const controller = new AbortController();
      abortControllers.push(controller);

      if (isFavourite) {
        axios
          .post(
            endpoint,
            {},
            {
              headers: getRequestHeaders(accessToken),
              signal: controller.signal,
            }
          )
          .then((response) => {
            resolve();
          })
          .catch((error) => {
            reject({
              code: 'jellyfin.toggleFavourite.1',
              message: 'Failed to toggle favourite: ' + error?.message,
              error: error,
            });
          })
          .finally(() => {
            abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
          });
      } else {
        axios
          .delete(endpoint, {
            headers: getRequestHeaders(accessToken),
            signal: controller.signal,
          })
          .then((response) => {
            resolve();
          })
          .catch((error) => {
            reject({
              code: 'jellyfin.toggleFavourite.2',
              message: 'Failed to toggle favourite: ' + error?.message,
              error: error,
            });
          })
          .finally(() => {
            abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
          });
      }
    } catch (error) {
      reject({
        code: 'jellyfin.toggleFavourite.3',
        message: 'Failed to toggle favourite: ' + error?.message,
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
  if (state === 'start') {
    return logPlaybackStart({ accessToken, currentTime, itemId, serverBaseUrl, sessionId, userId });
  } else if (state === 'playing') {
    return logPlaybackProgress({ accessToken, currentTime, isPaused: false, itemId, serverBaseUrl, sessionId, userId });
  } else if (state === 'paused') {
    return logPlaybackProgress({ accessToken, currentTime, isPaused: true, itemId, serverBaseUrl, sessionId, userId });
  } else if (state === 'stopped') {
    return logPlaybackStopped({ accessToken, currentTime, itemId, serverBaseUrl, userId });
  }
};

const logPlaybackStart = ({ accessToken, currentTime, itemId, serverBaseUrl, sessionId, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.status.logPlaybackStart(serverBaseUrl);

      axios
        .post(
          endpoint,
          {
            CanSeek: true,
            ItemId: itemId,
            MediaSourceId: itemId,
            PlayMethod: 'DirectPlay',
            PlaySessionId: sessionId,
            PositionTicks: currentTime * 10000,
            UserId: userId,
          },
          {
            headers: getRequestHeaders(accessToken),
          }
        )
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.logPlaybackStart.1',
            message: 'Failed to log playback start',
            error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.logPlaybackStart.2',
        message: 'Failed to log playback start',
        error,
      });
    }
  });
};

const logPlaybackProgress = ({ accessToken, currentTime, isPaused, itemId, serverBaseUrl, sessionId, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.status.logPlaybackProgress(serverBaseUrl);

      axios
        .post(
          endpoint,
          {
            IsPaused: isPaused,
            ItemId: itemId,
            PlayMethod: 'DirectPlay',
            PlaySessionId: sessionId,
            PositionTicks: currentTime * 10000,
            UserId: userId,
          },
          {
            headers: getRequestHeaders(accessToken),
          }
        )
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.logPlaybackProgress.1',
            message: 'Failed to log playback progress',
            error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.logPlaybackProgress.2',
        message: 'Failed to log playback progress',
        error,
      });
    }
  });
};

const logPlaybackStopped = ({ accessToken, currentTime, itemId, serverBaseUrl, sessionId, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.status.logPlaybackStopped(serverBaseUrl);

      axios
        .post(
          endpoint,
          {
            ItemId: itemId,
            PlayMethod: 'DirectPlay',
            PlaySessionId: sessionId,
            PositionTicks: currentTime * 10000,
            UserId: userId,
          },
          {
            headers: getRequestHeaders(accessToken),
          }
        )
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.logPlaybackStopped.1',
            message: 'Failed to log playback stopped',
            error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.logPlaybackStopped.2',
        message: 'Failed to log playback stopped',
        error,
      });
    }
  });
};

// The below variation is used on window unload in order to log playback as stopped.
// The fetch method is used instead of axios, with keepalive set to true.
// This is because axios does not support keepalive, and fetch with keepalive
// will allow the request to complete even if the page is closed.

export const logPlaybackQuit = ({ accessToken, currentTime, itemId, serverBaseUrl, sessionId, userId }) => {
  try {
    const endpoint = endpointConfig.status.logPlaybackStopped(serverBaseUrl);

    fetch(endpoint, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        ...getRequestHeaders(accessToken),
      },
      body: JSON.stringify({
        ItemId: itemId,
        PlayMethod: 'DirectPlay',
        PlaySessionId: sessionId,
        PositionTicks: currentTime * 10000,
        UserId: userId,
      }),
    });
  } catch (error) {
    // do nothing
  }
};
