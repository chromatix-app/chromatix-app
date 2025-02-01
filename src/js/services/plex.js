// ======================================================================
// IMPORTS
// ======================================================================

import * as plexTools from 'js/services/plexTools';
import {
  transposeArtistData,
  transposeAlbumData,
  transposeFolderData,
  transposePlaylistData,
  transposeTrackData,
  transposeCollectionData,
  transposeGenreData,
  transposeStyleData,
  transposeMoodData,
} from 'js/services/plexTranspose';
import { analyticsEvent } from 'js/utils';
import store from 'js/store/store';

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const mockData = isProduction ? false : false;

const endpointConfig = {
  artist: {
    getAllArtists: (base, libraryId) => `${base}/library/sections/${libraryId}/all?type=8`,
    getDetails: (base, artistId) => `${base}/library/metadata/${artistId}`,
    getAllAlbums: (base, artistId) => `${base}/library/metadata/${artistId}/children?excludeAllLeaves=1`,
    getAllRelated: (base, artistId) =>
      `${base}/library/metadata/${artistId}/related?includeAugmentations=1&includeExternalMetadata=1&includeMeta=1`,
    getCompilationTracks: (base, libraryId, artistName) =>
      `${base}/library/sections/${libraryId}/all?type=10&track.originalTitle=${slugify(
        artistName
      )}&artist.title!=${slugify(artistName)}`,
  },
  album: {
    getAllAlbums: (base, libraryId) => `${base}/library/sections/${libraryId}/all?type=9`,
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
    getItems: (base, collectionId) => `${base}/library/collections/${collectionId}/children`,
  },
  genres: {
    getAllArtistGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=8`,
    getArtistGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=8&genre=${genreId}`,
    getAllAlbumGenres: (base, libraryId) => `${base}/library/sections/${libraryId}/genre?type=9`,
    getAlbumGenreItems: (base, libraryId, genreId) =>
      `${base}/library/sections/${libraryId}/all?type=9&genre=${genreId}`,
  },
  styles: {
    getAllArtistStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=8`,
    getArtistStyleItems: (base, libraryId, styleId) =>
      `${base}/library/sections/${libraryId}/all?type=8&style=${styleId}`,
    getAllAlbumStyles: (base, libraryId) => `${base}/library/sections/${libraryId}/style?type=9`,
    getAlbumStyleItems: (base, libraryId, styleId) =>
      `${base}/library/sections/${libraryId}/all?type=9&style=${styleId}`,
  },
  moods: {
    getAllArtistMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=8`,
    getArtistMoodItems: (base, libraryId, moodId) => `${base}/library/sections/${libraryId}/all?type=8&mood=${moodId}`,
    getAllAlbumMoods: (base, libraryId) => `${base}/library/sections/${libraryId}/mood?type=9`,
    getAlbumMoodItems: (base, libraryId, moodId) => `${base}/library/sections/${libraryId}/all?type=9&mood=${moodId}`,
  },
};

// ======================================================================
// LOAD
// ======================================================================

