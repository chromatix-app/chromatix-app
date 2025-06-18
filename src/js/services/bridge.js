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
        if (error.code !== 'plex.checkPinStatus.1') {
          console.error(error);
          analyticsEvent('Error: Init - ' + error.code);
        }
      } else {
        analyticsEvent('Error: Init - Unknown Error');
      }
    });
};

const checkIfLoggedIn = () => {
  console.log('%c--- bridge - checkIfLoggedIn ---', 'color:#f9743b;');
  return new Promise((resolve, reject) => {
    const accessToken = getLocalStorage(storageTokenKey);
    if (accessToken) {
      let service = getLocalStorage(storageServiceKey);
      // NOTE this is here for backwards compatibility
      if (!service) {
        service = 'plex';
      }
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
Note:
Jellyfin login is API based and does not redirect you away.
*/

export const jellyLogin = (values) => {
  console.log('%c--- bridge - jellyLogin ---', 'color:#f9743b;');
  return new Promise((resolve, reject) => {
    jellyTools
      .login(values)
      .then((_response) => {
        analyticsEvent('Bridge: Jellyfin Login Success');
        getUserInfo('jellyfin');
      })
      .catch((error) => {
        console.error(error);
        analyticsEvent('Bridge: Login Error');
        reject(error);
      });
  });
};

// ======================================================================
// LOGIN - PLEX
// ======================================================================

/*
Note:
Plex login actually redirects you away to a Plex login page on their site.
On return, a Plex PIN is verified in the init function, and then user data is fetched.
*/

export const plexLogin = () => {
  console.log('%c--- bridge - plexLogin ---', 'color:#f9743b;');
  plexTools
    .login()
    .then((_response) => {
      analyticsEvent('Bridge: Plex Login Success');
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.setAppState({ errorPlexLogin: true });
      analyticsEvent('Bridge: Login Error');
    });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  console.log('%c--- bridge - logout ---', 'color:#f9743b;');
  jellyTools.logout();
  plexTools.logout();
  store.dispatch.appModel.setLoggedOut();
  analyticsEvent('Bridge: Logout');
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
      store.dispatch.appModel.setAppState({ errorPlexUser: true });
      analyticsEvent('Error: ' + toUpperFirst(service) + ' - Get User Info');
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
        .getAllServers(serverBaseUrl)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeAllServers(response);
        })
        .catch((error) => {
          console.error(error);
          store.dispatch.appModel.setAppState({ errorPlexServers: true });
          analyticsEvent('Error: Bridge - Get All Servers');
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

const getFastestConnection = async (currentServer, currentUser) => {
  let serverBaseUrl;
  try {
    if (currentUser?.serverBaseUrl) {
      serverBaseUrl = currentUser.serverBaseUrl;
      store.dispatch.appModel.setAppState({ serverBaseUrl });
    } else {
      await plexTools.getFastestConnection(currentServer).then((response) => {
        serverBaseUrl = response;
        store.dispatch.appModel.setAppState({ serverBaseUrl });
      });
    }
  } catch (error) {
    console.error(error);
    store.dispatch.appModel.setAppState({ errorPlexFastestConnection: true });
    analyticsEvent('Error: Bridge - Get Fastest Server Connection');
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
          serverBaseUrl = await getFastestConnection(currentServer, currentUser);
        } catch (error) {
          getUserLibrariesRunning = false;
          return;
        }

        const userId = currentUser?.userId;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        serviceTools[currentService]
          .getAllLibraries(serverBaseUrl, accessToken, userId)
          .then((response) => {
            store.dispatch.sessionModel.refreshCurrentLibrary(response);
            store.dispatch.appModel.setAppState({ allLibraries: response });
          })
          .catch((error) => {
            console.error(error);
            store.dispatch.appModel.setAppState({ errorPlexLibraries: true });
            analyticsEvent('Error: ' + toUpperFirst(currentService) + ' - Get All Libraries');
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
    if (!haveGotAllArtists) {
      console.log('%c--- bridge - getAllArtists ---', 'color:#f9743b;');
      getAllArtistsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllArtists(serverBaseUrl, libraryId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({
            haveGotAllArtists: true,
            allArtists: response,
          });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          getAllArtistsRunning = false;
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
    if (!prevArtistDetails) {
      console.log('%c--- bridge - getArtistDetails ---', 'color:#f9743b;');
      getArtistDetailsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getArtistDetails(serverBaseUrl, libraryId, artistId, accessToken, userId)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistDetails(response);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          getArtistDetailsRunning = false;
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
    if (!prevAllAlbums) {
      console.log('%c--- bridge - getAllArtistAlbums ---', 'color:#f9743b;');
      getAllArtistAlbumsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getAllArtistAlbums(serverBaseUrl, libraryId, artistId, accessToken, userId)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistAlbums({ libraryId, artistId, artistAlbums: response });
        })
        .catch((error) => {
          console.error(error);
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
    if (!prevAllRelated) {
      console.log('%c--- bridge - getAllArtistRelatedAlbums ---', 'color:#f9743b;');
      getAllArtistRelatedAlbumsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getAllArtistRelatedAlbums(serverBaseUrl, libraryId, artistId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated: response });
        })
        .catch((error) => {
          console.error(error);
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
    if (!prevAllAppearanceAlbums) {
      console.log('%c--- bridge - getAllArtistAppearanceAlbums ---', 'color:#f9743b;');
      getAllArtistAppearanceAlbumsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getAllArtistAppearanceAlbums(serverBaseUrl, libraryId, artistName, store, accessToken, artistId, userId)
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
    if (!prevArtistTracks) {
      console.log('%c--- bridge - getAllArtistTracks ---', 'color:#f9743b;');
      getAllArtistTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      Promise.all([
        plexTools.getAllArtistTracks(serverBaseUrl, libraryId, artistId, artistName, accessToken),
        plexTools.getAllArtistAppearanceTracks(serverBaseUrl, libraryId, artistId, artistName, accessToken),
      ])
        .then(([artistTracks, appearanceTracks]) => {
          // Combine both track arrays (assume they need to be merged)
          const combinedTracks = [...artistTracks, ...appearanceTracks];
          // Store the combined tracks
          store.dispatch.appModel.storeArtistTracks({
            libraryId,
            artistId,
            artistTracks: combinedTracks,
          });
        })
        .catch((error) => {
          console.error(error);
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
    if (!haveGotAllAlbums) {
      console.log('%c--- bridge - getAllAlbums ---', 'color:#f9743b;');
      getAllAlbumsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllAlbums(serverBaseUrl, libraryId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({
            haveGotAllAlbums: true,
            allAlbums: response,
          });
        })
        .catch((error) => {
          console.error(error);
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
    if (!prevAlbumDetails) {
      console.log('%c--- bridge - getAlbumDetails ---', 'color:#f9743b;');
      getAlbumDetailsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      serviceTools[currentService]
        .getAlbumDetails(serverBaseUrl, libraryId, albumId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeAlbumDetails(response);
          if (callback) {
            callback();
          }
        })
        .catch((error) => {
          console.error(error);
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
      if (!prevAlbumTracks) {
        console.log('%c--- bridge - getAlbumTracks ---', 'color:#f9743b;');
        getAlbumTracksRunning = true;
        const currentService = store.getState().appModel.currentService;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;
        const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

        serviceTools[currentService]
          .getAlbumTracks(serverBaseUrl, libraryId, albumId, accessToken, userId)
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storeAlbumTracks({ libraryId, albumId, albumTracks: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
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
      if (!prevFolderItems) {
        console.log('%c--- bridge - getFolderItems ---', 'color:#f9743b;');
        getFolderItemsRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;

        plexTools
          .getFolderItems(serverBaseUrl, libraryId, folderId, accessToken)
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storeFolderItems({ libraryId, folderId, folderItems: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
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
    if (!prevAllPlaylists) {
      console.log('%c--- bridge - getAllPlaylists ---', 'color:#f9743b;');
      getAllPlaylistsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      serviceTools[currentService]
        .getAllPlaylists(serverBaseUrl, libraryId, accessToken, userId)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({ allPlaylists: response });
        })
        .catch((error) => {
          console.error(error);
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
    if (!prevPlaylistDetails) {
      console.log('%c--- bridge - getPlaylistDetails ---', 'color:#f9743b;');
      getPlaylistDetailsRunning = true;
      const currentService = store.getState().appModel.currentService;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const userId = currentService === 'jellyfin' ? store.getState().appModel.currentUser.userId : null;

      serviceTools[currentService]
        .getPlaylistDetails(serverBaseUrl, libraryId, playlistId, accessToken, userId)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storePlaylistDetails(response);
        })
        .catch((error) => {
          console.error(error);
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
      if (!prevPlaylistTracks) {
        console.log('%c--- bridge - getPlaylistTracks ---', 'color:#f9743b;');
        getPlaylistTracksRunning = true;
        const currentService = store.getState().appModel.currentService;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const serverBaseUrl = store.getState().appModel.serverBaseUrl;

        serviceTools[currentService]
          .getPlaylistTracks(serverBaseUrl, libraryId, playlistId, accessToken)
          .then((response) => {
            // console.log(response);
            store.dispatch.appModel.storePlaylistTracks({ libraryId, playlistId, playlistTracks: response });
            resolve();
          })
          .catch((error) => {
            console.error(error);
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
    if (!prevAllArtistCollections || !prevAllAlbumCollections) {
      console.log('%c--- bridge - getAllCollections ---', 'color:#f9743b;');
      getAllCollectionsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllCollections(serverBaseUrl, libraryId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState(response);
        })
        .catch((error) => {
          console.error(error);
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

export const getCollectionItems = (libraryId, collectionId, typeKey) => {
  if (!getCollectionItemsRunning[typeKey]) {
    const prevCollectionItems =
      store.getState().appModel[`all${typeKey}CollectionItems`][libraryId + '-' + collectionId];
    if (!prevCollectionItems) {
      console.log('%c--- bridge - getCollectionItems - ' + typeKey + ' ---', 'color:#f9743b;');
      getCollectionItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      plexTools
        .getCollectionItems(serverBaseUrl, libraryId, collectionId, typeKey, accessToken)
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
        })
        .finally(() => {
          getCollectionItemsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// GET ALL SETS
// ======================================================================

let getAllTagsRunning = {
  AlbumGenres: false,
  AlbumMoods: false,
  AlbumStyles: false,
  ArtistGenres: false,
  ArtistMoods: false,
  ArtistStyles: false,
};

export const getAllTags = (typeKey) => {
  if (!getAllTagsRunning[typeKey]) {
    const prevAllTags = store.getState().appModel[`all${typeKey}`];
    if (!prevAllTags) {
      console.log('%c--- bridge - getAllTags - ' + typeKey + ' ---', 'color:#f9743b;');
      getAllTagsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllTags(serverBaseUrl, libraryId, typeKey, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.setAppState({ [`all${typeKey}`]: response });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          getAllTagsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// GET SET ITEMS
// ======================================================================

let getTagItemsRunning = {
  AlbumGenreItems: false,
  AlbumMoodItems: false,
  AlbumStyleItems: false,
  ArtistGenreItems: false,
  ArtistMoodItems: false,
  ArtistStyleItems: false,
};

export const getTagItems = (libraryId, tagId, typeKey) => {
  if (!getTagItemsRunning[typeKey]) {
    const prevTagItems = store.getState().appModel[`all${typeKey}`][libraryId + '-' + tagId];
    if (!prevTagItems) {
      console.log('%c--- bridge - getTagItems ---', 'color:#f9743b;');
      getTagItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;

      plexTools
        .getTagItems(serverBaseUrl, libraryId, tagId, typeKey, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel[`store${typeKey}`]({ libraryId, tagId, tagItems: response });
        })
        .catch((error) => {
          console.error(error);
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
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;

  plexTools
    .searchLibrary(serverBaseUrl, libraryId, accessToken, query)
    .then((response) => {
      // console.log(response);
      const searchResultCounter = store.getState().appModel.searchResultCounter;
      if (searchCounter > searchResultCounter) {
        store.dispatch.appModel.setAppState({
          searchResults: response,
          searchResultCounter: searchCounter,
        });
      }
      analyticsEvent('Bridge: Search');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Error: Bridge - Search');
    });
};

// ======================================================================
// SET STAR RATING
// ======================================================================

export const setStarRating = (type, ratingKey, rating) => {
  const serverBaseUrl = store.getState().appModel.serverBaseUrl;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const sessionId = store.getState().sessionModel.sessionId;
  plexTools
    .setStarRating(serverBaseUrl, accessToken, sessionId, ratingKey, rating)
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
      analyticsEvent('Bridge: Set Star Rating');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Error: Bridge - Set Star Rating');
    });
};

// ======================================================================
// LOG PLAYBACK STATUS
// ======================================================================

export const logPlaybackPlay = (currentTrack, currentTime = 0) => {
  logPlaybackStatus(currentTrack, 'playing', currentTime);
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
  const currentService = store.getState().appModel.currentService;
  if (currentService === 'plex') {
    const optionLogPlexPlayback = store.getState().sessionModel.optionLogPlexPlayback;
    if (optionLogPlexPlayback) {
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const sessionId = store.getState().sessionModel.sessionId;
      const { trackId, trackKey, duration } = currentTrack || {};
      plexTools
        .logPlaybackStatus(
          serverBaseUrl,
          accessToken,
          sessionId,
          'music',
          trackId,
          trackKey,
          state,
          currentTime,
          duration
        )
        .catch((error) => {
          console.error(error);
          analyticsEvent('Error: Bridge - Update Playback Status');
        });
    }
  }
};

export const logPlaybackQuit = (currentTrack, currentTime) => {
  const currentService = store.getState().appModel.currentService;
  if (currentService === 'plex') {
    const optionLogPlexPlayback = store.getState().sessionModel.optionLogPlexPlayback;
    if (optionLogPlexPlayback) {
      const serverBaseUrl = store.getState().appModel.serverBaseUrl;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const sessionId = store.getState().sessionModel.sessionId;
      const { trackId, trackKey, duration } = currentTrack || {};
      plexTools.logPlaybackQuit(
        serverBaseUrl,
        accessToken,
        sessionId,
        'music',
        trackId,
        trackKey,
        'stopped',
        currentTime,
        duration
      );
    }
  }
};

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

const toUpperFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
