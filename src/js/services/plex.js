// ======================================================================
// IMPORTS
// ======================================================================

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import store from 'js/store/store';

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const mockData = isProduction ? false : false;

const appName = 'Chromatix';
const clientIdentifier = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const currentProtocol = window.location.protocol + '//';
const currentHost = window.location.host;

const redirectUrlLocal = currentProtocol + currentHost + '?plex-login=true';
const redirectUrlProd = 'https://chromatix.app?plex-login=true';
const redirectUrl = isProduction ? redirectUrlProd : redirectUrlLocal;

const thumbSize = 480;

const endpointConfig = {
  auth: {
    login: () => 'https://plex.tv/api/v2/pins',
    pinStatus: (pinId) => `https://plex.tv/api/v2/pins/${pinId}`,
  },
  user: {
    getUserInfo: () => 'https://plex.tv/users/account',
  },
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
  const urlParams = new URLSearchParams(window.location.search);
  const isPlexLogin = urlParams.get('plex-login');

  if (isPlexLogin) {
    window.history.replaceState({}, document.title, window.location.pathname);
    const pinId = window.localStorage.getItem('chromatix-pin-id');
    if (pinId) {
      checkPinStatus(pinId);
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  } else {
    const authToken = window.localStorage.getItem('chromatix-auth-token');
    if (authToken) {
      getUserInfo();
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  }
};

// ======================================================================
// LOGIN
// ======================================================================

export const login = async () => {
  console.log('%c--- plex - login ---', 'color:#f9743b;');
  try {
    const endpoint = endpointConfig.auth.login();
    const pinResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Plex-Product': appName,
        'X-Plex-Client-Identifier': clientIdentifier,
        'X-Plex-Device-Icon': clientIcon,
      },
      body: JSON.stringify({ strong: true }),
    });

    // error handling
    if (!pinResponse.ok) {
      console.error('Failed to generate PIN:', pinResponse.statusText);
      store.dispatch.appModel.plexErrorLogin();
      return;
    }

    // parse the response
    const pinData = await pinResponse.json();
    const pinId = pinData.id;
    const pinCode = pinData.code;

    // store the pinId in the local storage
    window.localStorage.setItem('chromatix-pin-id', pinId);

    // redirect to the Plex login page
    const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientIdentifier}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
      appName
    )}&forwardUrl=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authAppUrl;
  } catch (e) {
    // error handling
    store.dispatch.appModel.plexErrorLogin();
  }
};

// ======================================================================
// LOGIN CALLBACK
// ======================================================================

const checkPinStatus = async (pinId) => {
  console.log('%c--- plex - checkPinStatus ---', 'color:#f9743b;');
  try {
    const endpoint = endpointConfig.auth.pinStatus(pinId);
    const pinStatusResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Plex-Client-Identifier': clientIdentifier,
      },
    });

    // error handling
    if (!pinStatusResponse.ok) {
      console.error('Failed to check PIN status:', pinStatusResponse.statusText);
      store.dispatch.appModel.plexErrorLogin();
      return;
    }

    // parse the response
    const pinStatusData = await pinStatusResponse.json();

    // if valid, store the authToken in the local storage
    if (pinStatusData.authToken) {
      window.localStorage.setItem('chromatix-auth-token', pinStatusData.authToken);
      window.localStorage.removeItem('chromatix-pin-id');
      getUserInfo();
    }

    // if the PIN is not yet authorized, check again in a second
    else {
      setTimeout(() => checkPinStatus(pinId), 1000);
    }
  } catch (e) {
    // error handling
    store.dispatch.appModel.plexErrorLogin();
  }
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  console.log('%c--- plex - logout ---', 'color:#f9743b;');
  window.localStorage.removeItem('chromatix-auth-token');
  store.dispatch.appModel.setLoggedOut();
};

// ======================================================================
// GET USER INFO
// ======================================================================

const getUserInfo = async () => {
  console.log('%c--- plex - getUserInfo ---', 'color:#f9743b;');
  try {
    const authToken = window.localStorage.getItem('chromatix-auth-token');
    const endpoint = endpointConfig.user.getUserInfo();
    const response = await fetch(endpoint, {
      headers: {
        'X-Plex-Token': authToken,
      },
    });

    // error handling
    if (!response.ok) {
      console.error('Failed to get user info:', response.statusText);
      window.localStorage.removeItem('chromatix-auth-token');
      store.dispatch.appModel.setLoggedOut();
      return;
    }

    // parse the response
    const data = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(data).user;

    // console.log(jsonObj);

    const currentUser = {
      userId: jsonObj['@_id'],
      email: jsonObj['email'],
      thumb: jsonObj['@_thumb'],
      title: jsonObj['@_title'],
      username: jsonObj['username'],
    };

    // console.log('currentUser', currentUser);

    store.dispatch.appModel.setLoggedIn(currentUser);
  } catch (e) {
    // error handling
    console.error('Failed to get user info:', e);
    store.dispatch.appModel.plexErrorLogin();
  }
};

