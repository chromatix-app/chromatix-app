// ======================================================================
// IMPORTS
// ======================================================================

import * as jellyTools from 'js/services/jellyTools';
import * as plexTools from 'js/services/plexTools';
import { analyticsEvent, getLocalStorage } from 'js/utils';
import config from 'js/_config/config';
import store from 'js/store/store';

// ======================================================================
// OPTIONS
// ======================================================================

const serviceTools = {
  jellyfin: jellyTools,
  plex: plexTools,
};

const storageServiceKey = config.storageServiceKey;
const storageTokenKey = config.storageTokenKey;

// [NOTE] this is a temporary flag just in case this change
// causes any issues and needs to be reverted
const refetchData = true;

// ======================================================================
// ABORT HANDLING
// ======================================================================

export const abortAllRequests = () => {
  for (const i in collectionItemsTimeouts) {
    clearTimeout(collectionItemsTimeouts[i]);
  }
  for (const i in tagItemsTimeouts) {
    clearTimeout(tagItemsTimeouts[i]);
  }
  jellyTools.abortAllRequests();
  plexTools.abortAllRequests();
};

// ======================================================================
// INIT - CHECKS IF AN AUTH TOKEN EXISTS
// ======================================================================

export const init = () => {
  console.log('%c--- bridge - init ---', 'color:#f9743b;');
  plexTools
    // Check for a Plex login PIN
    .checkPinStatus()
    // Check if the user is (theoretically) logged in
    .then((_response) => {
      return checkIfLoggedIn();
    })
    // Attempt to fetch the logged in user's info
    .then((response) => {
      getUserInfo(response.service);
    })
    .catch((error) => {
      store.dispatch.appModel.setLoggedOut();
      if (error?.code) {
        if (
          ![
            'bridge.checkIfLoggedIn.1',
            // 'plex.checkPinStatus.1'
          ].includes(error.code)
        ) {
          console.error(error);
          analyticsEvent('Error / Init / ' + error.code);
        }
      } else {
        console.error(error);
        analyticsEvent('Error / Init / Unknown Error');
      }
    });
};

const checkIfLoggedIn = () => {
  console.log('%c--- bridge - checkIfLoggedIn ---', 'color:#f9743b;');
  return new Promise((resolve, reject) => {
    const accessToken = getLocalStorage(storageTokenKey);
    if (accessToken) {
      let service = getLocalStorage(storageServiceKey);
      // [NOTE] this is here for backwards compatibility
      if (!service) {
        service = 'plex';
      }
      analyticsEvent(toUpperFirst(service) + ' / Logged In');
      resolve({ service });
    } else {
      reject({
        code: 'bridge.checkIfLoggedIn.1',
        message: 'No auth token found',
        error: null,
      });
    }
  });
};

// ======================================================================
// LOGIN - JELLYFIN
// ======================================================================

/*
[NOTE]
Jellyfin login is API based and does not redirect you away.
*/

export const jellyLogin = (values) => {
  console.log('%c--- bridge - jellyLogin ---', 'color:#f9743b;');
  return new Promise((resolve, reject) => {
    jellyTools
      .login(values)
      .then((_response) => {
        analyticsEvent('Jellyfin / Logged In');
        getUserInfo('jellyfin');
      })
      .catch((error) => {
        console.error(error);
        analyticsEvent('Jellyfin / Error / Login');
        reject(error);
      });
  });
};

// ======================================================================
// LOGIN - PLEX
// ======================================================================

/*
[NOTE]
Plex login actually redirects you away to a Plex login page on their site.
On return, a Plex PIN is verified in the init function, and then user data is fetched.
*/

export const plexLogin = () => {
  console.log('%c--- bridge - plexLogin ---', 'color:#f9743b;');
  plexTools
    .login()
    .then((_response) => {
      // [NOTE] this isn't normally reached as Plex login redirects you away
      analyticsEvent('Plex / Logged In');
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.setAppState({ errorLogin: true });
      analyticsEvent('Plex / Error / Login');
    });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  console.log('%c--- bridge - logout ---', 'color:#f9743b;');
  const currentService = store.getState().appModel.currentService;
  jellyTools.logout();
  plexTools.logout();
  store.dispatch.appModel.setLoggedOut();
  analyticsEvent(toUpperFirst(currentService) + ' / Logout');
};

