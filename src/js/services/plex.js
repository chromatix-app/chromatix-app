// ======================================================================
// IMPORTS
// ======================================================================

import { XMLParser } from 'fast-xml-parser';
import store from 'js/store/store';

// https://www.plexopedia.com/plex-media-server/api/library/chromatix-albums-tracks/

// https://ide.geeksforgeeks.org/online-html-editor/T3gdWUn4aX

// Artist Albums
// https://192-168-1-201.6b3f9dff67f64b3aab29466ce77a1194.plex.direct:32400/library/sections/20/all
// ?album.subformat!=Compilation,Live
// &artist.id=158100
// &group=title
// &limit=100
// &ratingCount%3E=1
// &resolveTags=1
// &sort=ratingCount:desc
// &type=10

// Artist Related
// https://192-168-1-201.6b3f9dff67f64b3aab29466ce77a1194.plex.direct:32400/library/metadata/158100/related
// ?includeAugmentations=1
// &includeExternalMetadata=1
// &includeMeta=1

// Artist Nearest
// https://192-168-1-201.6b3f9dff67f64b3aab29466ce77a1194.plex.direct:32400/library/metadata/158100/nearest
// ?limit=30
// &maxDistance=0.25
// &excludeParentID=-1
// &includeMeta=1

// Playlists
// type: 15
// sectionID: 20
// playlistType: audio
// includeCollections: 1
// includeExternalMedia: 1
// includeAdvanced: 1
// includeMeta: 1

// ======================================================================
// OPTIONS
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';

const appName = 'Chromatix';
const clientIdentifier = 'chromatix.app';
const clientIcon = 'https://chromatix.app/icon/icon-512.png';

const currentProtocol = window.location.protocol + '//';

const redirectUrlLocal = currentProtocol + 'localhost:3000?plex=true';
const redirectUrlProd = 'https://chromatix.app?plex=true';
const redirectUrlActual = isProduction ? redirectUrlProd : redirectUrlLocal;

const thumbSize = 480;

// ======================================================================
// LOAD
// ======================================================================

export function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const isFromPlex = urlParams.get('plex');

  if (isFromPlex) {
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
}

// ======================================================================
// LOGIN
// ======================================================================