// ======================================================================
// GET USER SERVERS
// ======================================================================

let getUserServersRunning;

export const getAllServers = async () => {
  if (!getUserServersRunning) {
    const prevAllResources = store.getState().appModel.allServers;
    if (!prevAllResources) {
      console.log('%c--- plex - getAllServers ---', 'color:#f9743b;');
      getUserServersRunning = true;

      try {
        const authToken = window.localStorage.getItem('chromatix-auth-token');
        const endpoint = endpointConfig.server.getAllServers();
        const response = await fetch(endpoint, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
            'X-Plex-Client-Identifier': 'chromatix.app',
          },
        });

        // error handling
        if (!response.ok) {
          console.error('Failed to get user servers:', response.statusText);
          store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
          return;
        }

        const data = await response.json();

        // console.log(data);

        const allServers = data
          .filter((resource) => resource.provides === 'server')
          .map((resource) => {
            // resource.connections.push(resource.connections.shift());

            const connectionLocal = resource.connections.filter((connection) => connection.local);
            const connectionUrls = resource.connections.map((connection) => connection.uri);
            delete resource.connections;
            resource.serverId = resource.clientIdentifier;
            resource.serverBaseUrls = connectionUrls;
            resource.serverBaseUrlCurrent = connectionUrls[0];
            resource.serverBaseUrlIndex = 0;
            resource.serverBaseUrlTotal = connectionUrls.length;
            resource.serverArtUrl = connectionLocal?.[0]
              ? `${connectionLocal[0].protocol}://localhost:${connectionLocal[0].port}`
              : null;
            return resource;
          });

        // console.log('allServers', allServers);

        store.dispatch.appModel.storeAllServers(allServers);
      } catch (e) {
        // error handling
        console.error('Failed to get user servers:', e);
        store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
      }

      getUserServersRunning = false;
    }
  }
};

