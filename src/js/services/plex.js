// ======================================================================
// IMPORTS
// ======================================================================

import * as plexTools from 'js/services/plexTools';
import { analyticsEvent } from 'js/utils';
import store from 'js/store/store';

// ======================================================================
// LOAD
// ======================================================================

export const init = () => {
  console.log('%c--- plex - init ---', 'color:#f9743b;');
  plexTools
    .init()
    .then((_response) => {
      getUserInfo();
    })
    .catch((error) => {
      store.dispatch.appModel.setLoggedOut();
      if (error?.code !== 'init.2') {
        console.error(error);
        if (error?.code === 'init.1') {
          analyticsEvent('Error: Plex Init - No Pin ID');
        } else if (error?.code === 'checkPlexPinStatus.2') {
          analyticsEvent('Error: Plex Init - Pin Check Failed');
        } else {
          analyticsEvent('Error: Plex Init - Unknown Error');
        }
      }
    });
};

// ======================================================================
// LOGIN
// ======================================================================

export const login = () => {
  console.log('%c--- plex - login ---', 'color:#f9743b;');
  plexTools
    .login()
    .then((_response) => {
      analyticsEvent('Plex: Login Success');
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.setAppState({ errorPlexLogin: true });
      analyticsEvent('Plex: Login Error');
    });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  console.log('%c--- plex - logout ---', 'color:#f9743b;');
  plexTools.logout();
  store.dispatch.appModel.setLoggedOut();
  analyticsEvent('Plex: Logout');
};

// ======================================================================
// GET USER INFO
// ======================================================================

