// ======================================================================
// IMPORTS
// ======================================================================

import CryptoJS from 'crypto-js';
import sha3 from 'crypto-js/sha3';

import config from 'js/_config/config';
// import * as utils from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

const sessionState = {
  sessionId: CryptoJS.lib.WordArray.random(16).toString(),

  currentServer: null,
  currentLibrary: null,

  currentTheme: 'chromatix',
  currentColorBackground: '#021C27',
  currentColorText: '#ffffff',
  currentColorPrimary: '#f7277a',

  accessibilityFocus: false,
  accessibilityContrast: false,

  menuShowIcons: true,
  menuShowAllPlaylists: true,
  menuShowSeparateBrowseSection: true,

  menuOpenLibrary: true,
  menuOpenBrowse: true,
  menuOpenPlaylists: true,

  menuShowArtists: true,
  menuShowAlbums: true,
  menuShowFolders: true,
  menuShowPlaylists: true,
  menuShowArtistCollections: true,
  menuShowAlbumCollections: true,
  menuShowArtistGenres: true,
  menuShowAlbumGenres: true,
  menuShowArtistMoods: true,
  menuShowAlbumMoods: true,
  menuShowArtistStyles: true,
  menuShowAlbumStyles: true,

  optionShowFullTitles: false,
  optionShowStarRatings: true,
  optionLogPlexPlayback: true,

  queueIsVisible: false,
  queueExpandArtwork: true,

  viewArtists: 'grid',
  viewArtistAlbums: 'grid',
  viewAlbums: 'grid',
  viewFolders: 'grid',
  viewPlaylists: 'grid',
  viewArtistCollections: 'grid',
  viewArtistCollectionItems: 'grid',
  viewAlbumCollections: 'grid',
  viewAlbumCollectionItems: 'grid',
  viewArtistGenres: 'grid',
  viewArtistGenreItems: 'grid',
  viewAlbumGenres: 'grid',
  viewAlbumGenreItems: 'grid',
  viewArtistMoods: 'grid',
  viewArtistMoodItems: 'grid',
  viewAlbumMoods: 'grid',
  viewAlbumMoodItems: 'grid',
  viewArtistStyles: 'grid',
  viewArtistStyleItems: 'grid',
  viewAlbumStyles: 'grid',
  viewAlbumStyleItems: 'grid',

  sortArtists: 'title',
  sortArtistAlbums: 'title',
  sortAlbums: 'title',
  sortAlbumTracks: {},
  sortFolders: 'sortOrder',
  sortPlaylists: 'title',
  sortPlaylistTracks: {},
  sortArtistCollections: 'title',
  sortArtistCollectionItems: 'title',
  sortAlbumCollections: 'title',
  sortAlbumCollectionItems: 'title',
  sortArtistGenres: 'title',
  sortArtistGenreItems: 'title',
  sortAlbumGenres: 'title',
  sortAlbumGenreItems: 'title',
  sortArtistMoods: 'title',
  sortArtistMoodItems: 'title',
  sortAlbumMoods: 'title',
  sortAlbumMoodItems: 'title',
  sortArtistStyles: 'title',
  sortArtistStyleItems: 'title',
  sortAlbumStyles: 'title',
  sortAlbumStyleItems: 'title',

  orderArtists: 'asc',
  orderArtistAlbums: 'asc',
  orderAlbums: 'asc',
  orderFolders: 'asc',
  orderPlaylists: 'asc',
  orderArtistCollections: 'asc',
  orderArtistCollectionItems: 'asc',
  orderAlbumCollections: 'asc',
  orderAlbumCollectionItems: 'asc',
  orderArtistGenres: 'asc',
  orderArtistGenreItems: 'asc',
  orderAlbumGenres: 'asc',
  orderAlbumGenreItems: 'asc',
  orderArtistMoods: 'asc',
  orderArtistMoodItems: 'asc',
  orderAlbumMoods: 'asc',
  orderAlbumMoodItems: 'asc',
  orderArtistStyles: 'asc',
  orderArtistStyleItems: 'asc',
  orderAlbumStyles: 'asc',
  orderAlbumStyleItems: 'asc',
};

const playingState = {
  playingVariant: null,
  playingServerId: null,
  playingLibraryId: null,
  playingAlbumId: null,
  playingPlaylistId: null,
  playingOrder: null,
  playingTrackList: null,
  playingTrackCount: null,
  playingTrackIndex: null,
  playingTrackKeys: null,
  playingTrackProgress: 0,

  playingRepeat: false,
  playingShuffle: false,
};

