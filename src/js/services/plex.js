// ======================================================================
// IMPORTS
// ======================================================================

import { track } from '@vercel/analytics';

import config from 'js/_config/config';
import * as plexTools from 'js/services/plexTools';
import store from 'js/store/store';

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const mockData = isProduction ? false : false;
const thumbSize = 480;

const storageTokenKey = config.storageTokenKey;

const endpointConfig = {
  server: {
    getAllServers: () => 'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1&includeIPv6=1',
  },
  library: {
    getAllLibraries: (base) => `${base}/library/sections`,
  },
  artist: {
    getAllArtists: (base, libraryId) => `${base}/library/sections/${libraryId}/all?type=8`,
    getDetails: (base, artistId) => `${base}/library/metadata/${artistId}`,
    getAllAlbums: (base, artistId) => `${base}/library/metadata/${artistId}/children?excludeAllLeaves=1`,
    getAllRelated: (base, artistId) =>
      `${base}/library/metadata/${artistId}/related?includeAugmentations=1&includeExternalMetadata=1&includeMeta=1`,
  },
  album: {
    getAllAlbums: (base, libraryId) => `${base}/library/sections/${libraryId}/all?type=9`,
    getDetails: (base, albumId) => `${base}/library/metadata/${albumId}`,
    getTracks: (base, albumId) => `${base}/library/metadata/${albumId}/children`,
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
          track('Error: Plex Init - No Pin ID');
        } else if (error?.code === 'checkPlexPinStatus.2') {
          track('Error: Plex Init - Pin Check Failed');
        } else {
          track('Error: Plex Init - Unknown Error');
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
      track('Plex: Login Success');
    })
    .catch((error) => {
      console.error(error);
      store.dispatch.appModel.plexErrorLogin();
      track('Plex: Login Error');
    });
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  console.log('%c--- plex - logout ---', 'color:#f9743b;');
  plexTools.logout();
  store.dispatch.appModel.setLoggedOut();
  track('Plex: Logout');
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
      track('Error: Plex Get User Info');
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
          track('Error: Plex Get All Servers');
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
    track('Error: Plex Get Fastest Server Connection');
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

        plexTools
          .getAllLibraries(plexBaseUrl)
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
            track('Error: Plex Get All Libraries');
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const mockEndpoint = '/api/artists.json';
      const prodEndpoint = endpointConfig.artist.getAllArtists(plexBaseUrl, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allArtists =
        data.MediaContainer.Metadata?.map((artist) => transposeArtistData(artist, libraryId, plexBaseUrl, authToken)) ||
        [];

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getDetails(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artist = data.MediaContainer.Metadata[0];
      const artistDetails = transposeArtistData(artist, libraryId, plexBaseUrl, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getAllAlbums(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistAlbums =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.artist.getAllRelated(plexBaseUrl, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Hub);

      const artistRelated =
        data.MediaContainer.Hub?.filter((hub) => hub.type === 'album' && hub.Metadata).map((hub) => ({
          title: hub.title,
          related: hub.Metadata.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)),
        })) || [];

      // console.log('artistRelated', artistRelated);

      store.dispatch.appModel.storeArtistRelated({ libraryId, artistId, artistRelated });

      getAllArtistRelatedRunning = false;
    }
  }
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.album.getAllAlbums(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allAlbums =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getDetails(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const album = data.MediaContainer.Metadata[0];
      const albumDetails = transposeAlbumData(album, libraryId, plexBaseUrl, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.album.getTracks(plexBaseUrl, albumId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumTracks =
        data.MediaContainer.Metadata?.map((track) => transposeTrackData(track, libraryId, plexBaseUrl, authToken)) ||
        [];

      // console.log('albumTracks', albumTracks);

      store.dispatch.appModel.storeAlbumTracks({ libraryId, albumId, albumTracks });

      getAlbumTracksRunning = false;
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const mockEndpoint = '/api/playlists.json';
      const prodEndpoint = endpointConfig.playlist.getAllPlaylists(plexBaseUrl, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allPlaylists =
        data.MediaContainer.Metadata?.map((playlist) =>
          transposePlaylistData(playlist, libraryId, plexBaseUrl, authToken)
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.playlist.getDetails(plexBaseUrl, playlistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const playlist = data.MediaContainer.Metadata[0];
      const playlistDetails = transposePlaylistData(playlist, libraryId, plexBaseUrl, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.playlist.getTracks(plexBaseUrl, playlistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks =
        data.MediaContainer.Metadata?.map((track) => transposeTrackData(track, libraryId, plexBaseUrl, authToken)) ||
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
    const prevAllCollections = store.getState().appModel.allCollections;
    if (!prevAllCollections) {
      console.log('%c--- plex - getAllCollections ---', 'color:#f9743b;');
      getAllCollectionsRunning = true;
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.collection.getAllCollections(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allCollections =
        data.MediaContainer.Metadata?.filter(
          (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
        ).map((collection) => transposeCollectionData(collection, libraryId, plexBaseUrl, authToken)) || [];

      // console.log('allCollections', allCollections);

      store.dispatch.appModel.setAppState({ allCollections });

      getAllCollectionsRunning = false;
    }
  }
};

// ======================================================================
// GET COLLECTION ITEMS
// ======================================================================

let getCollectionItemsRunning;

export const getCollectionItems = async (libraryId, collectionId, collectionType) => {
  if (!getCollectionItemsRunning) {
    const prevCollectionItems = store.getState().appModel.allCollectionItems[libraryId + '-' + collectionId];
    if (!prevCollectionItems) {
      getCollectionItemsRunning = true;
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.collection.getItems(plexBaseUrl, collectionId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      let collectionItems;

      if (collectionType === 'artist') {
        collectionItems =
          data.MediaContainer.Metadata?.map((artist) =>
            transposeArtistData(artist, libraryId, plexBaseUrl, authToken)
          ) || [];
      } else if (collectionType === 'album') {
        collectionItems =
          data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
          [];
      }

      // console.log('collectionItems', collectionType, collectionItems);

      store.dispatch.appModel.storeCollectionItems({ libraryId, collectionId, collectionItems });

      getCollectionItemsRunning = false;
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllArtistGenres(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getArtistGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistGenreItems =
        data.MediaContainer.Metadata?.map((artist) => transposeArtistData(artist, libraryId, plexBaseUrl, authToken)) ||
        [];

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllAlbumGenres(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.genres.getAlbumGenreItems(plexBaseUrl, libraryId, genreId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumGenreItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllArtistStyles(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getArtistStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistStyleItems =
        data.MediaContainer.Metadata?.map((artist) => transposeArtistData(artist, libraryId, plexBaseUrl, authToken)) ||
        [];

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllAlbumStyles(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.styles.getAlbumStyleItems(plexBaseUrl, libraryId, styleId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumStyleItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllArtistMoods(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getArtistMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistMoodItems =
        data.MediaContainer.Metadata?.map((artist) => transposeArtistData(artist, libraryId, plexBaseUrl, authToken)) ||
        [];

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllAlbumMoods(plexBaseUrl, libraryId);
      const data = await fetchData(endpoint, authToken);

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
      const authToken = plexTools.getLocalStorage(storageTokenKey);
      const plexBaseUrl = store.getState().appModel.plexBaseUrl;
      const endpoint = endpointConfig.moods.getAlbumMoodItems(plexBaseUrl, libraryId, moodId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumMoodItems =
        data.MediaContainer.Metadata?.map((album) => transposeAlbumData(album, libraryId, plexBaseUrl, authToken)) ||
        [];

      // console.log('albumMoodItems', albumMoodItems);

      store.dispatch.appModel.storeAlbumMoodItems({ libraryId, moodId, albumMoodItems });

      getAlbumMoodItemsRunning = false;
    }
  }
};

// ======================================================================
// FETCH DATA
// ======================================================================

async function fetchData(endpoint, authToken) {
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Token': authToken,
    },
  });

  const data = await response.json();
  return data;
}

// ======================================================================
// TRANSPOSE PLEX DATA
// ======================================================================

/*
We are transposing the Plex data to a format that is easier to work with in the app,
and doing some additional processing and validation.
*/

const transposeArtistData = (artist, libraryId, plexBaseUrl, authToken) => {
  return {
    libraryId: libraryId,
    artistId: artist.ratingKey,
    title: artist.title,
    country: artist?.Country?.[0]?.tag,
    genre: artist?.Genre?.[0]?.tag,
    userRating: artist.userRating,
    link: '/artists/' + libraryId + '/' + artist.ratingKey,
    thumb: artist.thumb
      ? mockData
        ? artist.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            artist.thumb
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposeAlbumData = (album, libraryId, plexBaseUrl, authToken) => {
  return {
    libraryId: libraryId,
    albumId: album.ratingKey,
    title: album.title,
    artist: album.parentTitle,
    artistId: album.parentRatingKey,
    artistLink: '/artists/' + libraryId + '/' + album.parentRatingKey,
    userRating: album.userRating,
    releaseDate: album.originallyAvailableAt,
    link: '/albums/' + libraryId + '/' + album.ratingKey,
    thumb: album.thumb
      ? mockData
        ? album.thumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            album.thumb
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposePlaylistData = (playlist, libraryId, plexBaseUrl, authToken) => {
  const playlistThumb = playlist.thumb ? playlist.thumb : playlist.composite ? playlist.composite : null;
  return {
    libraryId: libraryId,
    playlistId: playlist.ratingKey,
    title: playlist.title,
    link: '/playlists/' + libraryId + '/' + playlist.ratingKey,
    totalTracks: playlist.leafCount,
    duration: playlist.duration,
    thumb: playlistThumb
      ? mockData
        ? playlistThumb
        : `${plexBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            playlistThumb
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposeTrackData = (track, libraryId, plexBaseUrl, authToken) => {
  return {
    libraryId: track.librarySectionID,
    trackId: track.ratingKey,
    title: track.title,
    artist: track.grandparentTitle,
    artistLink: '/artists/' + track.librarySectionID + '/' + track.grandparentRatingKey,
    album: track.parentTitle,
    albumLink: '/albums/' + track.librarySectionID + '/' + track.parentRatingKey,
    trackNumber: track.index,
    discNumber: track.parentIndex,
    duration: track.Media[0].duration,
    userRating: track.userRating,
    thumb: track.thumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
          track.thumb
        )}&X-Plex-Token=${authToken}`
      : null,
    src: `${plexBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
  };
};

const transposeCollectionData = (collection, libraryId, plexBaseUrl, authToken) => {
  const collectionThumb = collection.thumb ? collection.thumb : collection.composite ? collection.composite : null;
  return {
    libraryId: libraryId,
    collectionId: collection.ratingKey,
    title: collection.title,
    userRating: collection.userRating,
    type: collection.subtype,
    link:
      (collection.subtype === 'artist' ? '/artist-collections/' : '/album-collections/') +
      libraryId +
      '/' +
      collection.ratingKey,
    thumb: collectionThumb
      ? `${plexBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
          collectionThumb
        )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposeGenreData = (type, genre, libraryId) => {
  return {
    libraryId: libraryId,
    genreId: genre.key,
    title: genre.title.replace(/\//g, ' & '),
    link: '/' + type + '-genres/' + libraryId + '/' + genre.key,
  };
};

const transposeStyleData = (type, style, libraryId) => {
  return {
    libraryId: libraryId,
    styleId: style.key,
    title: style.title.replace(/\//g, ' & '),
    link: '/' + type + '-styles/' + libraryId + '/' + style.key,
  };
};

const transposeMoodData = (type, mood, libraryId) => {
  return {
    libraryId: libraryId,
    moodId: mood.key,
    title: mood.title.replace(/\//g, ' & '),
    link: '/' + type + '-moods/' + libraryId + '/' + mood.key,
  };
};
