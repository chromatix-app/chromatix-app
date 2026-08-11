// ======================================================================
// IMPORTS
// ======================================================================

import sha3 from 'crypto-js/sha3';

import config from 'js/_config/config';
import * as bridge from 'js/services/bridge';
import { analyticsEvent, migrateSessionState } from 'js/utils';

// ======================================================================
// STATE
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';
const isPreview = import.meta.env.VITE_ENV === 'preview';
const isProduction = import.meta.env.VITE_ENV === 'production';

const sessionState = {
  sessionId: Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''),

  savedAppVersion: '0.0.0',

  currentUser: null,
  currentServer: null,
  currentLibrary: null,

  volumeLevel: 100,
  volumeMuted: false,

  // DEV OPTIONS

  ...(isLocal
    ? {
        devSettingsCheck1: true,
        devSettingsCheck2: true,
        devSettingsCheck3: true,
        devSettingsRadio: 'option1',
        devSettingsRange: 3,
        devSettingsText: '',
        devSettingsTabGroup1: 'option1',
        devSettingsTabGroup2: 'option1',
        devSettingsTabGroup3: 'option1',
      }
    : {}),

  // GENERAL OPTIONS

  optionKeepHomeUsersLoggedIn: true,
  optionRememberLastLibrary: true,

  optionSortNumbersFirst: false,
  optionSortIgnoreLeadingArticles: true,
  optionFoldersOnTop: true,

  optionUseHalfStars: true,

  switchToTrackViewOnArtistPlay: false,
  disableRepeatOnceOnTrackChange: true,
  disableRepeatOnceOnSourceChange: true,
  revertRepeatOnceToRepeatAll: true,

  optionLogPlaybackToServer: true,

  optionShowFullTitles_Deprecated: false,

  // APPEARANCE OPTIONS

  // themeMode: 'system',
  themeKeyFocus: false,

  currentTheme: isProduction ? 'chromatix-magenta' : isPreview ? 'chromatix-yellow' : 'chromatix-teal',
  currentColorBackground: '#021C27',
  currentColorText: '#ffffff',
  currentColorPrimary: '#f7277a',
  currentUiTinting: 'auto',
  currentContrast: 'default',

  isLightTheme: false,
  isLightText: true,

  winCustomScrollbars: true,
  winAutoHideScrollbars: false,
  winScrollbarWidth: 12,

  // TAG IMAGES

  tagImageOption: 'none',
  tagImageCustomType: 'hosted',
  tagImageCustomUrl: '',
  tagImageCustomPath: '',

  // KEYBOARD OPTIONS

  keyboardMediaKeys: true,
  keyboardSpace: true,
  keyboardArrows: true,

  // MENU / SIDEBAR OPTIONS

  menuShowBanners: true,

  menuShowSearch: true,
  menuShowIcons: true,

  menuShowAllPlaylists: true,
  menuShowSeparateBrowseSection: true,

  menuShowArtists: true,
  menuShowAlbumArtists: true,
  menuShowAlbums: true,
  menuShowFolders: true,
  menuShowPlaylists: true,
  menuShowAddPlaylist: true,

  menuShowArtistCollections: true,
  menuShowAlbumCollections: true,
  menuShowArtistGenres: true,
  menuShowAlbumGenres: true,
  menuShowArtistMoods: true,
  menuShowAlbumMoods: true,
  menuShowArtistStyles: true,
  menuShowAlbumStyles: true,
  menuShowArtistTags: true,
  menuShowAlbumTags: true,

  menuOpenLibrary: true,
  menuOpenBrowse: true,
  menuOpenPlaylists: true,

  // CONTROL BAR OPTIONS

  controlBarTitle: true,
  controlBarArtist: true,
  controlBarIsFavourite: true,
  controlBarUserRating: true,

  controlBarFullPageToggle: true,
  controlBarQueueToggle: true,
  controlBarVolumeToggle: true,
  controlBarVolumeSlider: true,

  // QUEUE OPTIONS

  queueIsVisible: false,
  queueExpandArtwork: true,

  queueArtist: true,
  queueAlbum: true,
  queueCodec: true,
  queueBitrate: true,
  queueIsFavourite: true,
  queueUserRating: true,

  // FULL PAGE OPTIONS

  fullPageArtist: true,
  fullPageAlbum: true,
  fullPageIsFavourite: true,
  fullPageUserRating: true,
  fullPageCodec: true,
  fullPageBitrate: true,
  fullPageTheme: true,

  // VIEW OPTIONS

  viewArtists: 'grid',
  viewAlbumArtists: 'grid',
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
  viewArtistTags: 'grid',
  viewArtistTagItems: 'grid',
  viewAlbumTags: 'grid',
  viewAlbumTagItems: 'grid',

  // VIEW SORTING OPTIONS

  sortArtists: 'title',
  sortAlbumArtists: 'title',
  sortArtistAlbums: 'releaseDate',
  sortArtistTracks: 'releaseDate',
  sortAlbums: 'title', // artist-asc-releaseDate-asc
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
  sortArtistTags: 'title',
  sortArtistTagItems: 'title',
  sortAlbumTags: 'title',
  sortAlbumTagItems: 'title',

  // VIEW ORDERING OPTIONS

  orderArtists: 'asc',
  orderAlbumArtists: 'asc',
  orderArtistAlbums: 'asc',
  orderArtistTracks: 'asc',
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
  orderArtistTags: 'asc',
  orderArtistTagItems: 'asc',
  orderAlbumTags: 'asc',
  orderAlbumTagItems: 'asc',

  // ARTIST DETAIL OPTIONS

  artistAlbumsGroupByType: true,

  // artists
  gridArtistsUserRating: true,
  gridArtistsIsFavourite: true,

  // album artists
  gridAlbumArtistsUserRating: true,
  gridAlbumArtistsIsFavourite: true,

  // artist albums
  gridArtistAlbumsArtist: true,
  gridArtistAlbumsReleaseDate: false,
  gridArtistAlbumsUserRating: true,
  gridArtistAlbumsIsFavourite: true,

  // artist collections
  gridArtistCollectionsTotalItems: true,
  gridArtistCollectionsUserRating: true,

  // artist collection items
  gridArtistCollectionItemsUserRating: true,
  gridArtistCollectionItemsIsFavourite: true,

  // artist tag items
  gridArtistTagItemsUserRating: true,
  gridArtistTagItemsIsFavourite: true,

  // albums
  gridAlbumsArtist: true,
  gridAlbumsReleaseDate: false,
  gridAlbumsUserRating: true,
  gridAlbumsIsFavourite: true,

  // album collections
  gridAlbumCollectionsTotalItems: true,
  gridAlbumCollectionsUserRating: true,

  // album collection items
  gridAlbumCollectionItemsArtist: true,
  gridAlbumCollectionItemsReleaseDate: false,
  gridAlbumCollectionItemsUserRating: true,
  gridAlbumCollectionItemsIsFavourite: true,

  // album tag items
  gridAlbumTagItemsArtist: true,
  gridAlbumTagItemsReleaseDate: false,
  gridAlbumTagItemsUserRating: true,
  gridAlbumTagItemsIsFavourite: true,

  // playlists
  gridPlaylistsTotalTracks: true,
  gridPlaylistsDuration: false,
  gridPlaylistsUserRating: true,
  gridPlaylistsIsFavourite: true,

  // LIST VIEW COLUMN VISIBILITY OPTIONS

  // artists
  colArtistsCountry: true,
  colArtistsGenre: true,
  colArtistsAddedAt: false,
  colArtistsLastPlayed: false,
  colArtistsUserRating: true,
  colArtistsIsFavourite: true,

  // album artists
  colAlbumArtistsCountry: true,
  colAlbumArtistsGenre: true,
  colAlbumArtistsAddedAt: false,
  colAlbumArtistsLastPlayed: false,
  colAlbumArtistsUserRating: true,
  colAlbumArtistsIsFavourite: true,

  // artist albums
  colArtistAlbumsGenre: false,
  colArtistAlbumsReleaseDate: true,
  colArtistAlbumsAddedAt: false,
  colArtistAlbumsLastPlayed: false,
  colArtistAlbumsUserRating: true,
  colArtistAlbumsIsFavourite: true,

  // artist tracks
  colArtistTracksArtwork: true,
  colArtistTracksArtist: false,
  colArtistTracksAlbum: true,
  colArtistTracksReleaseDate: true,
  colArtistTracksCodec: false,
  colArtistTracksBitrate: false,
  colArtistTracksDuration: true,
  colArtistTracksUserRating: true,
  colArtistTracksIsFavourite: true,

  // artist collections
  colArtistCollectionsTotalItems: true,
  colArtistCollectionsAddedAt: true,
  colArtistCollectionsUserRating: true,

  // artist collection items
  colArtistCollectionItemsCountry: true,
  colArtistCollectionItemsGenre: true,
  colArtistCollectionItemsAddedAt: false,
  colArtistCollectionItemsLastPlayed: false,
  colArtistCollectionItemsUserRating: true,
  colArtistCollectionItemsIsFavourite: true,

  // artist tag items
  colArtistTagItemsCountry: true,
  colArtistTagItemsGenre: true,
  colArtistTagItemsAddedAt: false,
  colArtistTagItemsLastPlayed: false,
  colArtistTagItemsUserRating: true,
  colArtistTagItemsIsFavourite: true,

  // albums
  colAlbumsArtist: true,
  colAlbumsGenre: false,
  colAlbumsReleaseDate: true,
  colAlbumsAddedAt: false,
  colAlbumsLastPlayed: false,
  colAlbumsUserRating: true,
  colAlbumsIsFavourite: true,

  // album tracks
  colAlbumArtist: true,
  colAlbumCodec: false,
  colAlbumBitrate: false,
  colAlbumDuration: true,
  colAlbumUserRating: true,
  colAlbumIsFavourite: true,

  // album collections
  colAlbumCollectionsTotalItems: true,
  colAlbumCollectionsAddedAt: true,
  colAlbumCollectionsUserRating: true,

  // album collection items
  colAlbumCollectionItemsArtist: true,
  colAlbumCollectionItemsGenre: false,
  colAlbumCollectionItemsReleaseDate: true,
  colAlbumCollectionItemsAddedAt: false,
  colAlbumCollectionItemsLastPlayed: false,
  colAlbumCollectionItemsUserRating: true,
  colAlbumCollectionItemsIsFavourite: true,

  // album tag items
  colAlbumTagItemsArtist: true,
  colAlbumTagItemsGenre: false,
  colAlbumTagItemsReleaseDate: true,
  colAlbumTagItemsAddedAt: false,
  colAlbumTagItemsLastPlayed: false,
  colAlbumTagItemsUserRating: true,
  colAlbumTagItemsIsFavourite: true,

  // folders
  colFoldersKind: true,

  // playlists
  colPlaylistsTotalTracks: true,
  colPlaylistsDuration: true,
  colPlaylistsAddedAt: false,
  colPlaylistsLastPlayed: false,
  colPlaylistsUserRating: true,
  colPlaylistsIsFavourite: true,

  // playlist tracks
  colPlaylistArtwork: true,
  colPlaylistArtist: true,
  colPlaylistAlbum: true,
  colPlaylistCodec: false,
  colPlaylistBitrate: false,
  colPlaylistDuration: true,
  colPlaylistUserRating: true,
  colPlaylistIsFavourite: true,
};