// ======================================================================
// GET USER INFO
// ======================================================================

export const getUserInfo = (service) => {
  console.log('%c--- bridge - getUserInfo ---', 'color:#f9743b;');
  serviceTools[service]
    .getUserInfo()
    .then((response) => {
      store.dispatch.appModel.setLoggedIn({
        currentService: service,
        currentUser: response,
      });
    })
    .catch((error) => {
      console.error(error);
      logout();
      // store.dispatch.appModel.setAppState({ errorUser: true });
      analyticsEvent(toUpperFirst(service) + ' / Error / Get User Info');
    });
};

// ======================================================================
// GET ALL SERVERS
// ======================================================================

let getUserServersRunning;

export const getAllServers = () => {
  if (!getUserServersRunning) {
    const prevAllResources = store.getState().appModel.allServers;
    if (!prevAllResources) {
      console.log('%c--- bridge - getAllServers ---', 'color:#f9743b;');
      getUserServersRunning = true;

      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = currentService === 'jellyfin' ? store.getState().appModel.currentUser.serverBaseUrl : null;

      serviceTools[currentService]
        .getAllServers({
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeAllServers(response);
        })
        .catch((error) => {
          console.error(error);
          store.dispatch.appModel.setAppState({ errorServers: true });
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Servers');
        })
        .finally(() => {
          getUserServersRunning = false;
        });
    }
  }
};

// ======================================================================
// GET FASTEST SERVER CONNECTION
// ======================================================================

const getFastestConnection = async (currentServer, currentService, currentUser) => {
  let serverBaseUrl;
  try {
    if (currentUser?.serverBaseUrl) {
      serverBaseUrl = currentUser.serverBaseUrl;
      store.dispatch.appModel.setAppState({ serverBaseUrl });
    } else {
      await plexTools.getFastestConnection({ server: currentServer }).then((response) => {
        serverBaseUrl = response;
        store.dispatch.appModel.setAppState({ serverBaseUrl });
      });
    }
  } catch (error) {
    console.error(error);
    store.dispatch.appModel.setAppState({ errorFastestConnection: true });
    analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Fastest Server Connection');
    throw error;
  }
  return serverBaseUrl;
};

// ======================================================================
// GET ALL LIBRARIES
// ======================================================================

let getUserLibrariesRunning;

export const getAllLibraries = async () => {
  if (!getUserLibrariesRunning) {
    const prevAllLibraries = store.getState().appModel.allLibraries;
    if (!prevAllLibraries) {
      const currentServer = store.getState().sessionModel.currentServer;
      if (currentServer) {
        console.log('%c--- bridge - getAllLibraries ---', 'color:#f9743b;');
        getUserLibrariesRunning = true;

        const currentService = store.getState().appModel.currentService;
        const currentUser = currentService === 'jellyfin' ? store.getState().appModel.currentUser : null;

        // before getting libraries, get the fastest server connection
        let serverBaseUrl;
        try {
          serverBaseUrl = await getFastestConnection(currentServer, currentService, currentUser);
        } catch (error) {
          getUserLibrariesRunning = false;
          return;
        }

        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const userId = currentUser?.userId;

        serviceTools[currentService]
          .getAllLibraries({
            accessToken,
            serverBaseUrl,
            userId,
          })
          .then((response) => {
            store.dispatch.sessionModel.refreshCurrentLibrary(response);
            store.dispatch.appModel.setAppState({ allLibraries: response });
          })
          .catch((error) => {
            console.error(error);
            store.dispatch.appModel.setAppState({ errorLibraries: true });
            analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Libraries');
          })
          .finally(() => {
            getUserLibrariesRunning = false;
          });
      }
    }
  }
};

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

let getAllArtistsRunning;