export const getUserInfo = () => {
  console.log('%c--- plex - getUserInfo ---', 'color:#f9743b;');
  plexTools
    .getUserInfo()
    .then((response) => {
      store.dispatch.appModel.setLoggedIn(response);
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.setAppState({ errorPlexUser: true });
      analyticsEvent('Error: Plex Get User Info');
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
      console.log('%c--- plex - getAllServers ---', 'color:#f9743b;');
      getUserServersRunning = true;
      plexTools
        .getAllServers()
        .then((response) => {
          store.dispatch.appModel.storeAllServers(response);
        })
        .catch((error) => {
          console.error(error);
          store.dispatch.appModel.setAppState({ errorPlexServers: true });
          analyticsEvent('Error: Plex Get All Servers');
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

const getFastestConnection = async (currentServer) => {
  let plexBaseUrl;
  try {
    await plexTools.getFastestConnection(currentServer).then((response) => {
      plexBaseUrl = response;
      store.dispatch.appModel.setAppState({ plexBaseUrl });
    });
  } catch (error) {
    console.error(error);
    store.dispatch.appModel.setAppState({ errorPlexFastestConnection: true });
    analyticsEvent('Error: Plex Get Fastest Server Connection');
    throw error;
  }
  return plexBaseUrl;
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
        console.log('%c--- plex - getAllLibraries ---', 'color:#f9743b;');
        getUserLibrariesRunning = true;

        // before getting libraries, get the fastest server connection
        let plexBaseUrl;
        try {
          plexBaseUrl = await getFastestConnection(currentServer);
        } catch (error) {
          getUserLibrariesRunning = false;
          return;
        }

        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        plexTools
          .getAllLibraries(plexBaseUrl, accessToken)
          .then((response) => {
            store.dispatch.sessionModel.refreshCurrentLibrary(response);
            store.dispatch.appModel.setAppState({ allLibraries: response });
          })
          .catch((error) => {
            console.error(error);
            store.dispatch.appModel.setAppState({ errorPlexLibraries: true });
            analyticsEvent('Error: Plex Get All Libraries');
          })
          .finally(() => {
            getUserLibrariesRunning = false;
          });
      }
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
  const plexBaseUrl = store.getState().appModel.plexBaseUrl;
  const { libraryId } = store.getState().sessionModel.currentLibrary;

  plexTools
    .searchHub(plexBaseUrl, libraryId, accessToken, query)
    .then((response) => {
      // console.log(response);
      const searchResultCounter = store.getState().appModel.searchResultCounter;
      if (searchCounter > searchResultCounter) {
        store.dispatch.appModel.setAppState({
          searchResults: response,
          searchResultCounter: searchCounter,
        });
      }
      analyticsEvent('Plex: Search');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Error: Plex Search');
    });
};

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

let getAllArtistsRunning;

export const getAllArtists = () => {
  if (!getAllArtistsRunning) {
    const haveGotAllArtists = store.getState().appModel.haveGotAllArtists;
    if (!haveGotAllArtists) {
      console.log('%c--- plex - getAllArtists ---', 'color:#f9743b;');
      getAllArtistsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllArtists(plexBaseUrl, libraryId, accessToken)
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
      console.log('%c--- plex - getArtistDetails ---', 'color:#f9743b;');
      getArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getArtistDetails(plexBaseUrl, libraryId, artistId, accessToken)
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
      console.log('%c--- plex - getAllArtistAlbums ---', 'color:#f9743b;');
      getAllArtistAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getAllArtistAlbums(plexBaseUrl, libraryId, artistId, accessToken)
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
// GET ARTIST RELATED
// ======================================================================

let getAllArtistRelatedRunning;

export const getAllArtistRelated = (libraryId, artistId) => {
  if (!getAllArtistRelatedRunning) {
    const prevAllRelated = store.getState().appModel.allArtistRelated[libraryId + '-' + artistId];
    if (!prevAllRelated) {
      console.log('%c--- plex - getAllArtistRelated ---', 'color:#f9743b;');
      getAllArtistRelatedRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getAllArtistRelated(plexBaseUrl, libraryId, artistId, accessToken)
        .then((response) => {
          // console.log(response);
          store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated: response });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          getAllArtistRelatedRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST COMPILATION ALBUMS
// ======================================================================

let getAllArtistAppearanceAlbumsRunning;

export const getAllArtistAppearanceAlbums = (libraryId, artistId, artistName) => {
  if (!getAllArtistAppearanceAlbumsRunning) {
    const prevAllCompilationAlbums = store.getState().appModel.allArtistCompilationAlbums[libraryId + '-' + artistId];
    if (!prevAllCompilationAlbums) {
      console.log('%c--- plex - getAllArtistAppearanceAlbums ---', 'color:#f9743b;');
      getAllArtistAppearanceAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getAllArtistAppearanceAlbumIds(plexBaseUrl, libraryId, artistName, accessToken)
        .then((response) => {
          console.log(111);
          console.log(response);
          let artistCompilationAlbums = [];

          if (response.length > 0) {
            const allAlbums1 = store.getState().appModel.allAlbums;

            const albumPromises = response.map((albumId) => {
              // Check to see if we already have the album info
              const albumInfo1 = allAlbums1 ? allAlbums1?.find((album) => album.albumId === albumId) : null;
              if (albumInfo1) {
                artistCompilationAlbums.push(albumInfo1);
                return Promise.resolve();
              }

              // If not, get the album details
              return new Promise((resolve) => {
                getAlbumDetails(libraryId, albumId, () => {
                  const allAlbums2 = store.getState().appModel.allAlbums;
                  const albumInfo2 = allAlbums2?.find((album) => album.albumId === albumId);
                  if (albumInfo2) {
                    artistCompilationAlbums.push(albumInfo2);
                  }
                  resolve();
                });
              });
            });

            Promise.all(albumPromises).then(() => {
              store.dispatch.appModel.storeArtistCompilationAlbums({ libraryId, artistId, artistCompilationAlbums });
            });
          } else {
            store.dispatch.appModel.storeArtistCompilationAlbums({ libraryId, artistId, artistCompilationAlbums });
          }
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
// GET ALL ALBUMS
// ======================================================================

let getAllAlbumsRunning;

export const getAllAlbums = () => {
  if (!getAllAlbumsRunning) {
    const haveGotAllAlbums = store.getState().appModel.haveGotAllAlbums;
    if (!haveGotAllAlbums) {
      console.log('%c--- plex - getAllAlbums ---', 'color:#f9743b;');
      getAllAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllAlbums(plexBaseUrl, libraryId, accessToken)
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
      console.log('%c--- plex - getAlbumDetails ---', 'color:#f9743b;');
      getAlbumDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getAlbumDetails(plexBaseUrl, libraryId, albumId, accessToken)
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
        console.log('%c--- plex - getAlbumTracks ---', 'color:#f9743b;');
        getAlbumTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const plexBaseUrl = store.getState().appModel.plexBaseUrl;

        plexTools
          .getAlbumTracks(plexBaseUrl, libraryId, albumId, accessToken)
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
        console.log('%c--- plex - getFolderItems ---', 'color:#f9743b;');
        getFolderItemsRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const plexBaseUrl = store.getState().appModel.plexBaseUrl;

        plexTools
          .getFolderItems(plexBaseUrl, libraryId, folderId, accessToken)
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
      console.log('%c--- plex - getAllPlaylists ---', 'color:#f9743b;');
      getAllPlaylistsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllPlaylists(plexBaseUrl, libraryId, accessToken)
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
      console.log('%c--- plex - getPlaylistDetails ---', 'color:#f9743b;');
      getPlaylistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getPlaylistDetails(plexBaseUrl, libraryId, playlistId, accessToken)
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
        console.log('%c--- plex - getPlaylistTracks ---', 'color:#f9743b;');
        getPlaylistTracksRunning = true;
        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        const plexBaseUrl = store.getState().appModel.plexBaseUrl;

        plexTools
          .getPlaylistTracks(plexBaseUrl, libraryId, playlistId, accessToken)
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
      console.log('%c--- plex - getAllCollections ---', 'color:#f9743b;');
      getAllCollectionsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllCollections(plexBaseUrl, libraryId, accessToken)
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
      console.log('%c--- plex - getCollectionItems - ' + typeKey + ' ---', 'color:#f9743b;');
      getCollectionItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getCollectionItems(plexBaseUrl, libraryId, collectionId, typeKey, accessToken)
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
      console.log('%c--- plex - getAllTags - ' + typeKey + ' ---', 'color:#f9743b;');
      getAllTagsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      plexTools
        .getAllTags(plexBaseUrl, libraryId, typeKey, accessToken)
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
      console.log('%c--- plex - getTagItems ---', 'color:#f9743b;');
      getTagItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      plexTools
        .getTagItems(plexBaseUrl, libraryId, tagId, typeKey, accessToken)
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
// SET STAR RATING
// ======================================================================

export const setStarRating = (type, ratingKey, rating) => {
  const plexBaseUrl = store.getState().appModel.plexBaseUrl;
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const sessionId = store.getState().sessionModel.sessionId;
  plexTools
    .setStarRating(plexBaseUrl, accessToken, sessionId, ratingKey, rating)
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
      analyticsEvent('Plex: Set Star Rating');
    })
    .catch((error) => {
      console.error(error);
      analyticsEvent('Error: Plex Set Star Rating');
    });
};

window.setStarRating = setStarRating;

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
  const optionLogPlexPlayback = store.getState().sessionModel.optionLogPlexPlayback;
  if (optionLogPlexPlayback) {
    const plexBaseUrl = store.getState().appModel.plexBaseUrl;
    const accessToken = store.getState().sessionModel.currentServer.accessToken;
    const sessionId = store.getState().sessionModel.sessionId;
    const { trackId, trackKey, duration } = currentTrack || {};
    plexTools
      .logPlaybackStatus(plexBaseUrl, accessToken, sessionId, 'music', trackId, trackKey, state, currentTime, duration)
      .catch((error) => {
        console.error(error);
        analyticsEvent('Error: Plex Update Playback Status');
      });
  }
};

export const logPlaybackQuit = (currentTrack, currentTime) => {
  const optionLogPlexPlayback = store.getState().sessionModel.optionLogPlexPlayback;
  if (optionLogPlexPlayback) {
    const plexBaseUrl = store.getState().appModel.plexBaseUrl;
    const accessToken = store.getState().sessionModel.currentServer.accessToken;
    const sessionId = store.getState().sessionModel.sessionId;
    const { trackId, trackKey, duration } = currentTrack || {};
    plexTools.logPlaybackQuit(
      plexBaseUrl,
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
};
