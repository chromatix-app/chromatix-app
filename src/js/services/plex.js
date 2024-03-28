// ======================================================================
// IMPORTS
// ======================================================================

import store from 'js/store/store';
import { XMLParser } from 'fast-xml-parser';

// https://www.plexopedia.com/plex-media-server/api/library/music-albums-tracks/

// https://ide.geeksforgeeks.org/online-html-editor/T3gdWUn4aX

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const appName = 'Alex Dev Plex App';
const clientIdentifier = 'alex_dev_plex_app';
const redirectUrlLocal = 'http://localhost:3000?plex=true';
const redirectUrlProd = 'https://chromatix.app?plex=true';
const redirectUrlActual = isProduction ? redirectUrlProd : redirectUrlLocal;

const plexServerProtocol = isProduction ? 'https://' : 'http://';
const plexServerHost = '137.220.107.107';
const plexServerPort = '32400';
const plexServerArtPath = `${plexServerProtocol}localhost:32400`;
const plexLibraryId = '20';

const thumbSize = 480;

// ======================================================================
// LOAD
// ======================================================================

export function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const isFromPlex = urlParams.get('plex');

  if (isFromPlex) {
    window.history.replaceState({}, document.title, window.location.pathname);
    const pinId = window.localStorage.getItem('music-pinId');
    if (pinId) {
      checkPinStatus(pinId);
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  } else {
    const authToken = window.localStorage.getItem('music-authToken');

    if (authToken) {
      getUserInfo();
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  }
}

// ======================================================================
// LOGIN
// ======================================================================

export const login = async () => {
  const pinResponse = await fetch('https://plex.tv/api/v2/pins', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Product': appName,
      'X-Plex-Client-Identifier': clientIdentifier,
    },
    body: JSON.stringify({ strong: true }),
  });

  if (!pinResponse.ok) {
    console.error('Failed to generate PIN:', pinResponse.statusText);
    return;
  }

  const pinData = await pinResponse.json();
  const pinId = pinData.id;
  const pinCode = pinData.code;

  // Store the pinId in the local storage
  window.localStorage.setItem('music-pinId', pinId);

  const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientIdentifier}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
    appName
  )}&forwardUrl=${encodeURIComponent(redirectUrlActual)}`;

  window.location.href = authAppUrl;
};

// ======================================================================
// LOGIN CALLBACK
// ======================================================================

const checkPinStatus = async (pinId) => {
  const pinStatusResponse = await fetch(`https://plex.tv/api/v2/pins/${pinId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Plex-Client-Identifier': clientIdentifier,
    },
  });

  if (!pinStatusResponse.ok) {
    console.error('Failed to check PIN status:', pinStatusResponse.statusText);
    return;
  }

  const pinStatusData = await pinStatusResponse.json();

  if (pinStatusData.authToken) {
    // Store the authToken in the local storage
    window.localStorage.setItem('music-authToken', pinStatusData.authToken);
    window.localStorage.removeItem('music-pinId');
    getUserInfo();
  } else {
    // If the PIN is not yet authorized, check again in a second
    setTimeout(() => checkPinStatus(pinId), 1000);
  }
};

// ======================================================================
// LOGOUT
// ======================================================================

export const logout = () => {
  window.localStorage.removeItem('music-authToken');
  store.dispatch.appModel.setLoggedOut();
};

// ======================================================================
// GET USER INFO
// ======================================================================

const getUserInfo = async () => {
  const authToken = window.localStorage.getItem('music-authToken');

  const response = await fetch('https://plex.tv/users/account', {
    headers: {
      'X-Plex-Token': authToken,
    },
  });

  if (!response.ok) {
    console.error('Failed to get user info:', response.statusText);
    window.localStorage.removeItem('music-authToken');
    store.dispatch.appModel.setLoggedOut();
    return;
  }

  const data = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const jsonObj = parser.parse(data).user;

  // console.log(jsonObj);

  const currentUser = {
    email: jsonObj['email'],
    id: jsonObj['@_id'],
    thumb: jsonObj['@_thumb'],
    title: jsonObj['@_title'],
    username: jsonObj['username'],
  };

  console.log(currentUser);

  store.dispatch.appModel.setLoggedIn(currentUser);
};

// ======================================================================
// GET USER SERVERS
// ======================================================================

let getUserServersRunning;