export const init = () => {
  console.log('%c--- plex - init ---', 'color:#f9743b;');
  plexTools
    .init()
    .then((res) => {
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
    .then((res) => {
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
    .then((res) => {
      // transpose user data
      const currentUser = {
        userId: res['@_id'],
        email: res['email'],
        thumb: res['@_thumb'],
        title: res['@_title'],
        username: res['username'],
      };
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
        .then((res) => {
          // transpose server data
          const allServers = res.map((server) => {
            server.serverId = server.clientIdentifier;
            return server;
          });
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
    await plexTools.getFastestServerConnection(currentServer).then((res) => {
      plexBaseUrl = res.uri;
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
          .then((res) => {
            // transpose library data
            const allLibraries = res
              .filter((library) => library.type === 'artist')
              .map((library) => {
                library.libraryId = library.key;
                return library;
              });

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
// GET ALL ARTISTS
// ======================================================================

let getAllArtistsRunning;

export const getAllArtists = async () => {
  if (!getAllArtistsRunning) {
    const prevAllArtists = store.getState().appModel.allArtists;
    if (!prevAllArtists) {
      getAllArtistsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const mockEndpoint = '/api/artists.json';
      const prodEndpoint = endpointConfig.artist.getAllArtists(plexBaseUrl, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const allArtists =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
        ) || [];

      // console.log('allArtists', allArtists);

      store.dispatch.appModel.setAppState({ allArtists });

      getAllArtistsRunning = false;
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
      getArtistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getDetails(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artist = data.MediaContainer.Metadata[0];
      const artistDetails = transposeArtistData(artist, libraryId, plexBaseUrl, accessToken);

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
      getAllArtistAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getAllAlbums(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistAlbums =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

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
          related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)),
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
    data.MediaContainer.Metadata?.map((track) => transposeTrackData(track, libraryId, plexBaseUrl, accessToken)) || [];

  // get a unique list of album IDs using the albumId key of each track
  const artistCompilationAlbums = [...new Set(artistCompilationTracks.map((track) => track.albumId))];

  // console.log('artistCompilationTracks', artistCompilationTracks);

  return artistCompilationAlbums;
};

// ======================================================================
// GET ALL ALBUMS
// ======================================================================

let getAllAlbumsRunning;

export const getAllAlbums = async () => {
  if (!getAllAlbumsRunning) {
    const prevAllAlbums = store.getState().appModel.allAlbums;
    if (!prevAllAlbums) {
      getAllAlbumsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.album.getAllAlbums(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const allAlbums =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

      // console.log('allAlbums', allAlbums);

      store.dispatch.appModel.setAppState({ allAlbums });

      getAllAlbumsRunning = false;
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
      getAlbumDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getDetails(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const album = data.MediaContainer.Metadata[0];
      const albumDetails = transposeAlbumData(album, libraryId, plexBaseUrl, accessToken);

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
      getAlbumTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getTracks(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumTracks =
        data.MediaContainer.Metadata?.map((track) => transposeTrackData(track, libraryId, plexBaseUrl, accessToken)) ||
        [];

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
      getFolderItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;

      const endpoint = endpointConfig.folder.getFolderItems(plexBaseUrl, libraryId, folderId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const folderItems =
        data.MediaContainer.Metadata?.map((item, index) =>
          transposeFolderData(item, index, libraryId, plexBaseUrl, accessToken)
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

      // Add sortOrder property to each object
      folderItems.forEach((item, index) => {
        item.sortOrder = index;
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
          transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken)
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
      getPlaylistDetailsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.playlist.getDetails(plexBaseUrl, playlistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const playlist = data.MediaContainer.Metadata[0];
      const playlistDetails = transposePlaylistData(playlist, libraryId, plexBaseUrl, accessToken);

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
      getPlaylistTracksRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.playlist.getTracks(plexBaseUrl, playlistId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks =
        data.MediaContainer.Metadata?.map((track) => transposeTrackData(track, libraryId, plexBaseUrl, accessToken)) ||
        [];

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
        ).map((collection) => transposeCollectionData(collection, libraryId, plexBaseUrl, accessToken)) || [];

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
      getArtistCollectionItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistCollectionItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
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
      getAlbumCollectionItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumCollectionItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

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
        data.MediaContainer.Directory?.map((genre) => transposeGenreData('artist', genre, libraryId)) || [];

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
      getArtistGenreItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getArtistGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistGenreItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
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
        data.MediaContainer.Directory?.map((genre) => transposeGenreData('album', genre, libraryId)) || [];

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
      getAlbumGenreItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getAlbumGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumGenreItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

      // console.log('albumGenreItems', albumGenreItems);

      store.dispatch.appModel.storeAlbumGenreItems({ libraryId, genreId, albumGenreItems });

      getAlbumGenreItemsRunning = false;
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
        data.MediaContainer.Directory?.map((style) => transposeStyleData('artist', style, libraryId)) || [];

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
      getArtistStyleItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getArtistStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistStyleItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
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
        data.MediaContainer.Directory?.map((style) => transposeStyleData('album', style, libraryId)) || [];

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
      getAlbumStyleItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getAlbumStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumStyleItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

      // console.log('albumStyleItems', albumStyleItems);

      store.dispatch.appModel.storeAlbumStyleItems({ libraryId, styleId, albumStyleItems });

      getAlbumStyleItemsRunning = false;
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
        data.MediaContainer.Directory?.map((mood) => transposeMoodData('artist', mood, libraryId)) || [];

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
      getArtistMoodItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getArtistMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const artistMoodItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, plexBaseUrl, accessToken)
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
        data.MediaContainer.Directory?.map((mood) => transposeMoodData('album', mood, libraryId)) || [];

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
      getAlbumMoodItemsRunning = true;
      const accessToken = store.getState().sessionModel.currentServer.accessToken;
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getAlbumMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, accessToken);

      // console.log(data.MediaContainer.Metadata);

      const albumMoodItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, accessToken)) ||
        [];

      // console.log('albumMoodItems', albumMoodItems);

      store.dispatch.appModel.storeAlbumMoodItems({ libraryId, moodId, albumMoodItems });

      getAlbumMoodItemsRunning = false;
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

function slugify(text) {
  return (
    text
      // replace ampersands with html entity
      .replace(/&/g, '%26')
      // replace commas with html entity
      .replace(/,/g, '%2C')
  );
}
