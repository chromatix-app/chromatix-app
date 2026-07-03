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
// HELPER - CHECK IF STORE IS READY
// ======================================================================

// Used during development to guard against a Vite HMR timing issue where bridge functions can fire
// before the store has been rehydrated from localStorage. In production this never occurs, so we skip the check.
const isStoreReady = () => {
  if (import.meta.env.PROD) return true;
  const { sessionModel } = store.getState();
  return Boolean(sessionModel.currentServer) && Boolean(sessionModel.currentLibrary);
};

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
  if (currentService) {
    analyticsEvent(toUpperFirst(currentService) + ' / Logout');
  } else {
    analyticsEvent('Logout (could not get user info)');
  }
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
        currentAccount: response,
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
// GET ALL USERS
// ======================================================================

export const getAllUsers = (service) => {
  console.log('%c--- bridge - getAllUsers ---', 'color:#f9743b;');
  if (service === 'jellyfin') {
    store.dispatch.appModel.storeAllUsers([]);
  } else {
    serviceTools[service]
      .getAllUsers()
      .then((response) => {
        store.dispatch.appModel.storeAllUsers(response);
      })
      .catch((error) => {
        console.error(error);
        store.dispatch.appModel.setAppState({ errorAllUsers: true });
        analyticsEvent(toUpperFirst(service) + ' / Error / Get All Users');
      });
  }
};

// ======================================================================
// SWITCH USER
// ======================================================================