export const getAllServers = async () => {
  if (!getUserServersRunning) {
    const prevAllServers = store.getState().appModel.allServers;
    if (!prevAllServers) {
      getUserServersRunning = true;
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch('https://plex.tv/pms/servers', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.text();

      // parse the XML response
      const parser = new DOMParser();
      const parsedData = parser.parseFromString(data, 'text/xml');

      const allServers = Array.from(parsedData.getElementsByTagName('Server')).map((server) => ({
        name: server.getAttribute('name'),
        host: server.getAttribute('host'),
        port: server.getAttribute('port'),
      }));

      console.log(allServers);

      store.dispatch.appModel.setState({ allServers });

      getUserServersRunning = false;
    }
  }
};

// ======================================================================
// GET USER LIBRARIES
// ======================================================================

// const getAllLibraries = async () => {
//   const authToken = window.localStorage.getItem('music-authToken');
//   const plexServerHost = '137.220.107.107';
//   const plexServerPort = '32400';

//   const response = await fetch(`${plexServerProtocol}${plexServerHost}:${plexServerPort}/library/sections`, {
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       'X-Plex-Token': authToken,
//     },
//   });

//   if (!response.ok) {
//     console.error('Failed to get libraries:', response.statusText);
//     return;
//   }

//   const data = await response.json();
//   const libraries = data.MediaContainer.Directory.map((library) => ({
//     key: library.key,
//     type: library.type,
//     title: library.title,
//   }));

//   console.log('Libraries:', libraries);
//   return libraries;
// };

// ======================================================================
// GET ALL ARTISTS
// ======================================================================

let getAllArtistsRunning;

export const getAllArtists = async () => {
  if (!getAllArtistsRunning) {
    const prevAllArtists = store.getState().appModel.allArtists;
    if (!prevAllArtists) {
      getAllArtistsRunning = true;
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch(
        `${plexServerProtocol}${plexServerHost}:${plexServerPort}/library/sections/${plexLibraryId}/all`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        }
      );

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allArtists = data.MediaContainer.Metadata?.map((artist) => ({
        id: artist.ratingKey,
        title: artist.title,
        thumb: artist.thumb
          ? `${plexServerProtocol}${plexServerHost}:${plexServerPort}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
              `${plexServerArtPath}${artist.thumb}`
            )}&X-Plex-Token=${authToken}`
          : null,
        userRating: artist.userRating,
        link: '/artists/' + artist.ratingKey,
      }));

      store.dispatch.appModel.setState({ allArtists });

      getAllArtistsRunning = false;
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
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch(
        `${plexServerProtocol}${plexServerHost}:${plexServerPort}/library/sections/${plexLibraryId}/all?type=9`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        }
      );

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allAlbums = data.MediaContainer.Metadata?.map((album) => ({
        id: album.ratingKey,
        title: album.title,
        artist: album.parentTitle,
        thumb: album.thumb
          ? `${plexServerProtocol}${plexServerHost}:${plexServerPort}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
              `${plexServerArtPath}${album.thumb}`
            )}&X-Plex-Token=${authToken}`
          : null,
        userRating: album.userRating,
        releaseDate: album.originallyAvailableAt,
        link: '/albums/' + album.ratingKey,
      }));

      store.dispatch.appModel.setState({ allAlbums });

      getAllAlbumsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST ALBUMS
// ======================================================================

// get all albums for an artist
// const ratingKey = '149255';
// const response = await fetch(
//   `${plexServerProtocol}${plexServerHost}:${plexServerPort}/library/sections/${plexLibraryId}/all?artist.id=${ratingKey}&type=9`,
//   {
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       'X-Plex-Token': authToken,
//     },
//   }
// );

// ======================================================================
// GET ALBUM TRACKS
// ======================================================================

let getAlbumTracksRunning;

export const getAlbumTracks = async (albumId) => {
  if (!getAlbumTracksRunning) {
    const prevAlbumTracks = store.getState().appModel.allAlbumTracks[albumId];
    if (!prevAlbumTracks) {
      getAlbumTracksRunning = true;
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch(
        `${plexServerProtocol}${plexServerHost}:${plexServerPort}/library/metadata/${albumId}/children`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        }
      );

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const albumTracks = data.MediaContainer.Metadata?.map((track) => ({
        title: track.title,
        artist: track.grandparentTitle,
        album: track.parentTitle,
        trackNumber: track.index,
        discNumber: track.parentIndex,
        duration: track.Media[0].duration,
        userRating: track.userRating,
        image: `${plexServerProtocol}${plexServerHost}:${plexServerPort}${track.thumb}?X-Plex-Token=${authToken}`,
        path: `${plexServerProtocol}${plexServerHost}:${plexServerPort}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
      }));

      store.dispatch.appModel.storeAlbumTracks({ albumId, albumTracks });

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
      getAllPlaylistsRunning = true;
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch(`${plexServerProtocol}${plexServerHost}:${plexServerPort}/playlists`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allPlaylists = data.MediaContainer.Metadata?.filter((playlist) => playlist.playlistType === 'audio') // Filter out only music playlists
        .map((playlist) => ({
          id: playlist.ratingKey,
          title: playlist.title,
          thumb: playlist.composite
            ? `${plexServerProtocol}${plexServerHost}:${plexServerPort}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${plexServerArtPath}${playlist.composite}`
              )}&X-Plex-Token=${authToken}`
            : null,
          link: '/playlists/' + playlist.ratingKey,
        }));

      store.dispatch.appModel.setState({ allPlaylists });

      getAllPlaylistsRunning = false;
    }
  }
};

// ======================================================================
// GET PLAYLIST TRACKS
// ======================================================================

let getPlaylistTracksRunning;

export const getPlaylistTracks = async (playlistId) => {
  if (!getPlaylistTracksRunning) {
    const prevPlaylistTracks = store.getState().appModel.allPlaylistTracks[playlistId];
    if (!prevPlaylistTracks) {
      getPlaylistTracksRunning = true;
      const authToken = window.localStorage.getItem('music-authToken');

      const response = await fetch(
        `${plexServerProtocol}${plexServerHost}:${plexServerPort}/playlists/${playlistId}/items`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        }
      );

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks = data.MediaContainer.Metadata?.map((track) => ({
        title: track.title,
        artist: track.grandparentTitle,
        album: track.parentTitle,
        trackNumber: track.index,
        discNumber: track.parentIndex,
        duration: track.duration,
        userRating: track.userRating,
        image: `${plexServerProtocol}${plexServerHost}:${plexServerPort}${track.thumb}?X-Plex-Token=${authToken}`,
        path: `${plexServerProtocol}${plexServerHost}:${plexServerPort}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
      }));

      store.dispatch.appModel.storePlaylistTracks({ playlistId, playlistTracks });

      getPlaylistTracksRunning = false;
    }
  }
};