const playingState = {
  // Increment to bust the playing state cache in the event of breaking changes to the playing state structure
  playingVersion: 1,

  playingVariant: null,
  playingServerId: null,
  playingLibraryId: null,
  playingArtistId: null,
  playingAlbumId: null,
  playingPlaylistId: null,
  playingFolderId: null,
  playingLink: null,

  playingOrder: null,
  playingTrackIndex: null,
  playingTrackKeys: null,
  playingTrackList: null,
  playingTrackCount: null,
  playingTrackProgress: 0,

  playingRepeatAll: false,
  playingRepeatOnce: false,
  playingShuffle: false,
};

const state = Object.assign({}, sessionState, playingState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setSessionState(rootState, payload) {
    // console.log('%c--- setSessionState ---', 'color:#439c08');
    // console.log(payload);
    return { ...rootState, ...payload };
  },

  //
  // THEME HANDLING
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
  // MISC
  //

  setPlayingTrackProgress(rootState, payload) {
    // console.log('%c--- setPlayingTrackProgress ---', 'color:#439c08');
    return {
      ...rootState,
      playingTrackProgress: payload,
    };
  },

  unloadTrack(rootState, payload) {
    console.log('%c--- unloadTrack ---', 'color:#439c08');
    return {
      ...rootState,
      ...Object.assign({}, playingState),
    };
  },

  queueVisibleToggle(rootState, payload) {
    // console.log('%c--- queueVisibleToggle ---', 'color:#439c08');
    analyticsEvent('Queue / ' + (rootState.queueIsVisible ? 'Hide' : 'Show'));
    return {
      ...rootState,
      queueIsVisible: !rootState.queueIsVisible,
    };
  },

  setSortList(rootState, payload) {
    const { variant, sortKey } = payload;
    const sortIndex = 'sort' + variant?.charAt(0).toUpperCase() + variant?.slice(1);
    const orderIndex = 'order' + variant?.charAt(0).toUpperCase() + variant?.slice(1);
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
        if (sessionState[sortIndex + 'List']) {
          newSortKey = sessionState[sortIndex + 'List'];
        } else {
          newSortKey = sessionState[sortIndex];
        }
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
    const sortType =
      variant === 'artistTracks'
        ? 'sortArtistTracks'
        : variant === 'albumTracks'
          ? 'sortAlbumTracks'
          : 'sortPlaylistTracks';
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
    console.log('%c--- loadLocalStorage ---', 'color:#439c08');
    let localStorageState = { ...sessionState };
    // attempt to retrieve the current user's session state from local storage
    const loggedIn = rootState.appModel.loggedIn;
    if (loggedIn) {
      const userId = rootState.appModel.currentAccount.userId;
      const userHash = sha3('music' + userId, { outputLength: 224 }).toString();
      const sessionKey = config.storageSessionKey + '-' + userHash;
      try {
        localStorageState = localStorage.getItem(sessionKey) ? JSON.parse(localStorage.getItem(sessionKey)) : {};

        // [NOTE] bring the stored state up to date with the current state shape - see migrateSessionState for the
        // individual migrations. Each one is a no-op once applied, so this is safe to run on every load.
        localStorageState = migrateSessionState(localStorageState, playingState);
      } catch (error) {
        // browser does not support local storage, or local storage item does not exist
      }
    }
    dispatch.sessionModel.setSessionState({
      ...localStorageState,
    });
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#439c08');
    dispatch.sessionModel.setSessionState({
      ...Object.assign({}, sessionState),
      ...Object.assign({}, playingState),
    });
  },

  //
  // USER HANDLING
  //

  setCurrentUser(payload, rootState) {
    console.log('%c--- setCurrentUser ---', 'color:#439c08');
    dispatch.sessionModel.setSessionState({
      currentUser: payload.user,
    });
    dispatch.sessionModel.switchUser({ user: payload.user, pin: payload.pin });
  },

  validateCurrentUser(payload, rootState) {
    console.log('%c--- validateCurrentUser ---', 'color:#439c08');
    const optionKeepHomeUsersLoggedIn = rootState.sessionModel.optionKeepHomeUsersLoggedIn;
    const optionRememberLastLibrary = rootState.sessionModel.optionRememberLastLibrary;
    const currentUserId = rootState.sessionModel.currentUser ? rootState.sessionModel.currentUser.userId : null;
    const refreshedUser = payload?.find((user) => user.userId === currentUserId);
    // Select cached session user
    if (refreshedUser && (payload.length === 1 || optionKeepHomeUsersLoggedIn)) {
      dispatch.sessionModel.setSessionState({
        currentUser: refreshedUser,
      });
      dispatch.sessionModel.switchUser({ user: refreshedUser, pin: '' });
      console.log('A', 'User', true, 'refreshed cached user');
    }
    // Select only available user
    else if (payload.length === 1) {
      dispatch.sessionModel.setSessionState({
        currentUser: payload[0],
      });
      dispatch.sessionModel.switchUser({ user: payload[0], pin: '' });
      console.log('A', 'User', true, 'auto loaded the only user');
    }
    // Cached session user should not be kept logged in
    else if (refreshedUser) {
      dispatch.sessionModel.setSessionState({
        currentUser: null,
        ...(!optionRememberLastLibrary ? { currentServer: null } : {}),
        ...(!optionRememberLastLibrary ? { currentLibrary: null } : {}),
      });
      console.log('A', 'User', false, 'cached user not kept logged in');
    }
    // No user selected - no need to do anything here, selection screen will be shown
    else {
      console.log('A', 'User', false, 'no user selected');
    }
  },

  switchUser(payload, rootState) {
    console.log('%c--- switchUser ---', 'color:#439c08');
    const currentService = rootState.appModel.currentService;
    const { user, pin } = payload;
    if (currentService === 'plex' && user?.uuid) {
      bridge.switchUser({
        uuid: user.uuid,
        pin: pin,
      });
    } else {
      dispatch.appModel.storeUserToken(null);
    }
  },

  unsetCurrentUser(payload, rootState) {
    console.log('%c--- unsetCurrentUser ---', 'color:#439c08');
    bridge.abortAllRequests();
    const optionRememberLastLibrary = rootState.sessionModel.optionRememberLastLibrary;
    dispatch.playerModel.playerPause();
    dispatch.sessionModel.setSessionState({
      currentUser: null,
      ...(!optionRememberLastLibrary ? { currentServer: null } : {}),
      ...(!optionRememberLastLibrary ? { currentLibrary: null } : {}),
      ...Object.assign({}, playingState),
      // ...(!optionRememberLastLibrary ? Object.assign({}, playingState) : {}),
    });
    dispatch.appModel.clearUserState();
  },

  //
  // SERVER HANDLING
  //

  setCurrentServer(payload, rootState) {
    console.log('%c--- setCurrentServer ---', 'color:#439c08');
    dispatch.sessionModel.setSessionState({
      currentServer: payload,
    });
    bridge.getAllLibraries();
  },

  switchCurrentServer(payload, rootState) {
    console.log('%c--- switchCurrentServer ---', 'color:#439c08');
    const currentServerId = rootState.sessionModel.currentServer ? rootState.sessionModel.currentServer.serverId : null;
    if (currentServerId !== payload) {
      bridge.abortAllRequests();
      const newServer = rootState.appModel.allServers.find((server) => server.serverId === payload);
      // [TODO] what if newServer is not found?
      dispatch.sessionModel.setSessionState({
        currentServer: newServer,
        currentLibrary: null,
        ...Object.assign({}, playingState),
      });
      dispatch.appModel.clearServerState();
      dispatch.persistentModel.clearHistoryState();
      dispatch.playerModel.playerUnload();
      bridge.getAllLibraries();
    }
  },

  validateCurrentServer(payload, rootState) {
    console.log('%c--- validateCurrentServer ---', 'color:#439c08');
    const currentServerId = rootState.sessionModel.currentServer ? rootState.sessionModel.currentServer.serverId : null;
    const refreshedServer = payload?.find((server) => server.serverId === currentServerId);
    // Select cached session server
    if (refreshedServer) {
      dispatch.sessionModel.setSessionState({
        currentServer: refreshedServer,
      });
      bridge.getAllLibraries();
      console.log('B', 'Server', true, 'refreshed cached server');
    }
    // Select only available server
    else if (payload.length === 1) {
      dispatch.sessionModel.setSessionState({
        currentServer: payload[0],
        currentLibrary: null,
        ...Object.assign({}, playingState),
      });
      bridge.getAllLibraries();
      console.log('B', 'Server', true, 'auto loaded the only server');
    }
    // No server selected
    else {
      dispatch.sessionModel.setSessionState({
        currentServer: null,
        currentLibrary: null,
        ...Object.assign({}, playingState),
      });
      console.log('B', 'Server', false, 'no server selected');
    }
  },

  unsetCurrentServer(payload, rootState) {
    console.log('%c--- unsetCurrentServer ---', 'color:#439c08');
    dispatch.sessionModel.setSessionState({
      currentServer: null,
      currentLibrary: null,
      ...Object.assign({}, playingState),
    });
    dispatch.appModel.clearServerState();
    dispatch.playerModel.playerUnload();
  },

  //
  // LIBRARY HANDLING
  //

  setCurrentLibrary(payload, rootState) {
    console.log('%c--- setCurrentLibrary ---', 'color:#439c08');
    dispatch.sessionModel.setSessionState({
      currentLibrary: payload,
    });
  },

  validateCurrentLibrary(payload, rootState) {
    console.log('%c--- validateCurrentLibrary ---', 'color:#439c08');
    const currentLibraryId = rootState.sessionModel.currentLibrary
      ? rootState.sessionModel.currentLibrary.libraryId
      : null;
    const refreshedLibrary = payload?.find((library) => library.libraryId === currentLibraryId);
    // Select cached session library
    if (refreshedLibrary) {
      dispatch.sessionModel.setSessionState({
        currentLibrary: refreshedLibrary,
      });
      console.log('C', 'Library', true, 'refreshed cached library');
    }
    // Select only available library
    else if (payload.length === 1) {
      dispatch.sessionModel.setSessionState({
        currentLibrary: payload[0],
        ...Object.assign({}, playingState),
      });
      dispatch.playerModel.playerUnload();
      console.log('C', 'Library', true, 'auto loaded the only library');
    }
    // No library selected
    else {
      dispatch.sessionModel.setSessionState({
        currentLibrary: null,
        ...Object.assign({}, playingState),
      });
      dispatch.playerModel.playerUnload();
      console.log('C', 'Library', false, 'no library selected');
    }
  },

  switchCurrentLibrary(payload, rootState) {
    console.log('%c--- switchCurrentLibrary ---', 'color:#439c08');
    const currentLibrary = rootState.sessionModel.currentLibrary;
    const currentLibraryId = currentLibrary ? currentLibrary.libraryId : null;
    if (currentLibraryId !== payload) {
      bridge.abortAllRequests();
      const newLibrary = rootState.appModel.allLibraries.find((library) => library.libraryId === payload);
      // [TODO] what if newLibrary is not found?
      dispatch.sessionModel.setSessionState({
        currentLibrary: newLibrary,
      });
      dispatch.appModel.clearLibraryState();
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