export const switchUser = ({ uuid, pin }) => {
  console.log('%c--- bridge - switchUser ---', 'color:#f9743b;');
  const currentService = store.getState().appModel.currentService;

  serviceTools[currentService]
    .switchUser({
      uuid,
      pin,
    })
    .then((response) => {
      store.dispatch.appModel.storeUserToken(response);
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.setAppState({ errorSwitchUser: true });
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Switch User');
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
      const serverBaseUrl =
        currentService === 'jellyfin' ? store.getState().appModel.currentAccount.serverBaseUrl : null;
      const userToken = store.getState().appModel.userToken;

      serviceTools[currentService]
        .getAllServers({
          serverBaseUrl,
          userToken,
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

const getFastestConnection = async (currentServer, currentService, currentAccount) => {
  let serverBaseUrl;
  try {
    if (currentAccount?.serverBaseUrl) {
      serverBaseUrl = currentAccount.serverBaseUrl;
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
        const currentAccount = currentService === 'jellyfin' ? store.getState().appModel.currentAccount : null;

        // before getting libraries, get the fastest server connection
        let serverBaseUrl;
        try {
          serverBaseUrl = await getFastestConnection(currentServer, currentService, currentAccount);
        } catch (error) {
          getUserLibrariesRunning = false;
          return;
        }

        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const userId = currentAccount?.userId;

        serviceTools[currentService]
          .getAllLibraries({
            accessToken,
            serverBaseUrl,
            userId,
          })
          .then((response) => {
            store.dispatch.appModel.storeAllLibraries(response);
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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
  if (!getArtistDetailsRunning) {
    const prevArtistDetails = store.getState().appModel.allArtists?.find((artist) => artist.artistId === artistId);
    if (refetchData || !prevArtistDetails) {
      console.log('%c--- bridge - getArtistDetails ---', 'color:#f9743b;');
      getArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
  if (!isStoreReady()) return;
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
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
  if (!isStoreReady()) return;
  if (!getAllArtistAlbumsRunning) {
    const prevAllAlbums = store.getState().appModel.allArtistAlbums[libraryId + '-' + artistId];
    if (refetchData || !prevAllAlbums) {
      console.log('%c--- bridge - getAllArtistAlbums ---', 'color:#f9743b;');
      getAllArtistAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
  if (!getAllArtistAppearanceAlbumsRunning) {
    const prevAllAppearanceAlbums = store.getState().appModel.allArtistAppearanceAlbums[libraryId + '-' + artistId];
    if (refetchData || !prevAllAppearanceAlbums) {
      console.log('%c--- bridge - getAllArtistAppearanceAlbums ---', 'color:#f9743b;');
      getAllArtistAppearanceAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const currentService = store.getState().appModel.currentService;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
  return new Promise((resolve, reject) => {
    if (!isStoreReady()) {
      resolve();
      return;
    }
    if (!getAllArtistTracksRunning) {
      const prevArtistTracks = store.getState().appModel.allArtistTracks[libraryId + '-' + artistId];
      if (refetchData || !prevArtistTracks) {
        console.log('%c--- bridge - getAllArtistTracks ---', 'color:#f9743b;');
        getAllArtistTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const currentService = store.getState().appModel.currentService;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;
        const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
            resolve();
          })
          .catch((error) => {
            console.error(error);
            analyticsEvent(toUpperFirst(currentService) + ' / Error / Get Artist Tracks');
            reject(error);
          })
          .finally(() => {
            getAllArtistTracksRunning = false;
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
// GET ALL ALBUMS
// ======================================================================

let getAllAlbumsRunning;

export const getAllAlbums = () => {
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
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
    if (!isStoreReady()) {
      resolve();
      return;
    }
    if (!getAlbumTracksRunning) {
      const prevAlbumTracks = store.getState().appModel.allAlbumTracks[libraryId + '-' + albumId];
      if (refetchData || !prevAlbumTracks) {
        console.log('%c--- bridge - getAlbumTracks ---', 'color:#f9743b;');
        getAlbumTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const currentService = store.getState().appModel.currentService;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;
        const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

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
    if (!isStoreReady()) {
      resolve();
      return;
    }
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
  if (!isStoreReady()) return;
  if (!getAllPlaylistsRunning) {
    const prevAllPlaylists = store.getState().appModel.allPlaylists;
    if (refetchData || !prevAllPlaylists) {
      console.log('%c--- bridge - getAllPlaylists ---', 'color:#f9743b;');
      getAllPlaylistsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const timeStamp = store.getState().appModel.timeStamp;
      const allPlaylistEdits = store.getState().appModel.allPlaylistEdits;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      return serviceTools[currentService]
        .getAllPlaylists({
          accessToken,
          libraryId,
          serverBaseUrl,
          timeStamp,
          allPlaylistEdits,
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
  if (!isStoreReady()) return;
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
      const playlistEditCount = store.getState().appModel.allPlaylistEdits[playlistId] || 0;
      const timeStamp = store.getState().appModel.timeStamp + playlistEditCount;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;

      return serviceTools[currentService]
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
    if (!isStoreReady()) {
      resolve();
      return;
    }
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
// CREATE PLAYLIST
// ======================================================================

export const createPlaylist = ({ title }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverId = store.getState().sessionModel.currentServer.serverId;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .createPlaylist({ accessToken, libraryId, serverId, serverBaseUrl, title, userId })
    .then(async (response) => {
      analyticsEvent(toUpperFirst(currentService) + ' / Create Playlist');
      // refresh data
      await getAllPlaylists();
      // navigate to the new playlist details page
      const newPlaylistId = currentService === 'jellyfin' ? response.Id : response.ratingKey;
      store.getState().appModel.history.push(`/libraries/${libraryId}/playlists/${newPlaylistId}`);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Create Playlist');
    });
};

// ======================================================================
// EDIT PLAYLIST
// ======================================================================

export const editPlaylist = ({ playlistId, title, summary }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .editPlaylist({ accessToken, serverBaseUrl, playlistId, title, summary })
    .then(async () => {
      analyticsEvent(toUpperFirst(currentService) + ' / Edit Playlist');
      // refresh data
      await Promise.all([getAllPlaylists(), getPlaylistDetails(libraryId, playlistId)]);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Edit Playlist');
    });
};

// ======================================================================
// DELETE PLAYLIST
// ======================================================================

export const deletePlaylist = ({ playlistId }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .deletePlaylist({ accessToken, serverBaseUrl, playlistId })
    .then(async () => {
      analyticsEvent(toUpperFirst(currentService) + ' / Delete Playlist');
      // refresh data
      await getAllPlaylists();
      // navigate to playlists page
      store.getState().appModel.history.push(`/libraries/${libraryId}/playlists`);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Delete Playlist');
    });
};

// ======================================================================
// ADD TRACK TO PLAYLIST
// ======================================================================

export const addTracksToPlaylist = ({ playlistId, trackIds }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverId = store.getState().sessionModel.currentServer.serverId;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .addTracksToPlaylist({ accessToken, serverBaseUrl, playlistId, serverId, trackIds, userId })
    .then(() => {
      analyticsEvent(toUpperFirst(currentService) + ' / Add Track To Playlist');
      // refresh the playlist
      store.dispatch.appModel.incrementPlaylistEditCount(playlistId);
      getPlaylistDetails(libraryId, playlistId);
      getPlaylistTracks(libraryId, playlistId);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Add Track To Playlist');
    });
};

// ======================================================================
// REMOVE TRACK FROM PLAYLIST
// ======================================================================

export const removeTrackFromPlaylist = ({ playlistId, playlistItemId }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .removeTrackFromPlaylist({ accessToken, serverBaseUrl, playlistId, playlistItemId })
    .then(() => {
      analyticsEvent(toUpperFirst(currentService) + ' / Remove Track From Playlist');
      // refresh the playlist
      store.dispatch.appModel.incrementPlaylistEditCount(playlistId);
      getPlaylistDetails(libraryId, playlistId);
      getPlaylistTracks(libraryId, playlistId);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Remove Track From Playlist');
    });
};

// ======================================================================
// REMOVE TRACKS FROM PLAYLIST
// ======================================================================

export const removeTracksFromPlaylist = ({ playlistId, playlistItemIds }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  return serviceTools[currentService]
    .removeTracksFromPlaylist({ accessToken, serverBaseUrl, playlistId, playlistItemIds })
    .then(() => {
      analyticsEvent(toUpperFirst(currentService) + ' / Remove Tracks From Playlist');
      // refresh the playlist
      store.dispatch.appModel.incrementPlaylistEditCount(playlistId);
      getPlaylistDetails(libraryId, playlistId);
      getPlaylistTracks(libraryId, playlistId);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Remove Tracks From Playlist');
    });
};

// ======================================================================
// MOVE PLAYLIST ITEM
// ======================================================================

export const movePlaylistItem = ({ playlistId, playlistItemId, afterPlaylistItemId }) => {
  if (!isStoreReady()) return;
  const currentService = store.getState().appModel.currentService;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;
  // Jellyfin's move endpoint needs a target index rather than an "after" id - pass through
  // the currently known playlist order so jellyTools can compute it without an extra request
  const orderedPlaylistItemIds = (store.getState().appModel.allPlaylistTracks[libraryId + '-' + playlistId] || []).map(
    (track) => track.playlistItemID
  );
  return serviceTools[currentService]
    .movePlaylistItem({
      accessToken,
      serverBaseUrl,
      playlistId,
      playlistItemId,
      afterPlaylistItemId,
      orderedPlaylistItemIds,
    })
    .then(async () => {
      analyticsEvent(toUpperFirst(currentService) + ' / Move Playlist Item');
      // refresh the playlist
      await getPlaylistTracks(libraryId, playlistId);
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent(toUpperFirst(currentService) + ' / Error / Move Playlist Item');
    });
};

// window.bridge.createPlaylist({ title: 'AAA Test' })
// window.bridge.editPlaylist({ playlistId: '168468', title: 'Renamed' })
// window.bridge.deletePlaylist({ playlistId: '168468' })
// window.bridge.addTracksToPlaylist({ playlistId: '168468', trackIds: ['163222'] });
// window.bridge.addTracksToPlaylist({ playlistId: '168468', trackIds: ['163222', '163223', '163224'] });
// window.bridge.removeTrackFromPlaylist({ playlistId: '168468', playlistItemId: '9872' })
// window.bridge.removeTracksFromPlaylist({ playlistId: '168468', playlistItemIds: ['9956', '9957', '9958'] })
// window.bridge.movePlaylistItem({ playlistId: '168468', playlistItemId: '9872', afterPlaylistItemId: '9869' })

// ======================================================================
// GET SHARED MEDIA
// ======================================================================

export const getSharedMedia = () => {
  if (!isStoreReady()) return;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  return plexTools
    .getSharedMedia({ accessToken, serverBaseUrl })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

// window.bridge.getSharedMedia()

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

let getAllCollectionsRunning;

export const getAllCollections = () => {
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
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
      const userId = store.getState().appModel.currentAccount.userId;
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
  if (!isStoreReady()) return;
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
  if (!isStoreReady()) return;
  searchCounter += 1;
  searchLibrary2(query, searchCounter);
};

const searchLibrary2 = (query, searchCounter) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const currentService = store.getState().appModel.currentService;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
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
  if (!isStoreReady()) return;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const userId = store.getState().appModel.currentAccount.userId;

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
  if (!isStoreReady()) return;
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
    const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
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
    const userId = currentService === 'jellyfin' ? store.getState().appModel.currentAccount.userId : null;
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

// ======================================================================
// DEBUGGING - BROWSER CONSOLE ACCESS
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

if (isLocal) {
  window.bridge = {
    abortAllRequests,
    addTracksToPlaylist,
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    getAlbumArtistDetails,
    getAlbumDetails,
    getAlbumTracks,
    getAllAlbumArtists,
    getAllAlbums,
    getAllArtistAlbums,
    getAllArtistAppearanceAlbums,
    getAllArtistRelatedAlbums,
    getAllArtists,
    getAllArtistTracks,
    getAllCollections,
    getAllLibraries,
    getAllPlaylists,
    getAllServers,
    getSharedMedia,
    getAllTags,
    getAllUsers,
    getArtistDetails,
    getCollectionItems,
    getFolderItems,
    getPlaylistDetails,
    getPlaylistTracks,
    getTagItems,
    getUserInfo,
    init,
    jellyLogin,
    logout,
    logPlaybackPause,
    logPlaybackPlay,
    logPlaybackProgress,
    logPlaybackQuit,
    logPlaybackStatus,
    logPlaybackStop,
    movePlaylistItem,
    plexLogin,
    removeTrackFromPlaylist,
    removeTracksFromPlaylist,
    searchLibrary,
    setStarRating,
    switchUser,
    toggleFavourite,
  };
}