const state = Object.assign({}, sessionState, playingState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setSessionState(rootState, payload) {
    console.log('%c--- setSessionState ---', 'color:#0f60b7');
    return { ...rootState, ...payload };
  },

  //
  // THEME
  //

  setTheme(rootState, payload) {
    return {
      ...rootState,
      currentTheme: payload,
    };
  },

  setColorBackground(rootState, payload) {
    return {
      ...rootState,
      currentColorBackground: payload,
    };
  },

  setColorText(rootState, payload) {
    return {
      ...rootState,
      currentColorText: payload,
    };
  },

  setColorPrimary(rootState, payload) {
    return {
      ...rootState,
      currentColorPrimary: payload,
    };
  },

  //
  // SERVER & LIBRARY
  //

  setCurrentServer(rootState, payload) {
    console.log('%c--- setCurrentServer ---', 'color:#0f60b7');
    return {
      ...rootState,
      currentServer: payload,
      currentLibrary: null,
      ...Object.assign({}, playingState),
    };
  },

  setServerIndex(rootState, payload) {
    // console.log('%c--- setServerIndex ---', 'color:#0f60b7');
    const currentServer = rootState.currentServer;
    const { serverBaseUrlCurrent, serverBaseUrlIndex } = payload;
    // update the currentServer object with the new serverBaseUrl
    const updatedServer = {
      ...currentServer,
      serverBaseUrlCurrent,
      serverBaseUrlIndex,
    };
    return {
      ...rootState,
      currentServer: updatedServer,
    };
  },

  setCurrentLibrary(rootState, payload) {
    console.log('%c--- setCurrentLibrary ---', 'color:#0f60b7');
    return {
      ...rootState,
      currentLibrary: payload,
    };
  },

  refreshCurrentServer(rootState, payload) {
    console.log('%c--- refreshCurrentServer ---', 'color:#0f60b7');
    const currentServerToken = rootState.currentServer ? rootState.currentServer.serverId : null;
    const refreshedServer = payload?.find((server) => server.serverId === currentServerToken);
    if (refreshedServer) {
      return {
        ...rootState,
        currentServer: refreshedServer,
      };
    } else {
      return {
        ...rootState,
        currentServer: null,
        currentLibrary: null,
        ...Object.assign({}, playingState),
      };
    }
  },

  refreshCurrentLibrary(rootState, payload) {
    console.log('%c--- refreshCurrentLibrary ---', 'color:#0f60b7');
    const currentLibraryToken = rootState.currentLibrary ? rootState.currentLibrary.libraryId : null;
    const refreshedLibrary = payload?.find((library) => library.libraryId === currentLibraryToken);
    return {
      ...rootState,
      currentLibrary: refreshedLibrary ? refreshedLibrary : null,
    };
  },

  setPlayingTrackProgress(rootState, payload) {
    // console.log('%c--- setPlayingTrackProgress ---', 'color:#0f60b7');
    return {
      ...rootState,
      playingTrackProgress: payload,
    };
  },

  unloadTrack(rootState, payload) {
    console.log('%c--- unloadTrack ---', 'color:#0f60b7');
    return {
      ...rootState,
      ...Object.assign({}, playingState),
    };
  },

  queueVisibleToggle(rootState, payload) {
    // console.log('%c--- queueVisibleToggle ---', 'color:#0f60b7');
    return {
      ...rootState,
      queueIsVisible: !rootState.queueIsVisible,
    };
  },

  setSortList(rootState, payload) {
    const { variant, sortKey } = payload;
    const sortIndex = 'sort' + variant.charAt(0).toUpperCase() + variant.slice(1);
    const orderIndex = 'order' + variant.charAt(0).toUpperCase() + variant.slice(1);
    const currentSortKey = rootState[sortIndex];
    const currentOrderKey = rootState[orderIndex];
    let newSortKey = sortKey;
    let newOrderKey = 'asc';
    if (sortKey === currentSortKey) {
      if (currentOrderKey === 'asc') {
        // reverse the sort order
        newOrderKey = 'desc';
      } else {
        // reset to default values
        newSortKey = sessionState[sortIndex];
        newOrderKey = sessionState[orderIndex];
      }
    }
    return {
      ...rootState,
      [sortIndex]: newSortKey,
      [orderIndex]: newOrderKey,
    };
  },

  setSortTracks(rootState, payload) {
    const { variant, sortId, sortKey } = payload;
    const sortType = variant === 'albumTracks' ? 'sortAlbumTracks' : 'sortPlaylistTracks';
    const sortTracks = rootState[sortType];
    const currentSortValue = sortTracks[sortId] || null;
    let currentSortArray;
    let currentSortKey;
    let currentSortDirection;
    let newSortValue = null;

    if (currentSortValue) {
      currentSortArray = currentSortValue.split('-');
      currentSortKey = currentSortArray[0];
      currentSortDirection = currentSortArray[1];
    }

    if (sortKey === 'sortOrder') {
      if (!currentSortValue) {
        newSortValue = 'sortOrder-desc';
      }
    } else {
      if (currentSortValue) {
        if (sortKey === currentSortKey && currentSortDirection === 'asc') {
          // if there is a current sort key, and it is the same as the new sort key, and it is ascending
          newSortValue = sortKey + '-desc';
        } else if (sortKey !== currentSortKey) {
          // if there is a current sort key, and it is different from the new sort key
          newSortValue = sortKey + '-asc';
        }
      } else {
        // if there is no current sort key
        newSortValue = sortKey + '-asc';
      }
    }

    // add a secondary sort key for albums
    if (newSortValue && sortKey === 'album') {
      newSortValue += '-trackNumber-asc';
    }

    return {
      ...rootState,
      [sortType]: {
        ...sortTracks,
        [sortId]: newSortValue,
      },
    };
  },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => ({
  loadLocalStorage(payload, rootState) {
    console.log('%c--- loadLocalStorage ---', 'color:#0f60b7');
    let localStorageState = { ...sessionState };
    // attempt to retrieve the current user's session state from local storage
    const loggedIn = rootState.appModel.loggedIn;
    if (loggedIn) {
      const userName = rootState.appModel.currentUser.userId;
      const userHash = sha3('music' + userName, { outputLength: 224 }).toString();
      const sessionKey = config.sessionStoreKey + '-' + userHash;
      try {
        localStorageState = localStorage.getItem(sessionKey) ? JSON.parse(localStorage.getItem(sessionKey)) : {};
        // NOTE: bug fix - cleaning up some data that should never have been saved here
        if (localStorageState.appModel) {
          delete localStorageState.appModel;

          if (localStorageState.persistentModel) {
            delete localStorageState.persistentModel;
          }
          if (localStorageState.playerModel) {
            delete localStorageState.playerModel;
          }
          if (localStorageState.sessionModel) {
            delete localStorageState.sessionModel;
          }
        }
      } catch (error) {
        // browser does not support local storage, or local storage item does not exist
      }
    }
    dispatch.sessionModel.setSessionState({
      ...localStorageState,
    });
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#0f60b7');
    dispatch.sessionModel.setSessionState({
      ...Object.assign({}, sessionState),
      ...Object.assign({}, playingState),
    });
  },

  unsetCurrentServer(payload, rootState) {
    console.log('%c--- unsetCurrentServer ---', 'color:#0f60b7');
    dispatch.sessionModel.setSessionState({
      currentServer: null,
      currentLibrary: null,
      ...Object.assign({}, playingState),
    });
    dispatch.appModel.clearPlexServerState();
  },

  switchCurrentServer(payload, rootState) {
    console.log('%c--- switchCurrentServer ---', 'color:#0f60b7');
    const currentServer = rootState.sessionModel.currentServer;
    const currentServerId = currentServer ? currentServer.serverId : null;
    if (currentServerId !== payload) {
      // TODO
      const newServer = rootState.appModel.allServers.find((server) => server.serverId === payload);
      // TODO: what if currentServer is null?
      dispatch.sessionModel.setSessionState({
        // pretty sure "...rootState" wasn't supposed to be here and causes way too much data to be cached
        // ...rootState,
        currentServer: newServer,
        currentLibrary: null,
        ...Object.assign({}, playingState),
      });
      dispatch.appModel.clearPlexServerState();
      dispatch.persistentModel.clearHistoryState();
    }
  },

  switchCurrentLibrary(payload, rootState) {
    console.log('%c--- switchCurrentLibrary ---', 'color:#0f60b7');
    const currentLibrary = rootState.sessionModel.currentLibrary;
    const currentLibraryId = currentLibrary ? currentLibrary.libraryId : null;
    if (currentLibraryId !== payload) {
      const newLibrary = rootState.appModel.allLibraries.find((library) => library.libraryId === payload);
      // TODO: what if currentLibrary is null?
      dispatch.sessionModel.setSessionState({
        currentLibrary: newLibrary,
      });
      dispatch.appModel.clearPlexLibraryState();
      dispatch.persistentModel.clearHistoryState();
    }
  },
});

// ======================================================================
// EXPORT
// ======================================================================

export const sessionModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