export const getAllArtists = () => {
  if (!getAllArtistsRunning) {
    const haveGotAllArtists = store.getState().appModel.haveGotAllArtists;
    if (refetchData || !haveGotAllArtists) {
      console.log('%c--- bridge - getAllArtists ---', 'color:#f9743b;');
      getAllArtistsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllArtists({
          accessToken,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({
            haveGotAllArtists: true,
            allArtists: response,
          });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Artists');
        })
        .finally(() => {
          getAllArtistsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ALL ALBUM ARTISTS
// ======================================================================

let getAllAlbumArtistsRunning;

export const getAllAlbumArtists = () => {
  if (!getAllAlbumArtistsRunning) {
    const haveGotAllAlbumArtists = store.getState().appModel.haveGotAllAlbumArtists;
    if (refetchData || !haveGotAllAlbumArtists) {
      console.log('%c--- bridge - getAllAlbumArtists ---', 'color:#f9743b;');
      getAllAlbumArtistsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllAlbumArtists({
          accessToken,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({
            haveGotAllAlbumArtists: true,
            allAlbumArtists: response,
          });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Album Artists');
        })
        .finally(() => {
          getAllAlbumArtistsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST DETAILS
// ======================================================================

let getArtistDetailsRunning;

export const getArtistDetails = (libraryId, artistId) => {
  if (!getArtistDetailsRunning) {
    const prevArtistDetails = store.getState().appModel.allArtists?.find((artist) => artist.artistId === artistId);
    if (refetchData || !prevArtistDetails) {
      console.log('%c--- bridge - getArtistDetails ---', 'color:#f9743b;');
      getArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getArtistDetails({
          accessToken,
          artistId,
          libraryId,
          serverBaseUrl,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistDetails(response);
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel.storeArtist404({ artistId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Details');
        })
        .finally(() => {
          getArtistDetailsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ALBUM ARTIST DETAILS
// ======================================================================

let getAlbumArtistDetailsRunning;

export const getAlbumArtistDetails = (libraryId, artistId) => {
  if (!getAlbumArtistDetailsRunning) {
    const prevAlbumArtistDetails = store
      .getState()
      .appModel.allAlbumArtists?.find((artist) => artist.artistId === artistId);
    if (refetchData || !prevAlbumArtistDetails) {
      console.log('%c--- bridge - getAlbumArtistDetails ---', 'color:#f9743b;');
      getAlbumArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getArtistDetails({
          accessToken,
          artistId,
          libraryId,
          serverBaseUrl,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeAlbumArtistDetails(response);
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel.storeAlbumArtist404({ artistId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Album Artist Details');
        })
        .finally(() => {
          getAlbumArtistDetailsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST ALBUMS
// ======================================================================

let getAllArtistAlbumsRunning;

export const getAllArtistAlbums = (libraryId, artistId) => {
  if (!getAllArtistAlbumsRunning) {
    const prevAllAlbums = store.getState().appModel.allArtistAlbums[libraryId + '-' + artistId];
    if (refetchData || !prevAllAlbums) {
      console.log('%c--- bridge - getAllArtistAlbums ---', 'color:#f9743b;');
      getAllArtistAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getAllArtistAlbums({
          accessToken,
          artistId,
          libraryId,
          serverBaseUrl,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistAlbums({ libraryId, artistId, artistAlbums: response });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Albums');
        })
        .finally(() => {
          getAllArtistAlbumsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST RELATED ALBUMS
// ======================================================================

let getAllArtistRelatedAlbumsRunning;

export const getAllArtistRelatedAlbums = (libraryId, artistId) => {
  if (!getAllArtistRelatedAlbumsRunning) {
    const prevAllRelated = store.getState().appModel.allArtistRelatedAlbums[libraryId + '-' + artistId];
    if (refetchData || !prevAllRelated) {
      console.log('%c--- bridge - getAllArtistRelatedAlbums ---', 'color:#f9743b;');
      getAllArtistRelatedAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getAllArtistRelatedAlbums({
          accessToken,
          artistId,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated: response });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Related Albums');
        })
        .finally(() => {
          getAllArtistRelatedAlbumsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST APPEARANCE ALBUMS
// ======================================================================

let getAllArtistAppearanceAlbumsRunning;

export const getAllArtistAppearanceAlbums = (libraryId, artistId, artistName) => {
  if (!getAllArtistAppearanceAlbumsRunning) {
    const prevAllAppearanceAlbums = store.getState().appModel.allArtistAppearanceAlbums[libraryId + '-' + artistId];
    if (refetchData || !prevAllAppearanceAlbums) {
      console.log('%c--- bridge - getAllArtistAppearanceAlbums ---', 'color:#f9743b;');
      getAllArtistAppearanceAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getAllArtistAppearanceAlbums({
          accessToken,
          artistId,
          artistName,
          libraryId,
          serverBaseUrl,
          store,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistAppearanceAlbums({
            libraryId,
            artistId,
            artistAppearanceAlbums: response,
          });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Appearance Albums');
        })
        .finally(() => {
          getAllArtistAppearanceAlbumsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST TRACKS
// ======================================================================

let getAllArtistTracksRunning;

export const getAllArtistTracks = (libraryId, artistId, artistName) => {
  if (!getAllArtistTracksRunning) {
    const prevArtistTracks = store.getState().appModel.allArtistTracks[libraryId + '-' + artistId];
    if (refetchData || !prevArtistTracks) {
      console.log('%c--- bridge - getAllArtistTracks ---', 'color:#f9743b;');
      getAllArtistTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getAllArtistTracks({
          accessToken,
          artistId,
          artistName,
          libraryId,
          serverBaseUrl,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistTracks({
            libraryId,
            artistId,
            artistTracks: response,
          });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Tracks');
        })
        .finally(() => {
          getAllArtistTracksRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

let getAllAlbumsRunning;

export const getAllAlbums = () => {
  if (!getAllAlbumsRunning) {
    const haveGotAllAlbums = store.getState().appModel.haveGotAllAlbums;
    if (refetchData || !haveGotAllAlbums) {
      console.log('%c--- bridge - getAllAlbums ---', 'color:#f9743b;');
      getAllAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllAlbums({
          accessToken,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({
            haveGotAllAlbums: true,
            allAlbums: response,
          });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Albums');
        })
        .finally(() => {
          getAllAlbumsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ALBUM DETAILS
// ======================================================================

let getAlbumDetailsRunning;

export const getAlbumDetails = (libraryId, albumId, callback) => {
  if (!getAlbumDetailsRunning) {
    const prevAlbumDetails = store.getState().appModel.allAlbums?.find((album) => album.albumId === albumId);
    if (refetchData || !prevAlbumDetails) {
      console.log('%c--- bridge - getAlbumDetails ---', 'color:#f9743b;');
      getAlbumDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getAlbumDetails({
          accessToken,
          albumId,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeAlbumDetails(response);
          if (callback) {
            callback();
          }
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel.storeAlbum404({ albumId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Album Details');
        })
        .finally(() => {
          getAlbumDetailsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ALBUM TRACKS
// ======================================================================

let getAlbumTracksRunning;

export const getAlbumTracks = (libraryId, albumId) => {
  return new Promise((resolve, reject) => {
    if (!getAlbumTracksRunning) {
      const prevAlbumTracks = store.getState().appModel.allAlbumTracks[libraryId + '-' + albumId];
      if (refetchData || !prevAlbumTracks) {
        console.log('%c--- bridge - getAlbumTracks ---', 'color:#f9743b;');
        getAlbumTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const currentService = store.getState().appModel.currentService;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;
        const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

        serviceTools[currentService]
          .getAlbumTracks({
            accessToken,
            albumId,
            libraryId,
            serverBaseUrl,
            userId,
          })
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storeAlbumTracks({ libraryId, albumId, albumTracks: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
            analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Album Tracks');
            reject(error);
          })
          .finally(() => {
            getAlbumTracksRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
};

// ======================================================================
// GET FOLDER ITEMS
// ======================================================================

let getFolderItemsRunning;

export const getFolderItems = (folderId) => {
  return new Promise((resolve, reject) => {
    if (!getFolderItemsRunning) {
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const prevFolderItems = store.getState().appModel.allFolderItems[libraryId + '-' + folderId];
      if (refetchData || !prevFolderItems) {
        console.log('%c--- bridge - getFolderItems ---', 'color:#f9743b;');
        getFolderItemsRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const currentService = store.getState().appModel.currentService;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;

        serviceTools[currentService]
          .getFolderItems({
            accessToken,
            folderId,
            libraryId,
            serverBaseUrl,
          })
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storeFolderItems({ libraryId, folderId, folderItems: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
            if (error?.error?.status === 400 || error?.error?.status === 404) {
              store.dispatch.appModel.storeFolder404({ libraryId, folderId });
            }
            analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Folder Items');
            reject(error);
          })
          .finally(() => {
            getFolderItemsRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

let getAllPlaylistsRunning;

export const getAllPlaylists = () => {
  if (!getAllPlaylistsRunning) {
    const prevAllPlaylists = store.getState().appModel.allPlaylists;
    if (refetchData || !prevAllPlaylists) {
      console.log('%c--- bridge - getAllPlaylists ---', 'color:#f9743b;');
      getAllPlaylistsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const timeStamp = store.getState().appModel.timeStamp;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllPlaylists({
          accessToken,
          libraryId,
          serverBaseUrl,
          timeStamp,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({ allPlaylists: response });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Playlists');
        })
        .finally(() => {
          getAllPlaylistsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET PLAYLIST DETAILS
// ======================================================================

let getPlaylistDetailsRunning;

export const getPlaylistDetails = (libraryId, playlistId) => {
  if (!getPlaylistDetailsRunning) {
    const prevPlaylistDetails = store
      .getState()
      .appModel.allPlaylists?.find((playlist) => playlist.playlistId === playlistId);
    if (refetchData || !prevPlaylistDetails) {
      console.log('%c--- bridge - getPlaylistDetails ---', 'color:#f9743b;');
      getPlaylistDetailsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const timeStamp = store.getState().appModel.timeStamp;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getPlaylistDetails({
          accessToken,
          libraryId,
          playlistId,
          serverBaseUrl,
          timeStamp,
          userId,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storePlaylistDetails(response);
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel.storePlaylist404({ playlistId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Playlist Details');
        })
        .finally(() => {
          getPlaylistDetailsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET PLAYLIST TRACKS
// ======================================================================

let getPlaylistTracksRunning;

export const getPlaylistTracks = (libraryId, playlistId) => {
  return new Promise((resolve, reject) => {
    if (!getPlaylistTracksRunning) {
      const prevPlaylistTracks = store.getState().appModel.allPlaylistTracks[libraryId + '-' + playlistId];
      if (refetchData || !prevPlaylistTracks) {
        console.log('%c--- bridge - getPlaylistTracks ---', 'color:#f9743b;');
        getPlaylistTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const currentService = store.getState().appModel.currentService;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;

        serviceTools[currentService]
          .getPlaylistTracks({
            accessToken,
            libraryId,
            playlistId,
            serverBaseUrl,
          })
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storePlaylistTracks({ libraryId, playlistId, playlistTracks: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
            analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Playlist Tracks');
            reject(error);
          })
          .finally(() => {
            getPlaylistTracksRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

let getAllCollectionsRunning;

export const getAllCollections = () => {
  if (!getAllCollectionsRunning) {
    const prevAllArtistCollections = store.getState().appModel.allArtistCollections;
    const prevAllAlbumCollections = store.getState().appModel.allAlbumCollections;
    if (refetchData || !prevAllArtistCollections || !prevAllAlbumCollections) {
      console.log('%c--- bridge - getAllCollections ---', 'color:#f9743b;');
      getAllCollectionsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllCollections({
          accessToken,
          libraryId,
          serverBaseUrl,
        })
        .then((response) => {
          // console.log(response);
          // allArtistCollections
          // allAlbumCollections
          store.dispatch.appModel.setAppState(response);
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get All Collections');
        })
        .finally(() => {
          getAllCollectionsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

let getCollectionItemsRunning = {
  Artist: false,
  Album: false,
};

let collectionItemsTimeouts = [];

export const getCollectionItems = (libraryId, collectionId, typeKey) => {
  // Ensure that collection items are not fetched before parent collection arrays are fetched
  if (getAllCollectionsRunning) {
    collectionItemsTimeouts.push(
      setTimeout(() => {
        getCollectionItems(libraryId, collectionId, typeKey);
      }, 25)
    );
    return;
  }

  if (!getCollectionItemsRunning[typeKey]) {
    const prevCollectionItems =
      store.getState().appModel[`all${typeKey}CollectionItems`][libraryId + '-' + collectionId];
    if (refetchData || !prevCollectionItems) {
      console.log('%c--- bridge - getCollectionItems - ' + typeKey + ' ---', 'color:#f9743b;');
      getCollectionItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getCollectionItems({
          accessToken,
          collectionId,
          libraryId,
          serverBaseUrl,
          typeKey,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel[`store${typeKey}CollectionItems`]({
            libraryId,
            collectionId,
            collectionItems: response,
          });
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel[`store${typeKey}Collection404`]({ collectionId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Collection Items');
        })
        .finally(() => {
          getCollectionItemsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// GET ALL TAGS
// ======================================================================

export const getAllTags = (typeKey) => {
  const currentService = store.getState().appModel.currentService;
  if (currentService === 'plex') {
    getAllPlexTags(typeKey);
  } else if (currentService === 'jellyfin') {
    getAllJellyfinTags();
  }
};

let getAllTagsRunning = {
  AlbumGenres: false,
  AlbumMoods: false,
  AlbumStyles: false,
  AlbumTags: false,
  ArtistGenres: false,
  ArtistMoods: false,
  ArtistStyles: false,
  ArtistTags: false,
};

const getAllPlexTags = (typeKey) => {
  if (!getAllTagsRunning[typeKey]) {
    const prevAllTags = store.getState().appModel[`all${typeKey}`];
    if (refetchData || !prevAllTags) {
      console.log('%c--- bridge - getAllTags - ' + typeKey + ' ---', 'color:#f9743b;');
      getAllTagsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllTags({
          accessToken,
          libraryId,
          serverBaseUrl,
          typeKey,
        })
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({ [`all${typeKey}`]: response });
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent('Plex / Error / Get All Tags');
        })
        .finally(() => {
          getAllTagsRunning[typeKey] = false;
        });
    }
  }
};

let getAllJellyfinTagsRunning;

const getAllJellyfinTags = () => {
  if (!getAllJellyfinTagsRunning) {
    const prevAllArtistGenres = store.getState().appModel.allArtistGenres;
    const prevAllAlbumGenres = store.getState().appModel.allAlbumGenres;
    const prevAllArtistTags = store.getState().appModel.allArtistTags;
    const prevAllAlbumTags = store.getState().appModel.allAlbumTags;
    if (refetchData || !prevAllArtistGenres || !prevAllAlbumGenres || !prevAllArtistTags || !prevAllAlbumTags) {
      console.log('%c--- bridge - getAllJellyfinTags ---', 'color:#f9743b;');
      getAllJellyfinTagsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = store.getState().appModel.currentUser.userId;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      jellyTools
        .getAllTags({
          accessToken,
          libraryId,
          serverBaseUrl,
          userId,
        })
        .then((response) => {
          store.dispatch.appModel.setAppState(response);
        })
        .catch((error) => {
          console.error(error);
          analyticsEvent('Jellyfin / Error / Get All Tags');
        })
        .finally(() => {
          getAllJellyfinTagsRunning = false;
        });
    }
  }
};

// ======================================================================
// GET TAG ITEMS
// ======================================================================

let getTagItemsRunning = {
  AlbumGenreItems: false,
  AlbumMoodItems: false,
  AlbumStyleItems: false,
  AlbumTagItems: false,
  ArtistGenreItems: false,
  ArtistMoodItems: false,
  ArtistStyleItems: false,
  ArtistTagItems: false,
};

let tagItemsTimeouts = [];

export const getTagItems = (libraryId, tagId, typeKey) => {
  // Ensure that tag items are not fetched before parent tag arrays are fetched
  const currentService = store.getState().appModel.currentService;
  if (currentService === 'plex') {
    const parentId = typeKey.replace('Item', '');
    if (getAllTagsRunning[parentId]) {
      tagItemsTimeouts.push(
        setTimeout(() => {
          getTagItems(libraryId, tagId, typeKey);
        }, 25)
      );
      return;
    }
  } else if (currentService === 'jellyfin') {
    if (getAllJellyfinTagsRunning) {
      tagItemsTimeouts.push(
        setTimeout(() => {
          getTagItems(libraryId, tagId, typeKey);
        }, 25)
      );
      return;
    }
  }

  if (!getTagItemsRunning[typeKey]) {
    const prevTagItems = store.getState().appModel[`all${typeKey}`][libraryId + '-' + tagId];
    if (refetchData || !prevTagItems) {
      console.log('%c--- bridge - getTagItems ---', 'color:#f9743b;');
      getTagItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getTagItems({
          accessToken,
          libraryId,
          serverBaseUrl,
          tagId,
          typeKey,
        })
        .then((response) => {
          if (response?.length > 0) {
            store.dispatch.appModel[`store${typeKey}`]({ libraryId, tagId, tagItems: response });
          } else {
            store.dispatch.appModel[`store${typeKey}404`]({ tagId });
          }
        })
        .catch((error) => {
          console.error(error);
          if (error?.error?.status === 400 || error?.error?.status === 404) {
            store.dispatch.appModel[`store${typeKey}404`]({ tagId });
          }
          analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Tag Items');
        })
        .finally(() => {
          getTagItemsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// SEARCH
// ======================================================================

let searchCounter = 0;

export const searchLibrary = (query) => {
  searchCounter += 1;
  searchLibrary2(query, searchCounter);
};

const searchLibrary2 = (query, searchCounter) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const currentService = store.getState().appModel.currentService;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;
  const { libraryId } = store.getState().sessionModel.currentLibrary;

  serviceTools[currentService]
    .searchLibrary({
      accessToken,
      libraryId,
      query,
      serverBaseUrl,
      userId,
    })
    .then((response) => {
      // console.log(response);
      const searchResultCounter = store.getState().appModel.searchResultCounter;
      if (searchCounter > searchResultCounter) {
        store.dispatch.appModel.setAppState({
          searchResults: response,
          searchResultCounter: searchCounter,
        });
      }
      analyticsEvent(toUpperFirst(currentService) + ' / Search');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Search Library');
    });
};

// ======================================================================
// TOGGLE FAVOURITE
// ======================================================================

export const toggleFavourite = (type, itemId, isFavourite) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = store.getState().appModel.currentUser.userId;

  jellyTools
    .toggleFavourite({
      accessToken,
      isFavourite,
      itemId,
      serverBaseUrl,
      userId,
    })
    .then(() => {
      if (type === 'artist' || type === 'artists') {
        store.dispatch.appModel.setArtistRating({ ratingKey: itemId, isFavourite });
      } else if (type === 'album' || type === 'albums') {
        store.dispatch.appModel.setAlbumRating({ ratingKey: itemId, isFavourite });
      } else if (type === 'track' || type === 'tracks') {
        store.dispatch.appModel.setTrackRating({ ratingKey: itemId, isFavourite });
      } else if (type === 'playlist' || type === 'playlists') {
        store.dispatch.appModel.setPlaylistRating({ ratingKey: itemId, isFavourite });
      } else if (type === 'collection' || type === 'collections') {
        store.dispatch.appModel.setCollectionRating({ ratingKey: itemId, isFavourite });
      }
      analyticsEvent('Jellyfin / Toggle Favourite');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Jellyfin / Error / Toggle Favourite');
    });
};

// ======================================================================
// SET STAR RATING
// ======================================================================

export const setStarRating = (type, ratingKey, rating) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const sessionId = store.getState().sessionModel.sessionId;
  plexTools
    .setStarRating({
      accessToken,
      rating,
      ratingKey,
      serverBaseUrl,
      sessionId,
    })
    .then(() => {
      if (type === 'artist' || type === 'artists') {
        store.dispatch.appModel.setArtistRating({ ratingKey, rating });
      } else if (type === 'album' || type === 'albums') {
        store.dispatch.appModel.setAlbumRating({ ratingKey, rating });
      } else if (type === 'track' || type === 'tracks') {
        store.dispatch.appModel.setTrackRating({ ratingKey, rating });
      } else if (type === 'playlist' || type === 'playlists') {
        store.dispatch.appModel.setPlaylistRating({ ratingKey, rating });
      } else if (type === 'collection' || type === 'collections') {
        store.dispatch.appModel.setCollectionRating({ ratingKey, rating });
      }
      analyticsEvent('Plex / Set Star Rating');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Plex / Error / Set Star Rating');
    });
};

// ======================================================================
// LOG PLAYBACK STATUS
// ======================================================================

export const logPlaybackPlay = (currentTrack, currentTime = 0) => {
  const currentService = store.getState().appModel.currentService;
  const state = currentService === 'jellyfin' ? 'start' : 'playing';
  logPlaybackStatus(currentTrack, state, currentTime);
};

export const logPlaybackProgress = (currentTrack, currentTime) => {
  logPlaybackStatus(currentTrack, 'playing', currentTime);
};

export const logPlaybackPause = (currentTrack, currentTime) => {
  logPlaybackStatus(currentTrack, 'paused', currentTime);
};

export const logPlaybackStop = (currentTrack) => {
  const { duration } = currentTrack;
  logPlaybackStatus(currentTrack, 'stopped', duration);
};

export const logPlaybackStatus = (currentTrack, state, currentTime) => {
  const optionLogPlaybackToServer = store.getState().sessionModel.optionLogPlaybackToServer;
  if (optionLogPlaybackToServer) {
    const accessToken = store.getState().sessionModel.currentServer.accessToken;
    const currentService = store.getState().appModel.currentService;
    const serverBaseUrl = store.getState().appModel.serverBaseUrl;
    const sessionId = store.getState().sessionModel.sessionId;
    const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;
    const { trackId, trackKey, duration } = currentTrack || {};

    serviceTools[currentService]
      .logPlaybackStatus({
        accessToken,
        currentTime,
        duration,
        itemId: trackId,
        serverBaseUrl,
        sessionId,
        state,
        trackId: trackKey,
        type: 'music',
        userId,
      })
      .catch((error) => {
        // console.error(error);
        const errorCode = error?.code || 'Unknown';
        const errorStatus = error?.error?.response?.status || 'Unknown';
        const errorMessage = error?.error?.response?.statusText || 'Unknown Error';
        analyticsEvent(
          toUpperFirst(currentService) +
            ' / Error / Log Playback / ' +
            errorCode +
            ' / ' +
            errorStatus +
            ' / ' +
            errorMessage
        );
        try {
          analyticsEvent('Log Error / ' + JSON.stringify(error));
        } catch (_event) {
          //
        }
      });
  }
};

export const logPlaybackQuit = (currentTrack, currentTime) => {
  const optionLogPlaybackToServer = store.getState().sessionModel.optionLogPlaybackToServer;
  if (optionLogPlaybackToServer) {
    const accessToken = store.getState().sessionModel.currentServer.accessToken;
    const currentService = store.getState().appModel.currentService;
    const serverBaseUrl = store.getState().appModel.serverBaseUrl;
    const sessionId = store.getState().sessionModel.sessionId;
    const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;
    const { trackId, trackKey, duration } = currentTrack || {};

    serviceTools[currentService].logPlaybackQuit({
      accessToken,
      currentTime,
      duration,
      itemId: trackId,
      serverBaseUrl,
      sessionId,
      state: 'stopped',
      trackId: trackKey,
      type: 'music',
      userId,
    });
  }
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

const toUpperFirst = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};
