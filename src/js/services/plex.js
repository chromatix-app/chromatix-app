// ======================================================================
// IMPORTS
// ======================================================================

import * as plexTools from 'js/services/plexTools';
import * as plexTranspose from 'js/services/plexTranspose';
import { analyticsEvent } from 'js/utils';
import store from 'js/store/store';

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const mockData = isProduction ? false : false;

const artistExcludes = 'summary,guid,key,parentRatingKey,parentTitle,skipCount';
const albumExcludes =
  'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,parentThumb,studio';
const artistAndAlbumExcludes =
  'summary,guid,key,loudnessAnalysisVersion,musicAnalysisVersion,parentGuid,parentKey,skipCount,studio';

const endpointConfig = {
  artist: {
    getAllArtists: (base, libraryId) =>
      `${base}/library/sections/${libraryId}/all?type=8&excludeFields=${artistExcludes}`,
    getDetails: (base, artistId) => `${base}/library/metadata/${artistId}`,
    getAllAlbums: (base, artistId) =>
      `${base}/library/metadata/${artistId}/children?excludeAllLeaves=1&excludeFields=summary`,
    getAllRelated: (base, artistId) => `${base}/library/metadata/${artistId}/related?excludeFields=summary`,
    getCompilationTracks: (base, libraryId, artistName) =>
      `${base}/library/sections/${libraryId}/all?type=10&track.originalTitle=${encodeURIComponent(
        artistName
      )}&artist.title!=${encodeURIComponent(artistName)}&excludeFields=summary`,
  },
  album: {
    getAllAlbums: (base, libraryId) =>
      `${base}/library/sections/${libraryId}/all?type=9&excludeFields=${albumExcludes}`,
    getDetails: (base, albumId) => `${base}/library/metadata/${albumId}`,
    getTracks: (base, albumId) => `${base}/library/metadata/${albumId}/children`,
  },
  folder: {
    getFolderItems: (base, libraryId, folderId) => `${base}/library/sections/${libraryId}/folder?parent=${folderId}`,
  },
  playlist: {
    getAllPlaylists: (base, libraryId) => `${base}/playlists?playlistType=audio&sectionID=${libraryId}`,
    getDetails: (base, playlistId) => `${base}/playlists/${playlistId}`,
    getTracks: (base, playlistId) => `${base}/playlists/${playlistId}/items`,
  },
  collection: {
    getAllCollections: (base, libraryId) => `${base}/library/sections/${libraryId}/collections`,
    getItems: (base, collectionId) =>
      `${base}/library/collections/${collectionId}/children?excludeFields=${artistAndAlbumExcludes}`,
  },
  sets: {
    getAllArtistGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=8`,
    getAllArtistMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=8`,
    getAllArtistStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=8`,

    getAllAlbumGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=9`,
    getAllAlbumMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=9`,
    getAllAlbumStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=9`,

    getArtistGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=8&genre=${genreId}&excludeFields=${artistExcludes}`,
    getArtistMoodItems: (base, libraryId, moodId) =>
      `${base}/library/sections/${libraryId}/all?type=8&mood=${moodId}&excludeFields=${artistExcludes}`,
    getArtistStyleItems: (base, libraryId, styleId) =>
      `${base}/library/sections/${libraryId}/all?type=8&style=${styleId}&excludeFields=${artistExcludes}`,

    getAlbumGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=9&genre=${genreId}&excludeFields=${albumExcludes}`,
    getAlbumMoodItems: (base, libraryId, moodId) =>
      `${base}/library/sections/${libraryId}/all?type=9&mood=${moodId}&excludeFields=${albumExcludes}`,
    getAlbumStyleItems: (base, libraryId, styleId) =>
      `${base}/library/sections/${libraryId}/all?type=9&style=${styleId}&excludeFields=${albumExcludes}`,
  },
};

// ======================================================================
// LOAD
// ======================================================================

