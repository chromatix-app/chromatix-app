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
  genres: {
    getAllArtistGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=8`,
    getArtistGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=8&genre=${genreId}&excludeFields=${artistExcludes}`,
    getAllAlbumGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=9`,
    getAlbumGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=9&genre=${genreId}&excludeFields=${albumExcludes}`,
  },
  moods: {
    getAllArtistMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=8`,
    getArtistMoodItems: (base, libraryId, moodId) =>
      `${base}/library/sections/${libraryId}/all?type=8&mood=${moodId}&excludeFields=${artistExcludes}`,
    getAllAlbumMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=9`,
    getAlbumMoodItems: (base, libraryId, moodId) =>
      `${base}/library/sections/${libraryId}/all?type=9&mood=${moodId}&excludeFields=${albumExcludes}`,
  },
  styles: {
    getAllArtistStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=8`,
    getArtistStyleItems: (base, libraryId, styleId) =>
      `${base}/library/sections/${libraryId}/all?type=8&style=${styleId}&excludeFields=${artistExcludes}`,
    getAllAlbumStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=9`,
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

export const login = async () => {
  console.log('%c--- plex - login ---', 'color:#f9743b;');
  plexTools
    .login()
    .then((response) => {
      analyticsEvent('Plex: Login Success');
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.plexErrorLogin();
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

const getUserInfo = () => {
  console.log('%c--- plex - getUserInfo ---', 'color:#f9743b;');
  plexTools
    .getUserInfo()
    .then((response) => {
      const currentUser = plexTranspose.transposeUserData(response);
      store.dispatch.appModel.setLoggedIn(currentUser);
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.plexErrorLogin();
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
          store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
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
    store.dispatch.sessionModel.unsetCurrentServer();
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

            // console.log('allLibraries', allLibraries);

            store.dispatch.sessionModel.refreshCurrentLibrary(allLibraries);
            store.dispatch.appModel.setAppState({ allLibraries });
          })
          .catch((error) => {
            console.error(error);
            store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
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

const searchLibrary2 = async (query, searchCounter) => {
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
      store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
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

      fetchDataPromise(endpoint, accessToken, true)
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

export const getArtistDetails = async (libraryId, artistId) => {
  if (!getArtistDetailsRunning) {
    const prevArtistDetails = store.getState().appModel.allArtists?.find((artist) => artist.artistId === artistId);
    if (!prevArtistDetails) {
      console.log('%c--- plex - getArtistDetails ---', 'color:#f9743b;');
      getArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getDetails(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artist = data.MediaContainer.Metadata[0];
      const artistDetails = plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken);

      // console.log('artistDetails', artistDetails);

      store.dispatch.appModel.storeArtistDetails(artistDetails);

      getArtistDetailsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST ALBUMS
// ======================================================================

let getAllArtistAlbumsRunning;

export const getAllArtistAlbums = async (libraryId, artistId) => {
  if (!getAllArtistAlbumsRunning) {
    const prevAllAlbums = store.getState().appModel.allArtistAlbums[libraryId + '-' + artistId];
    if (!prevAllAlbums) {
      console.log('%c--- plex - getAllArtistAlbums ---', 'color:#f9743b;');
      getAllArtistAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getAllAlbums(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistAlbums =
        data.MediaContainer.Metadata?.map((album) =>
          plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('artistAlbums', artistAlbums);

      store.dispatch.appModel.storeArtistAlbums({ libraryId, artistId, artistAlbums });

      getAllArtistAlbumsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST RELATED
// ======================================================================

let getAllArtistRelatedRunning;

export const getAllArtistRelated = async (libraryId, artistId) => {
  if (!getAllArtistRelatedRunning) {
    const prevAllRelated = store.getState().appModel.allArtistRelated[libraryId + '-' + artistId];
    if (!prevAllRelated) {
      console.log('%c--- plex - getAllArtistRelated ---', 'color:#f9743b;');
      getAllArtistRelatedRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getAllRelated(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Hub);

      const artistRelated =
        data.MediaContainer.Hub?.filter(
          (hub) => hub.type === 'album' && hub.Metadata && hub.context && hub.context.includes('hub.artist.albums')
        ).map((hub) => ({
          title: hub.title,
          related: hub.Metadata.map((album) =>
            plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
          ),
        })) || [];

      // console.log('artistRelated', artistRelated);

      store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated });

      getAllArtistRelatedRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST COMPILATION ALBUMS
// ======================================================================

let getAllArtistCompilationAlbumsRunning;

export const getAllArtistCompilationAlbums = async (libraryId, artistId, artistName) => {
  if (!getAllArtistCompilationAlbumsRunning) {
    const prevAllCompilationAlbums = store.getState().appModel.allArtistCompilationAlbums[libraryId + '-' + artistId];
    if (!prevAllCompilationAlbums) {
      console.log('%c--- plex - getAllArtistCompilationAlbums ---', 'color:#f9743b;');
      getAllArtistCompilationAlbumsRunning = true;

      const albumIds = await getAllArtistCompilationAlbumIds(libraryId, artistId, artistName);
      let artistCompilationAlbums = [];

      if (albumIds.length > 0) {
        const allAlbums = store.getState().appModel.allAlbums;

        for (let i in albumIds) {
          const albumId = albumIds[i];

          // Check to see if we already have the album info
          const albumInfo = allAlbums ? allAlbums?.find((album) => album.albumId === albumId) : null;
          if (albumInfo) {
            artistCompilationAlbums.push(albumInfo);
          }

          // If not, get the album details
          if (!albumInfo) {
            await getAlbumDetails(libraryId, albumId);
            const allAlbums2 = store.getState().appModel.allAlbums;
            const albumInfo2 = allAlbums2?.find((album) => album.albumId === albumId);
            if (albumInfo2) {
              artistCompilationAlbums.push(albumInfo2);
            }
          }
        }
      }

      // console.log('artistCompilationAlbums', artistCompilationAlbums);

      store.dispatch.appModel.storeArtistCompilationAlbums({ libraryId, artistId, artistCompilationAlbums });

      getAllArtistCompilationAlbumsRunning = false;
    }
  }
};

const getAllArtistCompilationAlbumIds = async (libraryId, artistId, artistName) => {
  const accessToken = store.getState().sessionModel.currentServer.accessToken;
  const plexBaseUrl = store.getState().appModel.plexBaseUrl;
  const endpoint = endpointConfig.artist.getCompilationTracks(plexBaseUrl, libraryId, artistName);
  const data = await fetchData(endpoint, accessToken);

  // console.log(data.MediaContainer.Metadata);

  const artistCompilationTracks =
    data.MediaContainer.Metadata?.map((track) =>
      plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
    ) || [];

  // get a unique list of album IDs using the albumId key of each track
  const artistCompilationAlbums = [...new Set(artistCompilationTracks.map((track) => track.albumId))];

  // console.log('artistCompilationTracks', artistCompilationTracks);

  return artistCompilationAlbums;
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

      fetchDataPromise(endpoint, accessToken, true)
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

export const getAlbumDetails = async (libraryId, albumId) => {
  if (!getAlbumDetailsRunning) {
    const prevAlbumDetails = store.getState().appModel.allAlbums?.find((album) => album.albumId === albumId);
    if (!prevAlbumDetails) {
      console.log('%c--- plex - getAlbumDetails ---', 'color:#f9743b;');
      getAlbumDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getDetails(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const album = data.MediaContainer.Metadata[0];
      const albumDetails = plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken);

      // console.log('albumDetails', albumDetails);

      store.dispatch.appModel.storeAlbumDetails(albumDetails);

      getAlbumDetailsRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM TRACKS
// ======================================================================

let getAlbumTracksRunning;

export const getAlbumTracks = async (libraryId, albumId) => {
  if (!getAlbumTracksRunning) {
    const prevAlbumTracks = store.getState().appModel.allAlbumTracks[libraryId + '-' + albumId];
    if (!prevAlbumTracks) {
      console.log('%c--- plex - getAlbumTracks ---', 'color:#f9743b;');
      getAlbumTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getTracks(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumTracks =
        data.MediaContainer.Metadata?.map((track) =>
          plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('albumTracks', albumTracks);

      store.dispatch.appModel.storeAlbumTracks({ libraryId, albumId, albumTracks });

      getAlbumTracksRunning = false;
    }
  }
};

// ======================================================================
// GET FOLDER ITEMS
// ======================================================================

let getFolderItemsRunning;

export const getFolderItems = async (folderId) => {
  if (!getFolderItemsRunning) {
    const { libraryId } = store.getState().sessionModel.currentLibrary;
    const prevFolderItems = store.getState().appModel.allFolderItems[libraryId + '-' + folderId];
    if (!prevFolderItems) {
      console.log('%c--- plex - getFolderItems ---', 'color:#f9743b;');
      getFolderItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      const endpoint = endpointConfig.folder.getFolderItems(plexBaseUrl, libraryId, folderId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const folderItems =
        data.MediaContainer.Metadata?.map((item, index) =>
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

      getFolderItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL PLAYLISTS
// ======================================================================

let getAllPlaylistsRunning;

export const getAllPlaylists = async () => {
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
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const allPlaylists =
        data.MediaContainer.Metadata?.map((playlist) =>
          plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('allPlaylists', allPlaylists);

      store.dispatch.appModel.setAppState({ allPlaylists });

      getAllPlaylistsRunning = false;
    }
  }
};

// ======================================================================
// GET PLAYLIST DETAILS
// ======================================================================

let getPlaylistDetailsRunning;

export const getPlaylistDetails = async (libraryId, playlistId) => {
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
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const playlist = data.MediaContainer.Metadata[0];
      const playlistDetails = plexTranspose.transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken);

      // console.log('playlistDetails', playlistDetails);

      store.dispatch.appModel.storePlaylistDetails(playlistDetails);

      getPlaylistDetailsRunning = false;
    }
  }
};

// ======================================================================
// GET PLAYLIST TRACKS
// ======================================================================

let getPlaylistTracksRunning;

export const getPlaylistTracks = async (libraryId, playlistId) => {
  if (!getPlaylistTracksRunning) {
    const prevPlaylistTracks = store.getState().appModel.allPlaylistTracks[libraryId + '-' + playlistId];
    if (!prevPlaylistTracks) {
      console.log('%c--- plex - getPlaylistTracks ---', 'color:#f9743b;');
      getPlaylistTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.playlist.getTracks(plexBaseUrl, playlistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks =
        data.MediaContainer.Metadata?.map((track) =>
          plexTranspose.transposeTrackData(track, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log(playlistTracks);

      store.dispatch.appModel.storePlaylistTracks({ libraryId, playlistId, playlistTracks });

      getPlaylistTracksRunning = false;
    }
  }
};

// ======================================================================
// GET ALL COLLECTIONS
// ======================================================================

let getAllCollectionsRunning;

export const getAllCollections = async () => {
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
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const allCollections =
        data.MediaContainer.Metadata?.filter(
          (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
        ).map((collection) => plexTranspose.transposeCollectionData(collection, libraryId, plexBaseUrl, accessToken)) ||
        [];

      const allArtistCollections = allCollections.filter((collection) => collection.type === 'artist');
      const allAlbumCollections = allCollections.filter((collection) => collection.type === 'album');

      // console.log('allCollections', allCollections);

      store.dispatch.appModel.setAppState({ allArtistCollections, allAlbumCollections });

      getAllCollectionsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST COLLECTION ITEMS
// ======================================================================

let getArtistCollectionItemsRunning;

export const getArtistCollectionItems = async (libraryId, collectionId) => {
  if (!getArtistCollectionItemsRunning) {
    const prevArtistCollectionItems =
      store.getState().appModel.allArtistCollectionItems[libraryId + '-' + collectionId];
    if (!prevArtistCollectionItems) {
      console.log('%c--- plex - getArtistCollectionItems ---', 'color:#f9743b;');
      getArtistCollectionItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistCollectionItems =
        data.MediaContainer.Metadata?.map((artist) =>
          plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('collectionItems', collectionItems);

      store.dispatch.appModel.storeArtistCollectionItems({ libraryId, collectionId, artistCollectionItems });

      getArtistCollectionItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM COLLECTION ITEMS
// ======================================================================

let getAlbumCollectionItemsRunning;

export const getAlbumCollectionItems = async (libraryId, collectionId) => {
  if (!getAlbumCollectionItemsRunning) {
    const prevAlbumCollectionItems = store.getState().appModel.allAlbumCollectionItems[libraryId + '-' + collectionId];
    if (!prevAlbumCollectionItems) {
      console.log('%c--- plex - getAlbumCollectionItems ---', 'color:#f9743b;');
      getAlbumCollectionItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumCollectionItems =
        data.MediaContainer.Metadata?.map((album) =>
          plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('collectionItems', collectionItems);

      store.dispatch.appModel.storeAlbumCollectionItems({ libraryId, collectionId, albumCollectionItems });

      getAlbumCollectionItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ARTIST GENRES
// ======================================================================

let getAllArtistGenresRunning;

export const getAllArtistGenres = async (type) => {
  if (!getAllArtistGenresRunning) {
    const prevAllGenres = store.getState().appModel.allArtistGenres;
    if (!prevAllGenres) {
      console.log('%c--- plex - getAllArtistGenres ---', 'color:#f9743b;');
      getAllArtistGenresRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllArtistGenres(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allArtistGenres =
        data.MediaContainer.Directory?.map((genre) => plexTranspose.transposeGenreData('artist', genre, libraryId)) ||
        [];

      // console.log('allArtistGenres', allArtistGenres);

      store.dispatch.appModel.setAppState({ allArtistGenres });

      getAllArtistGenresRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST GENRE ITEMS
// ======================================================================

let getArtistGenreItemsRunning;

export const getArtistGenreItems = async (libraryId, genreId) => {
  if (!getArtistGenreItemsRunning) {
    const prevGenreItems = store.getState().appModel.allArtistGenreItems[libraryId + '-' + genreId];
    if (!prevGenreItems) {
      console.log('%c--- plex - getArtistGenreItems ---', 'color:#f9743b;');
      getArtistGenreItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getArtistGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistGenreItems =
        data.MediaContainer.Metadata?.map((artist) =>
          plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('artistGenreItems', artistGenreItems);

      store.dispatch.appModel.storeArtistGenreItems({ libraryId, genreId, artistGenreItems });

      getArtistGenreItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ALBUM GENRES
// ======================================================================

let getAllAlbumGenresRunning;

export const getAllAlbumGenres = async (type) => {
  if (!getAllAlbumGenresRunning) {
    const prevAllGenres = store.getState().appModel.allAlbumGenres;
    if (!prevAllGenres) {
      console.log('%c--- plex - getAllAlbumGenres ---', 'color:#f9743b;');
      getAllAlbumGenresRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllAlbumGenres(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allAlbumGenres =
        data.MediaContainer.Directory?.map((genre) => plexTranspose.transposeGenreData('album', genre, libraryId)) ||
        [];

      // console.log('allAlbumGenres', allAlbumGenres);

      store.dispatch.appModel.setAppState({ allAlbumGenres });

      getAllAlbumGenresRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM GENRE ITEMS
// ======================================================================

let getAlbumGenreItemsRunning;

export const getAlbumGenreItems = async (libraryId, genreId) => {
  if (!getAlbumGenreItemsRunning) {
    const prevGenreItems = store.getState().appModel.allAlbumGenreItems[libraryId + '-' + genreId];
    if (!prevGenreItems) {
      console.log('%c--- plex - getAlbumGenreItems ---', 'color:#f9743b;');
      getAlbumGenreItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getAlbumGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumGenreItems =
        data.MediaContainer.Metadata?.map((album) =>
          plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('albumGenreItems', albumGenreItems);

      store.dispatch.appModel.storeAlbumGenreItems({ libraryId, genreId, albumGenreItems });

      getAlbumGenreItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ARTIST MOODS
// ======================================================================

let getAllArtistMoodsRunning;

export const getAllArtistMoods = async (type) => {
  if (!getAllArtistMoodsRunning) {
    const prevAllMoods = store.getState().appModel.allArtistMoods;
    if (!prevAllMoods) {
      console.log('%c--- plex - getAllArtistMoods ---', 'color:#f9743b;');
      getAllArtistMoodsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllArtistMoods(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allArtistMoods =
        data.MediaContainer.Directory?.map((mood) => plexTranspose.transposeMoodData('artist', mood, libraryId)) || [];

      // console.log('allArtistMoods', allArtistMoods);

      store.dispatch.appModel.setAppState({ allArtistMoods });

      getAllArtistMoodsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST MOOD ITEMS
// ======================================================================

let getArtistMoodItemsRunning;

export const getArtistMoodItems = async (libraryId, moodId) => {
  if (!getArtistMoodItemsRunning) {
    const prevMoodItems = store.getState().appModel.allArtistMoodItems[libraryId + '-' + moodId];
    if (!prevMoodItems) {
      console.log('%c--- plex - getArtistMoodItems ---', 'color:#f9743b;');
      getArtistMoodItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getArtistMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistMoodItems =
        data.MediaContainer.Metadata?.map((artist) =>
          plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('artistMoodItems', artistMoodItems);

      store.dispatch.appModel.storeArtistMoodItems({ libraryId, moodId, artistMoodItems });

      getArtistMoodItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ALBUM MOODS
// ======================================================================

let getAllAlbumMoodsRunning;

export const getAllAlbumMoods = async (type) => {
  if (!getAllAlbumMoodsRunning) {
    const prevAllMoods = store.getState().appModel.allAlbumMoods;
    if (!prevAllMoods) {
      console.log('%c--- plex - getAllAlbumMoods ---', 'color:#f9743b;');
      getAllAlbumMoodsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllAlbumMoods(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allAlbumMoods =
        data.MediaContainer.Directory?.map((mood) => plexTranspose.transposeMoodData('album', mood, libraryId)) || [];

      // console.log('allAlbumMoods', allAlbumMoods);

      store.dispatch.appModel.setAppState({ allAlbumMoods });

      getAllAlbumMoodsRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM MOOD ITEMS
// ======================================================================

let getAlbumMoodItemsRunning;

export const getAlbumMoodItems = async (libraryId, moodId) => {
  if (!getAlbumMoodItemsRunning) {
    const prevMoodItems = store.getState().appModel.allAlbumMoodItems[libraryId + '-' + moodId];
    if (!prevMoodItems) {
      console.log('%c--- plex - getAlbumMoodItems ---', 'color:#f9743b;');
      getAlbumMoodItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getAlbumMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumMoodItems =
        data.MediaContainer.Metadata?.map((album) =>
          plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('albumMoodItems', albumMoodItems);

      store.dispatch.appModel.storeAlbumMoodItems({ libraryId, moodId, albumMoodItems });

      getAlbumMoodItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ARTIST STYLES
// ======================================================================

let getAllArtistStylesRunning;

export const getAllArtistStyles = async (type) => {
  if (!getAllArtistStylesRunning) {
    const prevAllStyles = store.getState().appModel.allArtistStyles;
    if (!prevAllStyles) {
      console.log('%c--- plex - getAllArtistStyles ---', 'color:#f9743b;');
      getAllArtistStylesRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllArtistStyles(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allArtistStyles =
        data.MediaContainer.Directory?.map((style) => plexTranspose.transposeStyleData('artist', style, libraryId)) ||
        [];

      // console.log('allArtistStyles', allArtistStyles);

      store.dispatch.appModel.setAppState({ allArtistStyles });

      getAllArtistStylesRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST STYLE ITEMS
// ======================================================================

let getArtistStyleItemsRunning;

export const getArtistStyleItems = async (libraryId, styleId) => {
  if (!getArtistStyleItemsRunning) {
    const prevStyleItems = store.getState().appModel.allArtistStyleItems[libraryId + '-' + styleId];
    if (!prevStyleItems) {
      console.log('%c--- plex - getArtistStyleItems ---', 'color:#f9743b;');
      getArtistStyleItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getArtistStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistStyleItems =
        data.MediaContainer.Metadata?.map((artist) =>
          plexTranspose.transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('artistStyleItems', artistStyleItems);

      store.dispatch.appModel.storeArtistStyleItems({ libraryId, styleId, artistStyleItems });

      getArtistStyleItemsRunning = false;
    }
  }
};

// ======================================================================
// GET ALL ALBUM STYLES
// ======================================================================

let getAllAlbumStylesRunning;

export const getAllAlbumStyles = async (type) => {
  if (!getAllAlbumStylesRunning) {
    const prevAllStyles = store.getState().appModel.allAlbumStyles;
    if (!prevAllStyles) {
      console.log('%c--- plex - getAllAlbumStyles ---', 'color:#f9743b;');
      getAllAlbumStylesRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllAlbumStyles(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Directory);

      const allAlbumStyles =
        data.MediaContainer.Directory?.map((style) => plexTranspose.transposeStyleData('album', style, libraryId)) ||
        [];

      // console.log('allAlbumStyles', allAlbumStyles);

      store.dispatch.appModel.setAppState({ allAlbumStyles });

      getAllAlbumStylesRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM STYLE ITEMS
// ======================================================================

let getAlbumStyleItemsRunning;

export const getAlbumStyleItems = async (libraryId, styleId) => {
  if (!getAlbumStyleItemsRunning) {
    const prevStyleItems = store.getState().appModel.allAlbumStyleItems[libraryId + '-' + styleId];
    if (!prevStyleItems) {
      console.log('%c--- plex - getAlbumStyleItems ---', 'color:#f9743b;');
      getAlbumStyleItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getAlbumStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumStyleItems =
        data.MediaContainer.Metadata?.map((album) =>
          plexTranspose.transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('albumStyleItems', albumStyleItems);

      store.dispatch.appModel.storeAlbumStyleItems({ libraryId, styleId, albumStyleItems });

      getAlbumStyleItemsRunning = false;
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

async function fetchData(endpoint, accessToken) {
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Token': accessToken,
    },
  });

  const data = await response.json();
  return data;
}

function fetchDataPromise(endpoint, accessToken, canBeAborted = false) {
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
}