export const login = async () => {
  console.log('%c--- plex - login ---', 'color:#f9743b;');
  const pinResponse = await fetch('https://plex.tv/api/v2/pins', {
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

  if (!pinResponse.ok) {
    console.error('Failed to generate PIN:', pinResponse.statusText);
    return;
  }

  const pinData = await pinResponse.json();
  const pinId = pinData.id;
  const pinCode = pinData.code;

  // Store the pinId in the local storage
  window.localStorage.setItem('chromatix-pin-id', pinId);

  const authAppUrl = `https://app.plex.tv/auth#?clientID=${clientIdentifier}&code=${pinCode}&context%5Bdevice%5D%5Bproduct%5D=${encodeURIComponent(
    appName
  )}&forwardUrl=${encodeURIComponent(redirectUrlActual)}`;

  window.location.href = authAppUrl;
};

// ======================================================================
// LOGIN CALLBACK
// ======================================================================

const checkPinStatus = async (pinId) => {
  console.log('%c--- plex - checkPinStatus ---', 'color:#f9743b;');
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
    window.localStorage.setItem('chromatix-auth-token', pinStatusData.authToken);
    window.localStorage.removeItem('chromatix-pin-id');
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
  console.log('%c--- plex - logout ---', 'color:#f9743b;');
  window.localStorage.removeItem('chromatix-auth-token');
  store.dispatch.appModel.setLoggedOut();
};

// ======================================================================
// GET USER INFO
// ======================================================================

const getUserInfo = async () => {
  console.log('%c--- plex - getUserInfo ---', 'color:#f9743b;');
  const authToken = window.localStorage.getItem('chromatix-auth-token');

  const response = await fetch('https://plex.tv/users/account', {
    headers: {
      'X-Plex-Token': authToken,
    },
  });

  if (!response.ok) {
    console.error('Failed to get user info:', response.statusText);
    window.localStorage.removeItem('chromatix-auth-token');
    store.dispatch.appModel.setLoggedOut();
    return;
  }

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
};

// ======================================================================
// GET USER SERVERS
// ======================================================================

// let getUserServersRunning;

// export const getAllServers = async () => {
//   if (!getUserServersRunning) {
//     const prevAllServers = store.getState().appModel.allServers;
//     if (!prevAllServers) {
//       console.log('%c--- plex - getAllServers ---', 'color:#f9743b;');
//       getUserServersRunning = true;
//       const authToken = window.localStorage.getItem('chromatix-auth-token');

//       const response = await fetch('https://plex.tv/pms/servers?includeHttps=1', {
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//           'X-Plex-Token': authToken,
//         },
//       });

//       if (!response.ok) {
//         // TODO
//       }

//       const data = await response.text();

//       // parse the XML response
//       const parser = new DOMParser();
//       const parsedData = parser.parseFromString(data, 'text/xml');

//       const allServers = Array.from(parsedData.getElementsByTagName('Server')).map((server) => {
//         const serverObj = {};
//         for (let i = 0; i < server.attributes.length; i++) {
//           serverObj[server.attributes[i].name] = server.attributes[i].value;
//         }
//         serverObj.serverId = serverObj.machineIdentifier;
//         serverObj.serverBaseUrl = `${serverObj.scheme}://${serverObj.address}:${serverObj.port}`;
//         serverObj.serverArtUrl = `${serverObj.scheme}://localhost:${serverObj.port}`;
//         return serverObj;
//       });

//       console.log('allServers', allServers);

//       store.dispatch.appModel.setAppState({ allServers });
//       store.dispatch.sessionModel.refreshCurrentServer(allServers);

//       getUserServersRunning = false;

//     }
//   }
// };

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');

      const response = await fetch('https://plex.tv/api/v2/resources?includeHttps=1', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
          'X-Plex-Client-Identifier': 'chromatix.app',
        },
      });

      if (!response.ok) {
        // TODO
      }

      const data = await response.json();

      // console.log(data);

      const allServers = data
        .filter((resource) => resource.provides === 'server')
        .map((resource) => {
          const connectionLocal = resource.connections.filter((connection) => connection.local);
          const connectionRemote = resource.connections.filter((connection) => !connection.local);
          delete resource.connections;
          resource.serverId = resource.clientIdentifier;
          resource.serverBaseUrl = connectionRemote[0].uri;
          resource.serverArtUrl = `${connectionLocal[0].protocol}://localhost:${connectionLocal[0].port}`;
          return resource;
        });

      // console.log('allServers', allServers);

      store.dispatch.appModel.setAppState({ allServers });
      store.dispatch.sessionModel.refreshCurrentServer(allServers);

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
        const authToken = window.localStorage.getItem('chromatix-auth-token');
        const { serverBaseUrl } = currentServer;

        const response = await fetch(`${serverBaseUrl}/library/sections`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        });

        if (!response.ok) {
          // TODO
        }

        const data = await response.json();

        // console.log(data.MediaContainer.Directory);

        const allLibraries = data.MediaContainer.Directory.filter((library) => library.type === 'artist');

        // add a libraryId to each library
        allLibraries.forEach((library) => {
          library.libraryId = library.key;
          // library.thumb = library.composite
          //   ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
          //       `${serverArtUrl}${library.composite}`
          //     )}&X-Plex-Token=${authToken}`
          //   : null;
        });

        // console.log('allLibraries', allLibraries);

        store.dispatch.appModel.setAppState({ allLibraries });
        store.dispatch.sessionModel.refreshCurrentLibrary(allLibraries);

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
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const response = await fetch(`${serverBaseUrl}/library/sections/${libraryId}/all`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allArtists =
        data.MediaContainer.Metadata?.map((artist) => ({
          artistId: artist.ratingKey,
          title: artist.title,
          country: artist?.Country?.[0]?.tag,
          genre: artist?.Genre?.[0]?.tag,
          userRating: artist.userRating,
          link: '/artists/' + artist.ratingKey,
          thumb: artist.thumb
            ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${serverArtUrl}${artist.thumb}`
              )}&X-Plex-Token=${authToken}`
            : null,
        })) || [];

      // console.log('allArtists', allArtists);

      store.dispatch.appModel.setAppState({ allArtists });

      getAllArtistsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST ALBUMS
// ======================================================================

let getAllArtistAlbumsRunning;

export const getAllArtistAlbums = async (artistId) => {
  if (!getAllArtistAlbumsRunning) {
    const prevAllAlbums = store.getState().appModel.allArtistAlbums[artistId];
    if (!prevAllAlbums) {
      getAllArtistAlbumsRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;
      // const {libraryId} = store.getState().sessionModel.currentLibrary;

      const response = await fetch(
        // `${serverBaseUrl}/library/sections/${libraryId}/all?artist.id=${artistId}&type=9&album.subformat!=Compilation,Live`,
        `${serverBaseUrl}/library/metadata/${artistId}/children?excludeAllLeaves=1`,
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

      const artistAlbums =
        data.MediaContainer.Metadata?.map((album) => ({
          albumId: album.ratingKey,
          title: album.title,
          artist: album.parentTitle,
          userRating: album.userRating,
          releaseDate: album.originallyAvailableAt,
          link: '/albums/' + album.ratingKey,
          thumb: album.thumb
            ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${serverArtUrl}${album.thumb}`
              )}&X-Plex-Token=${authToken}`
            : null,
        })) || [];

      // console.log('artistAlbums', artistAlbums);

      store.dispatch.appModel.storeArtistAlbums({ artistId, artistAlbums });

      getAllArtistAlbumsRunning = false;
    }
  }
};

// ======================================================================
// GET ARTIST RELATED
// ======================================================================

let getAllArtistRelatedRunning;

export const getAllArtistRelated = async (artistId) => {
  if (!getAllArtistRelatedRunning) {
    const prevAllRelated = store.getState().appModel.allArtistRelated[artistId];
    if (!prevAllRelated) {
      getAllArtistRelatedRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;

      const response = await fetch(
        `${serverBaseUrl}/library/metadata/${artistId}/related?includeAugmentations=1&includeExternalMetadata=1&includeMeta=1`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Plex-Token': authToken,
          },
        }
      );

      const data = await response.json();

      // console.log(data.MediaContainer.Hub);

      const artistRelated =
        data.MediaContainer.Hub?.filter((hub) => hub.type === 'album' && hub.Metadata).map((hub) => ({
          title: hub.title,
          related: hub.Metadata.map((album) => ({
            albumId: album.ratingKey,
            title: album.title,
            artist: album.parentTitle,
            userRating: album.userRating,
            releaseDate: album.originallyAvailableAt,
            link: '/albums/' + album.ratingKey,
            thumb: album.thumb
              ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                  `${serverArtUrl}${album.thumb}`
                )}&X-Plex-Token=${authToken}`
              : null,
          })),
        })) || [];

      // console.log('artistRelated', artistRelated);

      store.dispatch.appModel.storeArtistRelated({ artistId, artistRelated });

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
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const response = await fetch(`${serverBaseUrl}/library/sections/${libraryId}/all?type=9`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allAlbums =
        data.MediaContainer.Metadata?.map((album) => ({
          albumId: album.ratingKey,
          title: album.title,
          artist: album.parentTitle,
          artistId: album.parentRatingKey,
          userRating: album.userRating,
          releaseDate: album.originallyAvailableAt,
          link: '/albums/' + album.ratingKey,
          thumb: album.thumb
            ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${serverArtUrl}${album.thumb}`
              )}&X-Plex-Token=${authToken}`
            : null,
        })) || [];

      // console.log('allAlbums', allAlbums);

      store.dispatch.appModel.setAppState({ allAlbums });

      getAllAlbumsRunning = false;
    }
  }
};

// ======================================================================
// GET ALBUM TRACKS
// ======================================================================

let getAlbumTracksRunning;

export const getAlbumTracks = async (albumId) => {
  if (!getAlbumTracksRunning) {
    const prevAlbumTracks = store.getState().appModel.allAlbumTracks[albumId];
    if (!prevAlbumTracks) {
      getAlbumTracksRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;

      const response = await fetch(`${serverBaseUrl}/library/metadata/${albumId}/children`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const albumTracks =
        data.MediaContainer.Metadata?.map((track) => ({
          trackId: track.ratingKey,
          title: track.title,
          artist: track.grandparentTitle,
          album: track.parentTitle,
          trackNumber: track.index,
          discNumber: track.parentIndex,
          duration: track.Media[0].duration,
          userRating: track.userRating,
          thumb: track.thumb
            ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${serverArtUrl}${track.thumb}`
              )}&X-Plex-Token=${authToken}`
            : null,
          src: `${serverBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,

          // determine if an album is a normal album, single, live album or compilation
          // albumType: track.parentTitle,
        })) || [];

      // console.log('albumTracks', albumTracks);

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
      console.log('%c--- plex - getAllPlaylists ---', 'color:#f9743b;');
      getAllPlaylistsRunning = true;
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;
      const { libraryId } = store.getState().sessionModel.currentLibrary;

      const response = await fetch(`${serverBaseUrl}/playlists?playlistType=audio&sectionID=${libraryId}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const allPlaylists =
        data.MediaContainer.Metadata?.map((playlist) => {
          const playlistThumb = playlist.thumb ? playlist.thumb : playlist.composite ? playlist.composite : null;
          return {
            playlistId: playlist.ratingKey,
            title: playlist.title,
            link: '/playlists/' + playlist.ratingKey,
            totalTracks: playlist.leafCount,
            thumb: playlistThumb
              ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                  `${serverArtUrl}${playlistThumb}`
                )}&X-Plex-Token=${authToken}`
              : null,
          };
        }) || [];

      // console.log('allPlaylists', allPlaylists);

      store.dispatch.appModel.setAppState({ allPlaylists });

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
      const authToken = window.localStorage.getItem('chromatix-auth-token');
      const { serverBaseUrl, serverArtUrl } = store.getState().sessionModel.currentServer;

      const response = await fetch(`${serverBaseUrl}/playlists/${playlistId}/items`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Plex-Token': authToken,
        },
      });

      const data = await response.json();

      // console.log(data.MediaContainer.Metadata);

      const playlistTracks =
        data.MediaContainer.Metadata?.map((track) => ({
          trackId: track.ratingKey,
          title: track.title,
          artist: track.grandparentTitle,
          album: track.parentTitle,
          trackNumber: track.index,
          discNumber: track.parentIndex,
          duration: track.duration,
          userRating: track.userRating,
          thumb: track.thumb
            ? `${serverBaseUrl}/photo/:/transcode?width=${thumbSize}&height=${thumbSize}&url=${encodeURIComponent(
                `${serverArtUrl}${track.thumb}`
              )}&X-Plex-Token=${authToken}`
            : null,
          src: `${serverBaseUrl}${track.Media[0].Part[0].key}?X-Plex-Token=${authToken}`,
        })) || [];

      // console.log(playlistTracks);

      store.dispatch.appModel.storePlaylistTracks({ playlistId, playlistTracks });

      getPlaylistTracksRunning = false;
    }
  }
};