export const init = () => {
  console.log('%c--- plex - init ---', 'color:#f9743b;');
  plexTools
    .init()
    .then((response) => {
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
    .then((response) => {
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
      const currentUser = plexTranspose.transposeUserData(response);
      store.dispatch.appModel.setLoggedIn(currentUser);
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
          const allServers = response?.map((server) => plexTranspose.transposeServerData(server)) || [];
          store.dispatch.appModel.storeAllServers(allServers);
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

const getFastestServerConnection = async (currentServer) => {
  let plexBaseUrl;
  try {
    await plexTools.getFastestServerConnection(currentServer).then((response) => {
      plexBaseUrl = response.uri;
      store.dispatch.appModel.setAppState({ plexBaseUrl });
    });
  } catch (error) {
    console.error(error);
    store.dispatch.appModel.setAppState({ errorPlexFastestServer: true });
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
          plexBaseUrl = await getFastestServerConnection(currentServer);
        } catch (error) {
          getUserLibrariesRunning = false;
          return;
        }

        const accessToken = store.getState().sessionModel.currentServer.accessToken;
        plexTools
          .getAllLibraries(plexBaseUrl, accessToken)
          .then((response) => {
            // transpose library data
            const allLibraries = response
              .filter((library) => library.type === 'artist')
              .map((library) => plexTranspose.transposeLibraryData(library));
            store.dispatch.sessionModel.refreshCurrentLibrary(allLibraries);
            store.dispatch.appModel.setAppState({ allLibraries });
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
// SEARCH LIBRARY
// ======================================================================

let searchCounter = 0;

export const searchLibrary = (query) => {
  searchCounter += 1;
  searchLibrary2(query, searchCounter);
};

const searchLibrary2 = (query, searchCounter) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const plexBaseUrl = store.getState().appModel.plexBaseUrl;
  const { libraryId, title } = store.getState().sessionModel.currentLibrary;

  const typeOrder = {
    artist: 1,
    album: 2,
    playlist: 3,
    'artist collection': 4,
    'album collection': 5,
    track: 6,
  };

  plexTools
    .searchHub(plexBaseUrl, libraryId, accessToken, query)
    // .searchLibrary(plexBaseUrl, accessToken, query)
    .then((response) => {
      // console.log(response);

      const searchResults =
        response
          ?.flatMap((result) => result.Metadata)
          ?.map((result) => plexTranspose.transposeHubSearchData(result, libraryId, title, plexBaseUrl, accessToken))
          // .map((result) => plexTranspose.transposeLibrarySearchData(result, libraryId, title, plexBaseUrl, accessToken))
          .filter((result) => result !== null)
          .sort((a, b) => {
            if (b.score === a.score) {
              if (a.type === b.type) {
                return a.title.localeCompare(b.title);
              }
              return typeOrder[a.type] - typeOrder[b.type];
            }
            return b.score - a.score;
          }) || [];

      // console.log(searchResults);

      const searchResultCounter = store.getState().appModel.searchResultCounter;
      if (searchCounter > searchResultCounter) {
        store.dispatch.appModel.setAppState({
          searchResults,
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

window.searchLibrary = searchLibrary;

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

      const mockEndpoint = '/api/artists.json';
      const prodEndpoint = endpointConfig.artist.getAllArtists(plexBaseUrl, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const allArtists =
            response.MediaContainer.Metadata?.map((artist) =>
              plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
            ) || [];

          // console.log('allArtists', allArtists);

          store.dispatch.appModel.setAppState({
            haveGotAllArtists: true,
            allArtists,
          });
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.artist.getDetails(plexBaseUrl, artistId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const artist = response.MediaContainer.Metadata[0];
          const artistDetails = plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken);

          // console.log('artistDetails', artistDetails);

          store.dispatch.appModel.storeArtistDetails(artistDetails);
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.artist.getAllAlbums(plexBaseUrl, artistId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const artistAlbums =
            response.MediaContainer.Metadata?.map((album) =>
              plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
            ) || [];

          // console.log('artistAlbums', artistAlbums);

          store.dispatch.appModel.storeArtistAlbums({ libraryId, artistId, artistAlbums });
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.artist.getAllRelated(plexBaseUrl, artistId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Hub);

          const artistRelated =
            response.MediaContainer.Hub?.filter(
              (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
            ).map((hub) => ({
              title: hub.title,
              related: hub.Metadata.map((album) =>
                plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
              ),
            })) || [];

          // console.log('artistRelated', artistRelated);

          store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated });
        })
        .catch((error) => {})
        .finally(() => {
          getAllArtistRelatedRunning = false;
        });
    }
  }
};

// ======================================================================
// GET ARTIST COMPILATION ALBUMS
// ======================================================================

let getAllArtistCompilationAlbumsRunning;

export const getAllArtistCompilationAlbums = (libraryId, artistId, artistName) => {
  if (!getAllArtistCompilationAlbumsRunning) {
    const prevAllCompilationAlbums = store.getState().appModel.allArtistCompilationAlbums[libraryId + '-' + artistId];
    if (!prevAllCompilationAlbums) {
      console.log('%c--- plex - getAllArtistCompilationAlbums ---', 'color:#f9743b;');
      getAllArtistCompilationAlbumsRunning = true;

      getAllArtistCompilationAlbumIds(libraryId, artistName)
        .then((response) => {
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
        .catch((error) => {})
        .finally(() => {
          getAllArtistCompilationAlbumsRunning = false;
        });
    }
  }
};

const getAllArtistCompilationAlbumIds = (libraryId, artistName) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const plexBaseUrl = store.getState().appModel.plexBaseUrl;
  const endpoint = endpointConfig.artist.getCompilationTracks(plexBaseUrl, libraryId, artistName);

  return new Promise((resolve, reject) => {
    fetchDataPromise(endpoint, accessToken)
      .then((response) => {
        // console.log(response.MediaContainer.Metadata);

        const artistCompilationTracks =
          response.MediaContainer.Metadata?.map((track) =>
            plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
          ) || [];

        // get a unique list of album IDs using the albumId key of each track
        const artistCompilationAlbums = [...new Set(artistCompilationTracks.map((track) => track.albumId))];

        // console.log('artistCompilationTracks', artistCompilationTracks);

        resolve(artistCompilationAlbums);
      })
      .catch((error) => {
        reject(error);
      });
  });
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
      const endpoint = endpointConfig.album.getAllAlbums(plexBaseUrl, libraryId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const allAlbums =
            response.MediaContainer.Metadata?.map((album) =>
              plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
            ) || [];

          // console.log('allAlbums', allAlbums);

          store.dispatch.appModel.setAppState({
            haveGotAllAlbums: true,
            allAlbums,
          });
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.album.getDetails(plexBaseUrl, albumId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const album = response.MediaContainer.Metadata[0];
          const albumDetails = plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken);

          // console.log('albumDetails', albumDetails);

          store.dispatch.appModel.storeAlbumDetails(albumDetails);

          if (callback) {
            callback();
          }
        })
        .catch((error) => {})
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
        const endpoint = endpointConfig.album.getTracks(plexBaseUrl, albumId);

        fetchDataPromise(endpoint, accessToken)
          .then((response) => {
            // console.log(response.MediaContainer.Metadata);

            const albumTracks =
              response.MediaContainer.Metadata?.map((track) =>
                plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
              ) || [];

            // console.log('albumTracks', albumTracks);

            store.dispatch.appModel.storeAlbumTracks({ libraryId, albumId, albumTracks });

            resolve();
          })
          .catch((error) => {
            reject();
          })
          .finally(() => {
            getAlbumTracksRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      reject();
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
        const endpoint = endpointConfig.folder.getFolderItems(plexBaseUrl, libraryId, folderId);

        fetchDataPromise(endpoint, accessToken)
          .then((response) => {
            // console.log(response.MediaContainer.Metadata);

            const folderItems =
              response.MediaContainer.Metadata?.map((item, index) =>
                plexTranspose.transposeFolderData(item, index, libraryId, plexBaseUrl, accessToken)
              ).filter((item) => item !== null) || [];

            // Sort folderItems
            folderItems.sort((a, b) => {
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
            folderItems.forEach((item, index) => {
              item.sortOrder = index;
              if (item.kind === 'track') {
                item.trackSortOrder = trackSortOrder;
                trackSortOrder++;
              }
            });

            // console.log('folderItems', folderItems);

            store.dispatch.appModel.storeFolderItems({ libraryId, folderId, folderItems });

            resolve();
          })
          .catch((error) => {
            reject();
          })
          .finally(() => {
            getFolderItemsRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      reject();
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

      const mockEndpoint = '/api/playlists.json';
      const prodEndpoint = endpointConfig.playlist.getAllPlaylists(plexBaseUrl, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const allPlaylists =
            response.MediaContainer.Metadata?.map((playlist) =>
              plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken)
            ) || [];

          // console.log('allPlaylists', allPlaylists);

          store.dispatch.appModel.setAppState({ allPlaylists });
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.playlist.getDetails(plexBaseUrl, playlistId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const playlist = response.MediaContainer.Metadata[0];
          const playlistDetails = plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken);

          // console.log('playlistDetails', playlistDetails);

          store.dispatch.appModel.storePlaylistDetails(playlistDetails);
        })
        .catch((error) => {})
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
        const endpoint = endpointConfig.playlist.getTracks(plexBaseUrl, playlistId);

        fetchDataPromise(endpoint, accessToken)
          .then((response) => {
            // console.log(response.MediaContainer.Metadata);

            const playlistTracks =
              response.MediaContainer.Metadata?.map((track) =>
                plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
              ) || [];

            // console.log(playlistTracks);

            store.dispatch.appModel.storePlaylistTracks({ libraryId, playlistId, playlistTracks });

            resolve();
          })
          .catch((error) => {
            reject();
          })
          .finally(() => {
            getPlaylistTracksRunning = false;
          });
      } else {
        resolve();
      }
    } else {
      reject();
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
      const endpoint = endpointConfig.collection.getAllCollections(plexBaseUrl, libraryId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const allCollections =
            response.MediaContainer.Metadata?.filter(
              (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
            ).map((collection) =>
              plexTranspose.transposeCollectionData(collection, libraryId, plexBaseUrl, accessToken)
            ) || [];

          const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
          const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');

          // console.log('allCollections', allCollections);

          store.dispatch.appModel.setAppState({ allArtistCollections, allAlbumCollections });
        })
        .catch((error) => {})
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
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const collectionItems =
            response.MediaContainer.Metadata?.map((item) =>
              plexTranspose[`transpose${typeKey}Data`](item, libraryId, plexBaseUrl, accessToken)
            ) || [];

          // console.log('collectionItems', collectionItems);

          store.dispatch.appModel[`store${typeKey}CollectionItems`]({
            libraryId,
            collectionId,
            collectionItems,
          });
        })
        .catch((error) => {})
        .finally(() => {
          getCollectionItemsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// GET ALL SETS
// ======================================================================

let getAllSetsRunning = {
  AlbumGenres: false,
  AlbumMoods: false,
  AlbumStyles: false,
  ArtistGenres: false,
  ArtistMoods: false,
  ArtistStyles: false,
};

const setOptions = {
  AlbumGenres: { primaryKey: 'album', secondaryKey: 'Genre' },
  AlbumMoods: { primaryKey: 'album', secondaryKey: 'Mood' },
  AlbumStyles: { primaryKey: 'album', secondaryKey: 'Style' },
  ArtistGenres: { primaryKey: 'artist', secondaryKey: 'Genre' },
  ArtistMoods: { primaryKey: 'artist', secondaryKey: 'Mood' },
  ArtistStyles: { primaryKey: 'artist', secondaryKey: 'Style' },
};

export const getAllSets = (typeKey) => {
  if (!getAllSetsRunning[typeKey]) {
    const prevAllSets = store.getState().appModel[`all${typeKey}`];
    if (!prevAllSets) {
      console.log('%c--- plex - getAllSets - ' + typeKey + ' ---', 'color:#f9743b;');
      getAllSetsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.sets[`getAll${typeKey}`](plexBaseUrl, libraryId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Directory);

          const { primaryKey, secondaryKey } = setOptions[typeKey];

          const allSets =
            response.MediaContainer.Directory?.map((entry) =>
              plexTranspose[`transpose${secondaryKey}Data`](primaryKey, entry, libraryId)
            ) || [];

          // console.log('allSets', allSets);

          store.dispatch.appModel.setAppState({ [`all${typeKey}`]: allSets });
        })
        .catch((error) => {})
        .finally(() => {
          getAllSetsRunning[typeKey] = false;
        });
    }
  }
};

// ======================================================================
// GET SET ITEMS
// ======================================================================

let getSetItemsRunning = {
  AlbumGenreItems: false,
  AlbumMoodItems: false,
  AlbumStyleItems: false,
  ArtistGenreItems: false,
  ArtistMoodItems: false,
  ArtistStyleItems: false,
};

const setItemOptions = {
  AlbumGenreItems: { primaryKey: 'Album' },
  AlbumMoodItems: { primaryKey: 'Album' },
  AlbumStyleItems: { primaryKey: 'Album' },
  ArtistGenreItems: { primaryKey: 'Artist' },
  ArtistMoodItems: { primaryKey: 'Artist' },
  ArtistStyleItems: { primaryKey: 'Artist' },
};

export const getSetItems = (libraryId, setId, typeKey) => {
  if (!getSetItemsRunning[typeKey]) {
    const prevSetItems = store.getState().appModel[`all${typeKey}`][libraryId + '-' + setId];
    if (!prevSetItems) {
      console.log('%c--- plex - getSetItems ---', 'color:#f9743b;');
      getSetItemsRunning[typeKey] = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.sets[`get${typeKey}`](plexBaseUrl, libraryId, setId);

      fetchDataPromise(endpoint, accessToken)
        .then((response) => {
          // console.log(response.MediaContainer.Metadata);

          const { primaryKey } = setItemOptions[typeKey];

          const setItems =
            response.MediaContainer.Metadata?.map((entry) =>
              plexTranspose[`transpose${primaryKey}Data`](entry, libraryId, plexBaseUrl, accessToken)
            ) || [];

          console.log('setItems', setItems);

          store.dispatch.appModel[`store${typeKey}`]({ libraryId, setId, setItems });
        })
        .catch((error) => {})
        .finally(() => {
          getSetItemsRunning[typeKey] = false;
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

// ======================================================================
// FETCH DATA
// ======================================================================

let abortControllers = [];

export const abortAllRequests = () => {
  if (abortControllers.length > 0) {
    console.log('%c### plex - abortAllRequests ###', 'color:#f00;');
    abortControllers.forEach((controller) => {
      controller.abort();
    });
    abortControllers = [];
  }
};

const fetchDataPromise = (endpoint, accessToken, canBeAborted = true) => {
  return new Promise((resolve, reject) => {
    let controller;
    if (canBeAborted) {
      controller = new AbortController();
      abortControllers.push(controller);
    }

    fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Plex-Token': accessToken,
      },
      signal: canBeAborted ? controller.signal : undefined,
    })
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((error) => {
        // Handle aborted request
        if (error.name === 'AbortError') {
          reject({
            code: 'fetchDataPromise.1',
            message: 'Request aborted',
            error: error,
          });
        }
        // Handle all other errors
        else {
          reject({
            code: 'fetchDataPromise.2',
            message: 'Failed to complete fetch request: ' + error.message,
            error: error,
          });
        }
      })
      .finally(() => {
        // Clean up the abort controller
        if (canBeAborted) {
          abortControllers = abortControllers.filter((ctrl) => ctrl !== controller);
        }
      });
  });
};

// const fetchData = async (endpoint, accessToken) => {
//   const response = await fetch(endpoint, {
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       'X-Plex-Token': accessToken,
//     },
//   });

//   const data = await response.json();
//   return data;
// };
