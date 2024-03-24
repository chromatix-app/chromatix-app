// ======================================================================
// IMPORTS
// ======================================================================

import store from 'js/store/store';
import { XMLParser } from 'fast-xml-parser';

// ======================================================================
// OPTIONS
// ======================================================================

const appName = 'Alex Dev Plex App';
const clientIdentifier = 'alex_dev_plex_app';
const redirectUrl = 'http://localhost:3000/?plex=true';

// ======================================================================
// INIT
// ======================================================================

//
// LOAD
//

export function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const isFromPlex = urlParams.get('plex');

  if (isFromPlex) {
    window.history.replaceState({}, document.title, window.location.pathname);
    const pinId = window.localStorage.getItem('pinId');
    if (pinId) {
      checkPinStatus(pinId);
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  } else {
    const authToken = window.localStorage.getItem('authToken');
    if (authToken) {
      start();
    } else {
      store.dispatch.appModel.setLoggedOut();
    }
  }
}

//
// LOGIN
//

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
  window.localStorage.setItem('pinId', pinId);

  const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientIdentifier}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
    appName
  )}&forwardUrl=${encodeURIComponent(redirectUrl)}`;

  window.location.href = authAppUrl;
};

//
// LOGIN CALLBACK
//

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
    window.localStorage.setItem('authToken', pinStatusData.authToken);
    window.localStorage.removeItem('pinId');
    start();
  } else {
    // If the PIN is not yet authorized, check again in a few seconds
    setTimeout(() => checkPinStatus(pinId), 5000);
  }
};

//
// GET USER INFO
//

const start = () => {
  getUserInfo();
};

const getUserInfo = async () => {
  const authToken = window.localStorage.getItem('authToken');

  const response = await fetch('https://plex.tv/users/account', {
    headers: {
      'X-Plex-Token': authToken,
    },
  });

  if (!response.ok) {
    console.error('Failed to get user info:', response.statusText);
    window.localStorage.removeItem('authToken');
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

  store.dispatch.appModel.setLoggedIn(jsonObj);

  getAllArtists();
  getAllAlbums();
  getAlbumTracks();
  // getUserServers();
  // getLibraries();
  // getSampleTracks();
};

// const getUserServers = async () => {
//   const authToken = window.localStorage.getItem('authToken');

//   // Get the list of servers
//   const serversResponse = await fetch('https://plex.tv/pms/servers', {
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       'X-Plex-Token': authToken,
//     },
//   });

//   if (!serversResponse.ok) {
//     console.error('Failed to get servers:', serversResponse.statusText);
//     return;
//   }

//   const parser = new DOMParser();
//   const serversData = await serversResponse.text();
//   const serversDoc = parser.parseFromString(serversData, 'text/xml');

//   const servers = Array.from(serversDoc.getElementsByTagName('Server')).map((server) => ({
//     name: server.getAttribute('name'),
//     host: server.getAttribute('host'),
//     port: server.getAttribute('port'),
//   }));

//   console.log('Servers:', servers);
// };

// const getLibraries = async () => {
//   const authToken = window.localStorage.getItem('authToken');
//   const serverHost = '137.220.107.107';
//   const serverPort = '32400';

//   const response = await fetch(`http://${serverHost}:${serverPort}/library/sections`, {
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

export const getAllArtists = async () => {
  const authToken = window.localStorage.getItem('authToken');
  const serverHost = '137.220.107.107';
  const serverPort = '32400';

  const response = await fetch(`http://${serverHost}:${serverPort}/library/sections/20/all`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Token': authToken,
    },
  });

  const data = await response.json();

  // console.log(data.MediaContainer.Metadata);

  const allArtists = data.MediaContainer.Metadata.map((artist) => ({
    id: artist.ratingKey,
    title: artist.title,
    thumb: artist.thumb
      ? `http://${serverHost}:${serverPort}/photo/:/transcode?width=320&height=320&url=${encodeURIComponent(
          'http://localhost:32400' + artist.thumb
        )}&X-Plex-Token=${authToken}`
      : null,
    userRating: artist.userRating,
  }));

  console.log(allArtists);

  store.dispatch.appModel.setState({ allArtists });
};

export const getAllAlbums = async () => {
  const authToken = window.localStorage.getItem('authToken');
  const serverHost = '137.220.107.107';
  const serverPort = '32400';

  const response = await fetch(`http://${serverHost}:${serverPort}/library/sections/20/all?type=9`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Token': authToken,
    },
  });

  const data = await response.json();

  // console.log(data.MediaContainer.Metadata);

  const allAlbums = data.MediaContainer.Metadata.map((album) => ({
    id: album.ratingKey,
    title: album.title,
    artist: album.parentTitle,
    thumb: album.thumb
      ? `http://${serverHost}:${serverPort}/photo/:/transcode?width=320&height=320&url=${encodeURIComponent(
          'http://localhost:32400' + album.thumb
        )}&X-Plex-Token=${authToken}`
      : null,
    userRating: album.userRating,
    link: '/albums/' + album.ratingKey,
  }));

  console.log(allAlbums);

  store.dispatch.appModel.setState({ allAlbums });
};

export const getAlbumTracks = async () => {
  const authToken = window.localStorage.getItem('authToken');
  const serverHost = '137.220.107.107';
  const serverPort = '32400';

  // get all albums for an artist
  // const ratingKey = '149255';
  // const response = await fetch(
  //   `http://${serverHost}:${serverPort}/library/sections/20/all?artist.id=${ratingKey}&type=9`,
  //   {
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //       'X-Plex-Token': authToken,
  //     },
  //   }
  // );

  // get all songs for an album
  const ratingKey = '163528';
  const response = await fetch(`http://${serverHost}:${serverPort}/library/metadata/${ratingKey}/children`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Plex-Token': authToken,
    },
  });

  const data = await response.json();

  console.log(data.MediaContainer.Metadata);

  // const tracks = data.MediaContainer.Metadata.map((track) => ({
  //   name: track.title,
  //   artist: track.grandparentTitle,
  //   image: `http://${serverHost}:${serverPort}${track.thumb}?X-Plex-Token=${authToken}`,
  //   path: `http://${serverHost}:${serverPort}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
  // }));

  // track_list = tracks;
  // loadTrack(track_index);
};