// ======================================================================
// GET USER LIBRARIES
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

        // we need to cycle through the serverBaseUrls to find the first one that works
        const { serverBaseUrls, serverBaseUrlCurrent, serverBaseUrlIndex, serverBaseUrlTotal } = currentServer;

        try {
          const authToken = window.localStorage.getItem('chromatix-auth-token');
          const endpoint = endpointConfig.library.getAllLibraries(serverBaseUrlCurrent);
          const response = await axios.get(endpoint, {
            timeout: 5000, // 5 seconds
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Plex-Token': authToken,
            },
          });

          const data = response.data;

          // console.log(data.MediaContainer.Directory);

          const allLibraries = data.MediaContainer.Directory.filter((library) => library.type === 'artist');

          allLibraries.forEach((library) => {
            library.libraryId = library.key;
            // library.thumb = library.composite
            //   ? `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            //       `${serverArtUrl}${library.composite}`
            //     )}&X-Plex-Token=${authToken}`
            //   : null;
          });

          // console.log('allLibraries', allLibraries);

          store.dispatch.sessionModel.refreshCurrentLibrary(allLibraries);
          store.dispatch.appModel.setAppState({ allLibraries });
        } catch (e) {
          // error handling
          console.error('Failed to get user libraries:', e);
          // let's make sure we've tried every connection url before giving up
          if (serverBaseUrlIndex < serverBaseUrlTotal - 1) {
            // retry the request with the next connection url
            console.log('TRY NEXT BASE URL');
            store.dispatch.sessionModel.setServerIndex({
              serverBaseUrlCurrent: serverBaseUrls[serverBaseUrlIndex + 1],
              serverBaseUrlIndex: serverBaseUrlIndex + 1,
            });
            getUserLibrariesRunning = false;
            getAllLibraries();
          } else {
            // default error handling
            if (e.code === 'ECONNABORTED') {
              console.error('Request timed out');
              store.dispatch.sessionModel.unsetCurrentServer();
            } else {
              store.dispatch.appModel.setAppState({ plexErrorGeneral: true });
            }
          }
        }

        getUserLibrariesRunning = false;
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const mockEndpoint = '/api/artists.json';
      const prodEndpoint = endpointConfig.artist.getAllArtists(serverBaseUrlCurrent, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allArtists =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.artist.getDetails(serverBaseUrlCurrent, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artist = data.MediaContainer.Metadata[0];
      const artistDetails = transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken);

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.artist.getAllAlbums(serverBaseUrlCurrent, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistAlbums =
        data.MediaContainer.Metadata?.map((album) =>
          transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      getAllArtistRelatedRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.artist.getAllRelated(serverBaseUrlCurrent, artistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Hub);

      const artistRelated =
        data.MediaContainer.Hub?.filter((hub) => hub.type === 'album' && hub.Metadata).map((hub) => ({
          title: hub.title,
          related: hub.Metadata.map((album) =>
            transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
          ),
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.album.getAllAlbums(serverBaseUrlCurrent, libraryId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allAlbums =
        data.MediaContainer.Metadata?.map((album) =>
          transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.album.getDetails(serverBaseUrlCurrent, albumId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const album = data.MediaContainer.Metadata[0];
      const albumDetails = transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken);

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.album.getTracks(serverBaseUrlCurrent, albumId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumTracks =
        data.MediaContainer.Metadata?.map((track) =>
          transposeTrackData(track, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const mockEndpoint = '/api/playlists.json';
      const prodEndpoint = endpointConfig.playlist.getAllPlaylists(serverBaseUrlCurrent, libraryId);
      const endpoint = mockData ? mockEndpoint : prodEndpoint;
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allPlaylists =
        data.MediaContainer.Metadata?.map((playlist) =>
          transposePlaylistData(playlist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.playlist.getDetails(serverBaseUrlCurrent, playlistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const playlist = data.MediaContainer.Metadata[0];
      const playlistDetails = transposePlaylistData(playlist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken);

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.playlist.getTracks(serverBaseUrlCurrent, playlistId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks =
        data.MediaContainer.Metadata?.map((track) =>
          transposeTrackData(track, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
    const prevAllCollections = store.getState().appModel.allCollections;
    if (!prevAllCollections) {
      console.log('%c--- plex - getAllCollections ---', 'color:#f9743b;');
      getAllCollectionsRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.collection.getAllCollections(serverBaseUrlCurrent, libraryId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const allCollections =
        data.MediaContainer.Metadata?.filter(
          (collection) => collection.subtype === 'artist' || collection.subtype === 'album'
        ).map((collection) =>
          transposeCollectionData(collection, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.collection.getItems(serverBaseUrlCurrent, collectionId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      let collectionItems;

      if (collectionType === 'artist') {
        collectionItems =
          data.MediaContainer.Metadata?.map((artist) =>
            transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
          ) || [];
      } else if (collectionType === 'album') {
        collectionItems =
          data.MediaContainer.Metadata?.map((album) =>
            transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
          ) || [];
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllArtistGenres(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.genres.getArtistGenreItems(serverBaseUrlCurrent, libraryId, genreId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistGenreItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.genres.getAllAlbumGenres(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.genres.getAlbumGenreItems(serverBaseUrlCurrent, libraryId, genreId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumGenreItems =
        data.MediaContainer.Metadata?.map((album) =>
          transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllArtistStyles(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.styles.getArtistStyleItems(serverBaseUrlCurrent, libraryId, styleId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistStyleItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.styles.getAllAlbumStyles(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.styles.getAlbumStyleItems(serverBaseUrlCurrent, libraryId, styleId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumStyleItems =
        data.MediaContainer.Metadata?.map((album) =>
          transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllArtistMoods(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.moods.getArtistMoodItems(serverBaseUrlCurrent, libraryId, moodId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const artistMoodItems =
        data.MediaContainer.Metadata?.map((artist) =>
          transposeArtistData(artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;
      const endpoint = endpointConfig.moods.getAllAlbumMoods(serverBaseUrlCurrent, libraryId);
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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrlCurrent, serverArtUrl } = store.getState().sessionModel.currentServer;
      const endpoint = endpointConfig.moods.getAlbumMoodItems(serverBaseUrlCurrent, libraryId, moodId);
      const data = await fetchData(endpoint, authToken);

      // console.log(data.MediaContainer.Metadata);

      const albumMoodItems =
        data.MediaContainer.Metadata?.map((album) =>
          transposeAlbumData(album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken)
        ) || [];

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

const transposeArtistData = (artist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken) => {
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
        : `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            `${serverArtUrl}${artist.thumb}`
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposeAlbumData = (album, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken) => {
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
        : `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            `${serverArtUrl}${album.thumb}`
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposePlaylistData = (playlist, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken) => {
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
        : `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
            `${serverArtUrl}${playlistThumb}`
          )}&X-Plex-Token=${authToken}`
      : null,
  };
};

const transposeTrackData = (track, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken) => {
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
      ? `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
          `${serverArtUrl}${track.thumb}`
        )}&X-Plex-Token=${authToken}`
      : null,
    src: `${serverBaseUrlCurrent}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
  };
};

const transposeCollectionData = (collection, libraryId, serverBaseUrlCurrent, serverArtUrl, authToken) => {
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
      ? `${serverBaseUrlCurrent}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
          `${serverArtUrl}${collectionThumb}`
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
