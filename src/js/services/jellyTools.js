// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';

import config from 'js/_config/config';
import { getLocalStorage, setLocalStorage } from 'js/utils';
import * as jellyTranspose from 'js/services/jellyTranspose';

// ======================================================================
// OPTIONS
// ======================================================================

const appName = 'Chromatix';
const deviceName = 'Chromatix';
const deviceId = 'Chromatix';
const appVersion = '1.0.0';

const storageJellyServerKey = config.storageJellyServerKey;
const storageJellyUserKey = config.storageJellyUserKey;
const storageServiceKey = config.storageServiceKey;
const storageTokenKey = config.storageTokenKey;

// ======================================================================
// ENDPOINTS
// ======================================================================

const endpointConfig = {
  auth: {
    login: (baseUrl) => `${baseUrl}/Users/AuthenticateByName`,
  },
  user: {
    getUserInfo: (baseUrl, userId) => `${baseUrl}/Users/${userId}`,
  },
  server: {
    getAllServers: (baseUrl) => `${baseUrl}/System/Info`,
  },
  library: {
    getAllLibraries: (baseUrl, userId) => `${baseUrl}/Users/${userId}/Views`,
  },
  search: {
    searchLibrary: null,
  },
  artist: {
    getAllArtists: (baseUrl) => `${baseUrl}/Artists`,
    getArtistDetails: (baseUrl, userId, artistId) => `${baseUrl}/Users/${userId}/Items/${artistId}`,
    getAllArtistAlbums: (baseUrl, userId) => `${baseUrl}/Users/${userId}/Items`,
    // getAllArtistRelatedAlbums: null,
    getAllArtistAppearanceAlbums: (baseUrl, userId) => `${baseUrl}/Users/${userId}/Items`,
    getAllArtistTracks: null,
  },
  album: {
    getAllAlbums: (baseUrl) => `${baseUrl}/Items`,
    getAlbumDetails: (baseUrl, albumId) => `${baseUrl}/Items/${albumId}`,
    getAlbumTracks: (baseUrl, userId) => `${baseUrl}/Users/${userId}/Items`,
  },
  folder: {
    getFolderItems: null,
  },
  playlist: {
    getAllPlaylists: (baseUrl, userId) => `${baseUrl}/Users/${userId}/Items`,
    getPlaylistDetails: (baseUrl, userId, playlistId) => `${baseUrl}/Users/${userId}/Items/${playlistId}`,
    getPlaylistTracks: (baseUrl, playlistId) => `${baseUrl}/Playlists/${playlistId}/Items`,
  },
  collection: {
    getAllCollections: null,
    getCollectionItems: null,
  },
  tags: {
    getAllArtistGenres: null,
    getAllArtistMoods: null,
    getAllArtistStyles: null,

    getAllAlbumGenres: null,
    getAllAlbumMoods: null,
    getAllAlbumStyles: null,

    getArtistGenreItems: null,
    getArtistMoodItems: null,
    getArtistStyleItems: null,

    getAlbumGenreItems: null,
    getAlbumMoodItems: null,
    getAlbumStyleItems: null,
  },
  rating: {
    setStarRating: null,
  },
  status: {
    logPlaybackStatus: null,
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
    'X-Emby-Client': appName,
    'X-Emby-Device': deviceName,
    'X-Emby-Device-Id': deviceId,
    'X-Emby-Client-Version': appVersion,
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
      const endpoint = endpointConfig.auth.login(server);
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
              'X-Emby-Authorization': `MediaBrowser Client="${appName}", Device="${deviceName}", DeviceId="${deviceId}", Version="${appVersion}"`,
            },
          }
        )
        .then((response) => {
          const accessToken = response?.data?.AccessToken;
          const userId = response?.data?.User?.Id;
          if (accessToken && userId) {
            setLocalStorage(storageJellyServerKey, server);
            setLocalStorage(storageJellyUserKey, userId);
            setLocalStorage(storageServiceKey, 'jellyfin');
            setLocalStorage(storageTokenKey, accessToken);
            resolve();
          }
        })
        .catch((error) => {
          reject({
            code: 'jellyfin.login.1',
            message: 'Failed to generate PIN',
            error: error,
          });
        });
    } catch (error) {
      reject({
        code: 'jellyfin.login.2',
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
      const baseUrl = getLocalStorage(storageJellyServerKey);
      const userId = getLocalStorage(storageJellyUserKey);
      const endpoint = endpointConfig.user.getUserInfo(baseUrl, userId);
      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
        })
        .then((response) => {
          resolve(jellyTranspose.transposeUserData(response, baseUrl, accessToken, userId));
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

export const getAllServers = (baseUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = getLocalStorage(storageTokenKey);
      const endpoint = endpointConfig.server.getAllServers(baseUrl);
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

export const getAllLibraries = (baseUrl, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.library.getAllLibraries(baseUrl, userId);
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

export const getAllArtists = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtists(baseUrl);
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
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields:
              'CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,ProductionLocations,Tags,UserData',
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeArtistArray(response, libraryId, baseUrl, accessToken));
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
// GET ARTIST DETAILS
// ======================================================================

export const getArtistDetails = (baseUrl, libraryId, artistId, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getArtistDetails(baseUrl, userId, artistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(jellyTranspose.transposeArtistDetails(response, libraryId, baseUrl, accessToken));
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

export const getAllArtistAlbums = (baseUrl, libraryId, artistId, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAlbums(baseUrl, userId);
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
            // Filters: 'IsNotFolder', // Helps filter out compilation albums
            // ExcludeLocationTypes: 'Virtual', // Excludes virtual items, often compilations
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, baseUrl, accessToken));
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
This does not exist in the Jellyfin API, but is here for consistency with other services.
*/

export const getAllArtistRelatedAlbums = () => {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
};

// ======================================================================
// GET ALL ARTIST APPEARANCES
// ======================================================================

export const getAllArtistAppearanceAlbums = (baseUrl, libraryId, artistName, store, accessToken, artistId, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.artist.getAllArtistAppearanceAlbums(baseUrl, userId);
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
            // Filters: 'IsNotFolder', // Helps filter out compilation albums
            // ExcludeLocationTypes: 'Virtual', // Excludes virtual items, often compilations
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, baseUrl, accessToken));
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

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

export const getAllAlbums = (baseUrl, libraryId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAllAlbums(baseUrl);
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
            SortBy: 'SortName',
            SortOrder: 'Ascending',
            Fields:
              'CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,ProductionLocations,Tags,UserData',
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeAlbumArray(response, libraryId, baseUrl, accessToken));
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
          resolve(jellyTranspose.transposeAlbumDetails(response, libraryId, baseUrl, accessToken));
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

export const getAlbumTracks = (baseUrl, libraryId, albumId, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.album.getAlbumTracks(baseUrl, userId);
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
            Fields:
              'CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,ProductionLocations,Tags,UserData',
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
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

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

export const getAllPlaylists = (baseUrl, libraryId, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getAllPlaylists(baseUrl, userId);
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
            Fields:
              'CustomRating,DateCreated,DateLastMediaAdded,DateLastRefreshed,DateLastSaved,Genres,ProductionLocations,Tags,UserData',
            // StartIndex: 0,
            // Limit: 100
          },
        })
        .then((response) => {
          resolve(jellyTranspose.transposePlaylistArray(response, libraryId, baseUrl, accessToken));
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

export const getPlaylistDetails = (baseUrl, libraryId, playlistId, accessToken, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistDetails(baseUrl, userId, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(jellyTranspose.transposePlaylistDetails(response, libraryId, baseUrl, accessToken));
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

export const getPlaylistTracks = (baseUrl, libraryId, playlistId, accessToken) => {
  return new Promise((resolve, reject) => {
    try {
      const endpoint = endpointConfig.playlist.getPlaylistTracks(baseUrl, playlistId);
      const controller = new AbortController();
      abortControllers.push(controller);

      axios
        .get(endpoint, {
          headers: getRequestHeaders(accessToken),
          signal: controller.signal,
        })
        .then((response) => {
          resolve(jellyTranspose.transposeTrackArray(response, libraryId, baseUrl, accessToken));
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

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

// ======================================================================
// GET ALL TAGS
// ======================================================================

// ======================================================================
// GET TAG ITEMS
// ======================================================================

// ======================================================================
// SEARCH
// ======================================================================

// ======================================================================
// SET STAR RATING
// ======================================================================

// ======================================================================
// LOG PLAYBACK STATUS
// ======================================================================
