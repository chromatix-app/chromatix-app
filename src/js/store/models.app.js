// ======================================================================
// IMPORTS
// ======================================================================

import * as bridge from 'js/services/bridge';

// ======================================================================
// OPTIONS
// ======================================================================

const maxDataLength = 5;

// ======================================================================
// STATE
// ======================================================================

const appState = {
  inited: false,
  isOnline: true,
  standalone: false,
  history: null,

  contentBreakpoint: 0,
  contentWidth: 0,

  errorFastestConnection: false,
  errorLibraries: false,
  errorLogin: false,
  errorServers: false,
  errorUser: false,

  scrollToPlaying: false,
  scrollToTrack: false,

  notifications: [],
};

const userState = {
  loggedIn: false,

  // TBC remove these...
  currentService: null,
  currentUser: null,
  allServers: null,

  // TBC add this...
  // allAccounts: [{
  //   service: 'plex',
  //   userId: null,
  //   userName: null,
  //   userThumb: null,
  //   userEmail: null,
  // }],
};

// TBC add this...
// const accountState = {
//   currentService: 'plex',
//   currentAccount: null,
//   allServers: null,
// };

const serverState = {
  serverBaseUrl: null,
  allLibraries: null,
};

const libraryState = {
  // artists
  allArtists: null,
  allArtistAlbums: {},
  allArtistRelatedAlbums: {},
  allArtistAppearanceAlbums: {},
  allArtistTracks: {},
  haveGotAllArtists: false,
  // album artists
  allAlbumArtists: null,
  haveGotAllAlbumArtists: false,
  // albums
  allAlbums: null,
  allAlbumTracks: {},
  haveGotAllAlbums: false,
  // folders
  allFolderItems: {},
  // playlists
  allPlaylists: null,
  allPlaylistTracks: {},
  // collections
  allArtistCollections: null,
  allArtistCollectionItems: {},
  allAlbumCollections: null,
  allAlbumCollectionItems: {},
  // genres
  allArtistGenres: null,
  allArtistGenreItems: {},
  allAlbumGenres: null,
  allAlbumGenreItems: {},
  // moods
  allArtistMoods: null,
  allArtistMoodItems: {},
  allAlbumMoods: null,
  allAlbumMoodItems: {},
  // styles
  allArtistStyles: null,
  allArtistStyleItems: {},
  allAlbumStyles: null,
  allAlbumStyleItems: {},
  // tags
  allArtistTags: null,
  allArtistTagItems: {},
  allAlbumTags: null,
  allAlbumTagItems: {},
  // search results
  searchResultCounter: 0,
  searchResults: null,
};

const state = Object.assign({}, appState, userState, serverState, libraryState);

// ======================================================================
// REDUCERS
// ======================================================================

const reducers = {
  setAppState(rootState, payload) {
    // console.log('%c--- setAppState ---', 'color:#07a098');
    return { ...rootState, ...payload };
  },

  // showLoader(rootState) {
  //   return { ...rootState, loaderVisible: true };
  // },

  // hideLoader(rootState) {
  //   return { ...rootState, loaderVisible: false };
  // },
};

// ======================================================================
// EFFECTS
// ======================================================================

const effects = (dispatch) => {
  // Helper function for storing tag items
  function createStoreTagItemsEffect(stateKey) {
    return function (payload, rootState) {
      console.log(`%c--- store${stateKey} ---`, 'color:#07a098');
      const { libraryId, tagId, tagItems } = payload;
      const allItems = { ...rootState.appModel[stateKey] };

      // limit recent entries
      const keys = Object.keys(allItems);
      if (keys.length >= maxDataLength) {
        delete allItems[keys[0]];
      }

      // add the new entry and save
      allItems[libraryId + '-' + tagId] = tagItems;
      dispatch.appModel.setAppState({
        [stateKey]: allItems,
      });
    };
  }

  // Helper function for storing tag item 404 errors
  function createStoreTagItems404Effect(listStateKey, itemIdKey) {
    return function (payload, rootState) {
      console.log(`%c--- store${listStateKey.charAt(0).toUpperCase() + listStateKey.slice(1)}404 ---`, 'color:#07a098');
      const { tagId } = payload;
      const allItems = [...(rootState.appModel[listStateKey] || [])];
      const itemIndex = allItems.findIndex((item) => item[itemIdKey] === tagId);

      if (itemIndex === -1) {
        allItems.push({
          [itemIdKey]: tagId,
          error404: true,
        });
      } else {
        allItems[itemIndex] = {
          [itemIdKey]: tagId,
          error404: true,
        };
      }

      dispatch.appModel.setAppState({
        [listStateKey]: allItems,
      });
    };
  }

  return {
    init(payload, rootState) {
      console.log('%c--- init ---', 'color:#07a098');
      // detect if browser is standalone (i.e. a web app)
      if ('standalone' in window.navigator && !!window.navigator.standalone) {
        dispatch.appModel.setAppState({
          standalone: true,
        });
      }
      // save history for reference within models
      dispatch.appModel.setAppState({
        history: payload.history,
      });
      // initialise player
      dispatch.playerModel.playerInit();
      // initialise persistent state
      dispatch.persistentModel.init();
      // initialise bridge
      bridge.init();
    },

    //
    // AUTH
    //

    doPlexLogin(payload, rootState) {
      console.log('%c--- login - plex ---', 'color:#07a098');
      bridge.plexLogin();
    },

    doLogout(payload, rootState) {
      console.log('%c--- logout ---', 'color:#07a098');
      dispatch.playerModel.playerLogQuit();
      bridge.logout();
      rootState.appModel.history.replace('/');
    },

    setLoggedIn(payload, rootState) {
      console.log('%c--- setLoggedIn ---', 'color:#07a098');
      const { currentService, currentUser } = payload;
      dispatch.appModel.setAppState({
        inited: true,
        loggedIn: true,
        currentService,
        currentUser,
      });
      dispatch.sessionModel.loadLocalStorage();
      dispatch.playerModel.playerRefresh();
      bridge.getAllServers();
    },

    setLoggedOut(payload, rootState) {
      console.log('%c--- setLoggedOut ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        inited: true,
        ...Object.assign({}, userState),
        ...Object.assign({}, serverState),
        ...Object.assign({}, libraryState),
      });
      dispatch.playerModel.playerUnload();
      dispatch.sessionModel.setLoggedOut();
    },

    //
    // NOTIFICATIONS
    //

    addNotification(payload, rootState) {
      // console.log('%c--- addNotification ---', 'color:#07a098');
      const notifications = [...(rootState.appModel.notifications || [])];
      const newNotification = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        ...payload,
      };
      notifications.push(newNotification);
      // limit total entries
      const maxNotifications = 10;
      if (notifications.length > maxNotifications) {
        notifications.splice(0, notifications.length - maxNotifications);
      }
      // save
      dispatch.appModel.setAppState({ notifications });
    },

    removeNotification(payload, rootState) {
      // console.log('%c--- removeNotification - ' + payload + ' ---', 'color:#07a098');
      const notifications = [...(rootState.appModel.notifications || [])];
      const index = notifications.findIndex((n) => n.id === payload);
      if (index !== -1) {
        notifications.splice(index, 1);
        dispatch.appModel.setAppState({ notifications });
      }
    },

    //
    // ERROR HANDLING
    //

    dismissErrorFastestConnection(payload, rootState) {
      // console.log('%c--- dismissErrorFastestConnection ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        errorFastestConnection: false,
      });
      dispatch.sessionModel.unsetCurrentServer();
    },

    dismissErrorLibraries(payload, rootState) {
      // console.log('%c--- dismissErrorLibraries ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        errorLibraries: false,
      });
      dispatch.sessionModel.unsetCurrentServer();
    },

    dismissErrorLogin(payload, rootState) {
      // console.log('%c--- dismissErrorLogin ---', 'color:#07a098');
      if (rootState.appModel.isInited) {
        dispatch.appModel.setAppState({
          errorLogin: false,
        });
      } else {
        window.location.reload();
      }
    },

    dismissErrorServers(payload, rootState) {
      // console.log('%c--- dismissErrorServers ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        errorServers: false,
      });
      bridge.getAllServers();
    },

    dismissErrorUser(payload, rootState) {
      // console.log('%c--- dismissErrorUser ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        errorUser: false,
      });
      bridge.getUserInfo();
    },

    //
    // SERVER & LIBRARY HANDLING
    //

    clearServerState(payload, rootState) {
      console.log('%c--- clearServerState ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        ...Object.assign({}, serverState),
        ...Object.assign({}, libraryState),
      });
      dispatch.playerModel.playerUnload();
    },

    clearLibraryState(payload, rootState) {
      console.log('%c--- clearLibraryState ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        ...Object.assign({}, libraryState),
      });
      rootState.appModel.history.push('/');
      bridge.getAllPlaylists();
    },

    storeAllServers(payload, rootState) {
      // console.log('%c--- storeAllServers ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        allServers: payload,
      });
      dispatch.sessionModel.refreshCurrentServer(payload);
      bridge.getAllLibraries();
    },

    storeAllLibraries(payload, rootState) {
      // console.log('%c--- storeAllLibraries ---', 'color:#07a098');
      dispatch.appModel.setAppState({
        allLibraries: payload,
      });
      dispatch.sessionModel.refreshCurrentLibrary(payload);
    },

    //
    // MUSIC - ARTISTS
    //

    storeArtistDetails(payload, rootState) {
      console.log('%c--- storeArtistDetails ---', 'color:#07a098');
      const allArtists = [...(rootState.appModel.allArtists || [])];
      const artistIndex = allArtists.findIndex((artist) => artist.artistId === payload.artistId);
      if (artistIndex === -1) {
        // // limit recent entries
        // if (allArtists.length >= maxDataLength) {
        //   allArtists.shift();
        // }
        // add the new entry and save
        payload.isExtra = true;
        allArtists.push(payload);
      } else {
        if (allArtists[artistIndex].isExtra) {
          payload.isExtra = true;
        }
        allArtists[artistIndex] = payload;
      }
      dispatch.appModel.setAppState({
        allArtists,
      });
    },

    storeAlbumArtistDetails(payload, rootState) {
      console.log('%c--- storeAlbumArtistDetails ---', 'color:#07a098');
      const allAlbumArtists = [...(rootState.appModel.allAlbumArtists || [])];
      const artistIndex = allAlbumArtists.findIndex((artist) => artist.artistId === payload.artistId);
      if (artistIndex === -1) {
        // // limit recent entries
        // if (allAlbumArtists.length >= maxDataLength) {
        //   allAlbumArtists.shift();
        // }
        // add the new entry and save
        payload.isExtra = true;
        allAlbumArtists.push(payload);
      } else {
        if (allAlbumArtists[artistIndex].isExtra) {
          payload.isExtra = true;
        }
        allAlbumArtists[artistIndex] = payload;
      }
      dispatch.appModel.setAppState({
        allAlbumArtists,
      });
    },

    storeArtist404(payload, rootState) {
      console.log('%c--- storeArtist404 ---', 'color:#07a098');
      const allArtists = [...(rootState.appModel.allArtists || [])];
      const artistIndex = allArtists.findIndex((artist) => artist.artistId === payload.artistId);
      if (artistIndex === -1) {
        allArtists.push({
          artistId: payload.artistId,
          error404: true,
        });
      } else {
        allArtists[artistIndex] = {
          artistId: payload.artistId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allArtists,
      });
    },

    storeAlbumArtist404(payload, rootState) {
      console.log('%c--- storeAlbumArtist404 ---', 'color:#07a098');
      const allAlbumArtists = [...(rootState.appModel.allAlbumArtists || [])];
      const artistIndex = allAlbumArtists.findIndex((artist) => artist.artistId === payload.artistId);
      if (artistIndex === -1) {
        allAlbumArtists.push({
          artistId: payload.artistId,
          error404: true,
        });
      } else {
        allAlbumArtists[artistIndex] = {
          artistId: payload.artistId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allAlbumArtists,
      });
    },

    storeArtistAlbums(payload, rootState) {
      console.log('%c--- storeArtistAlbums ---', 'color:#07a098');
      const { libraryId, artistId, artistAlbums } = payload;
      const allArtistAlbums = { ...rootState.appModel.allArtistAlbums };
      // limit recent entries
      const keys = Object.keys(allArtistAlbums);
      if (keys.length >= maxDataLength) {
        delete allArtistAlbums[keys[0]];
      }
      // add the new entry and save
      allArtistAlbums[libraryId + '-' + artistId] = artistAlbums;
      dispatch.appModel.setAppState({
        allArtistAlbums,
      });
    },

    storeArtistRelated(payload, rootState) {
      console.log('%c--- storeArtistRelated ---', 'color:#07a098');
      const { libraryId, artistId, artistRelated } = payload;
      const allArtistRelatedAlbums = { ...rootState.appModel.allArtistRelatedAlbums };
      // limit recent entries
      const keys = Object.keys(allArtistRelatedAlbums);
      if (keys.length >= maxDataLength) {
        delete allArtistRelatedAlbums[keys[0]];
      }
      // add the new entry and save
      allArtistRelatedAlbums[libraryId + '-' + artistId] = artistRelated;
      dispatch.appModel.setAppState({
        allArtistRelatedAlbums,
      });
    },

    storeArtistAppearanceAlbums(payload, rootState) {
      console.log('%c--- storeArtistAppearanceAlbums ---', 'color:#07a098');
      const { libraryId, artistId, artistAppearanceAlbums } = payload;
      const allArtistAppearanceAlbums = { ...rootState.appModel.allArtistAppearanceAlbums };
      // limit recent entries
      const keys = Object.keys(allArtistAppearanceAlbums);
      if (keys.length >= maxDataLength) {
        delete allArtistAppearanceAlbums[keys[0]];
      }
      // add the new entry and save
      allArtistAppearanceAlbums[libraryId + '-' + artistId] = artistAppearanceAlbums;
      dispatch.appModel.setAppState({
        allArtistAppearanceAlbums,
      });
    },

    storeArtistTracks(payload, rootState) {
      console.log('%c--- storeArtistTracks ---', 'color:#07a098');
      const { libraryId, artistId, artistTracks } = payload;
      const allArtistTracks = { ...rootState.appModel.allArtistTracks };
      // limit recent entries
      const keys = Object.keys(allArtistTracks);
      if (keys.length >= maxDataLength) {
        delete allArtistTracks[keys[0]];
      }
      // add the new entry and save
      allArtistTracks[libraryId + '-' + artistId] = artistTracks;
      dispatch.appModel.setAppState({
        allArtistTracks,
      });
    },

    setArtistRating(payload, rootState) {
      console.log('%c--- setArtistRating ---', 'color:#07a098');
      const { isFavourite, ratingKey, rating } = payload;

      // update artist
      const prevArtists = rootState.appModel.allArtists;
      const allArtists = prevArtists ? [...prevArtists] : [];
      const artistIndex = allArtists.findIndex((artist) => artist.artistId === ratingKey);
      if (artistIndex !== -1) {
        allArtists[artistIndex].isFavourite = isFavourite;
        allArtists[artistIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allArtists,
        });
      }

      // update album artist
      const prevAlbumArtists = rootState.appModel.allAlbumArtists;
      const allAlbumArtists = prevAlbumArtists ? [...prevAlbumArtists] : [];
      const albumArtistIndex = allAlbumArtists.findIndex((artist) => artist.artistId === ratingKey);
      if (albumArtistIndex !== -1) {
        allAlbumArtists[albumArtistIndex].isFavourite = isFavourite;
        allAlbumArtists[albumArtistIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allAlbumArtists,
        });
      }

      // update artist collection items
      const allArtistCollectionItems = { ...rootState.appModel.allArtistCollectionItems };
      const collectionKeys = Object.keys(allArtistCollectionItems);
      collectionKeys.forEach((key) => {
        const artistCollectionItems = allArtistCollectionItems[key];
        const artistIndex = artistCollectionItems.findIndex((artist) => artist.artistId === ratingKey);
        if (artistIndex !== -1) {
          artistCollectionItems[artistIndex].isFavourite = isFavourite;
          artistCollectionItems[artistIndex].userRating = rating;
          allArtistCollectionItems[key] = artistCollectionItems;
        }
      });

      // update artist genre items
      const allArtistGenreItems = { ...rootState.appModel.allArtistGenreItems };
      const genreKeys = Object.keys(allArtistGenreItems);
      genreKeys.forEach((key) => {
        const artistGenreItems = allArtistGenreItems[key];
        const artistIndex = artistGenreItems.findIndex((artist) => artist.artistId === ratingKey);
        if (artistIndex !== -1) {
          artistGenreItems[artistIndex].isFavourite = isFavourite;
          artistGenreItems[artistIndex].userRating = rating;
          allArtistGenreItems[key] = artistGenreItems;
        }
      });

      // update artist mood items
      const allArtistMoodItems = { ...rootState.appModel.allArtistMoodItems };
      const moodKeys = Object.keys(allArtistMoodItems);
      moodKeys.forEach((key) => {
        const artistMoodItems = allArtistMoodItems[key];
        const artistIndex = artistMoodItems.findIndex((artist) => artist.artistId === ratingKey);
        if (artistIndex !== -1) {
          artistMoodItems[artistIndex].isFavourite = isFavourite;
          artistMoodItems[artistIndex].userRating = rating;
          allArtistMoodItems[key] = artistMoodItems;
        }
      });

      // update artist style items
      const allArtistStyleItems = { ...rootState.appModel.allArtistStyleItems };
      const styleKeys = Object.keys(allArtistStyleItems);
      styleKeys.forEach((key) => {
        const artistStyleItems = allArtistStyleItems[key];
        const artistIndex = artistStyleItems.findIndex((artist) => artist.artistId === ratingKey);
        if (artistIndex !== -1) {
          artistStyleItems[artistIndex].isFavourite = isFavourite;
          artistStyleItems[artistIndex].userRating = rating;
          allArtistStyleItems[key] = artistStyleItems;
        }
      });

      // update artist tag items
      const allArtistTagItems = { ...rootState.appModel.allArtistTagItems };
      const tagKeys = Object.keys(allArtistTagItems);
      tagKeys.forEach((key) => {
        const artistTagItems = allArtistTagItems[key];
        const artistIndex = artistTagItems.findIndex((artist) => artist.artistId === ratingKey);
        if (artistIndex !== -1) {
          artistTagItems[artistIndex].isFavourite = isFavourite;
          artistTagItems[artistIndex].userRating = rating;
          allArtistTagItems[key] = artistTagItems;
        }
      });

      // save
      dispatch.appModel.setAppState({
        allArtistCollectionItems,
        allArtistGenreItems,
        allArtistStyleItems,
        allArtistMoodItems,
      });
    },

    //
    // MUSIC - ALBUMS
    //

    storeAlbumDetails(payload, rootState) {
      console.log('%c--- storeAlbumDetails ---', 'color:#07a098');
      const allAlbums = [...(rootState.appModel.allAlbums || [])];
      const albumIndex = allAlbums.findIndex((album) => album.albumId === payload.albumId);
      if (albumIndex === -1) {
        // // limit recent entries
        // if (allAlbums.length >= maxDataLength) {
        //   allAlbums.shift();
        // }
        // add the new entry and save
        payload.isExtra = true;
        allAlbums.push(payload);
      } else {
        if (allAlbums[albumIndex].isExtra) {
          payload.isExtra = true;
        }
        allAlbums[albumIndex] = payload;
      }
      dispatch.appModel.setAppState({
        allAlbums,
      });
    },

    storeAlbum404(payload, rootState) {
      console.log('%c--- storeAlbum404 ---', 'color:#07a098');
      const allAlbums = [...(rootState.appModel.allAlbums || [])];
      const albumIndex = allAlbums.findIndex((album) => album.albumId === payload.albumId);
      if (albumIndex === -1) {
        allAlbums.push({
          albumId: payload.albumId,
          error404: true,
        });
      } else {
        allAlbums[albumIndex] = {
          albumId: payload.albumId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allAlbums,
      });
    },

    storeAlbumTracks(payload, rootState) {
      console.log('%c--- storeAlbumTracks ---', 'color:#07a098');
      const { libraryId, albumId, albumTracks } = payload;
      const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
      // limit recent entries
      const keys = Object.keys(allAlbumTracks);
      if (keys.length >= maxDataLength) {
        delete allAlbumTracks[keys[0]];
      }
      // add the new entry and save
      allAlbumTracks[libraryId + '-' + albumId] = albumTracks;
      dispatch.appModel.setAppState({
        allAlbumTracks,
      });
    },

    setAlbumRating(payload, rootState) {
      console.log('%c--- setAlbumRating ---', 'color:#07a098');
      const { isFavourite, ratingKey, rating } = payload;

      // update albums
      const prevAlbums = rootState.appModel.allAlbums;
      const allAlbums = prevAlbums ? [...prevAlbums] : [];
      const albumIndex = allAlbums.findIndex((album) => album.albumId === ratingKey);
      if (albumIndex !== -1) {
        allAlbums[albumIndex].isFavourite = isFavourite;
        allAlbums[albumIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allAlbums,
        });
      }

      // update artist albums
      const allArtistAlbums = { ...rootState.appModel.allArtistAlbums };
      const artistAlbumKeys = Object.keys(allArtistAlbums);
      artistAlbumKeys.forEach((key) => {
        const artistAlbums = allArtistAlbums[key];
        const albumIndex = artistAlbums.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          artistAlbums[albumIndex].isFavourite = isFavourite;
          artistAlbums[albumIndex].userRating = rating;
          allArtistAlbums[key] = artistAlbums;
        }
      });

      // update artist related albums
      const allArtistRelatedAlbums = { ...rootState.appModel.allArtistRelatedAlbums };
      const artistKeys = Object.keys(allArtistRelatedAlbums);
      artistKeys.forEach((artistKey) => {
        const artistGroups = allArtistRelatedAlbums[artistKey];
        artistGroups.forEach((group) => {
          const relatedAlbums = group.related;
          relatedAlbums.forEach((album, index) => {
            if (album.albumId === ratingKey) {
              group.related[index].isFavourite = isFavourite;
              group.related[index].userRating = rating;
            }
          });
        });
        allArtistRelatedAlbums[artistKey] = artistGroups;
      });

      // update artist appearance albums
      const allArtistAppearanceAlbums = { ...rootState.appModel.allArtistAppearanceAlbums };
      const appearanceKeys = Object.keys(allArtistAppearanceAlbums);
      appearanceKeys.forEach((key) => {
        const artistAppearanceAlbums = allArtistAppearanceAlbums[key];
        const albumIndex = artistAppearanceAlbums.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          artistAppearanceAlbums[albumIndex].isFavourite = isFavourite;
          artistAppearanceAlbums[albumIndex].userRating = rating;
          allArtistAppearanceAlbums[key] = artistAppearanceAlbums;
        }
      });

      // update album collection items
      const allAlbumCollectionItems = { ...rootState.appModel.allAlbumCollectionItems };
      const collectionKeys = Object.keys(allAlbumCollectionItems);
      collectionKeys.forEach((key) => {
        const albumCollectionItems = allAlbumCollectionItems[key];
        console.log(albumCollectionItems);
        const albumIndex = albumCollectionItems.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          albumCollectionItems[albumIndex].isFavourite = isFavourite;
          albumCollectionItems[albumIndex].userRating = rating;
          allAlbumCollectionItems[key] = albumCollectionItems;
        }
      });

      // update album genre items
      const allAlbumGenreItems = { ...rootState.appModel.allAlbumGenreItems };
      const genreKeys = Object.keys(allAlbumGenreItems);
      genreKeys.forEach((key) => {
        const albumGenreItems = allAlbumGenreItems[key];
        const albumIndex = albumGenreItems.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          albumGenreItems[albumIndex].isFavourite = isFavourite;
          albumGenreItems[albumIndex].userRating = rating;
          allAlbumGenreItems[key] = albumGenreItems;
        }
      });

      // update album mood items
      const allAlbumMoodItems = { ...rootState.appModel.allAlbumMoodItems };
      const moodKeys = Object.keys(allAlbumMoodItems);
      moodKeys.forEach((key) => {
        const albumMoodItems = allAlbumMoodItems[key];
        const albumIndex = albumMoodItems.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          albumMoodItems[albumIndex].isFavourite = isFavourite;
          albumMoodItems[albumIndex].userRating = rating;
          allAlbumMoodItems[key] = albumMoodItems;
        }
      });

      // update album style items
      const allAlbumStyleItems = { ...rootState.appModel.allAlbumStyleItems };
      const styleKeys = Object.keys(allAlbumStyleItems);
      styleKeys.forEach((key) => {
        const albumStyleItems = allAlbumStyleItems[key];
        const albumIndex = albumStyleItems.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          albumStyleItems[albumIndex].isFavourite = isFavourite;
          albumStyleItems[albumIndex].userRating = rating;
          allAlbumStyleItems[key] = albumStyleItems;
        }
      });

      // update album tag items
      const allAlbumTagItems = { ...rootState.appModel.allAlbumTagItems };
      const tagKeys = Object.keys(allAlbumTagItems);
      tagKeys.forEach((key) => {
        const albumTagItems = allAlbumTagItems[key];
        const albumIndex = albumTagItems.findIndex((album) => album.albumId === ratingKey);
        if (albumIndex !== -1) {
          albumTagItems[albumIndex].isFavourite = isFavourite;
          albumTagItems[albumIndex].userRating = rating;
          allAlbumTagItems[key] = albumTagItems;
        }
      });

      // save
      dispatch.appModel.setAppState({
        allArtistAlbums,
        allArtistRelatedAlbums,
        allAlbumCollectionItems,
        allAlbumGenreItems,
        allAlbumStyleItems,
        allAlbumMoodItems,
      });
    },

    //
    // MUSIC - FOLDERS
    //

    storeFolderItems(payload, rootState) {
      console.log('%c--- storeFolderItems ---', 'color:#07a098');
      const { libraryId, folderId, folderItems } = payload;
      const allFolderItems = { ...rootState.appModel.allFolderItems };
      // limit recent entries
      const keys = Object.keys(allFolderItems);
      if (keys.length >= maxDataLength) {
        delete allFolderItems[keys[0]];
      }
      // add the new entry and save
      allFolderItems[libraryId + '-' + folderId] = folderItems;
      dispatch.appModel.setAppState({
        allFolderItems,
      });
    },

    storeFolder404(payload, rootState) {
      console.log('%c--- storeFolder404 ---', 'color:#07a098');
      const { libraryId, folderId } = payload;
      const allFolderItems = { ...rootState.appModel.allFolderItems };
      allFolderItems[libraryId + '-' + folderId] = [];
      dispatch.appModel.setAppState({
        allFolderItems,
      });
    },

    //
    // MUSIC - PLAYLISTS
    //

    storePlaylist404(payload, rootState) {
      console.log('%c--- storePlaylist404 ---', 'color:#07a098');
      const allPlaylists = [...(rootState.appModel.allPlaylists || [])];
      const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === payload.playlistId);
      if (playlistIndex === -1) {
        allPlaylists.push({
          playlistId: payload.playlistId,
          error404: true,
        });
      } else {
        allPlaylists[playlistIndex] = {
          playlistId: payload.playlistId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allPlaylists,
      });
    },

    storePlaylistDetails(payload, rootState) {
      console.log('%c--- storePlaylistDetails ---', 'color:#07a098');
      const allPlaylists = [...(rootState.appModel.allPlaylists || [])];
      const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === payload.playlistId);
      if (playlistIndex === -1) {
        // // limit recent entries
        // if (allPlaylists.length >= maxDataLength) {
        //   allPlaylists.shift();
        // }
        // add the new entry and save
        payload.isExtra = true;
        allPlaylists.push(payload);
      } else {
        if (allPlaylists[playlistIndex].isExtra) {
          payload.isExtra = true;
        }
        allPlaylists[playlistIndex] = payload;
      }
      dispatch.appModel.setAppState({
        allPlaylists,
      });
    },

    storePlaylistTracks(payload, rootState) {
      console.log('%c--- storePlaylistTracks ---', 'color:#07a098');
      const { libraryId, playlistId, playlistTracks } = payload;
      const allPlaylistTracks = { ...rootState.appModel.allPlaylistTracks };
      // limit recent entries
      const keys = Object.keys(allPlaylistTracks);
      if (keys.length >= maxDataLength) {
        delete allPlaylistTracks[keys[0]];
      }
      // add the new entry and save
      allPlaylistTracks[libraryId + '-' + playlistId] = playlistTracks;
      dispatch.appModel.setAppState({
        allPlaylistTracks,
      });
    },

    setPlaylistRating(payload, rootState) {
      console.log('%c--- setPlaylistRating ---', 'color:#07a098');
      const { isFavourite, ratingKey, rating } = payload;
      const prevPlaylists = rootState.appModel.allPlaylists;
      const allPlaylists = prevPlaylists ? [...prevPlaylists] : [];
      const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === ratingKey);
      if (playlistIndex !== -1) {
        allPlaylists[playlistIndex].isFavourite = isFavourite;
        allPlaylists[playlistIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allPlaylists,
        });
      }
    },

    //
    // MUSIC - TRACKS
    //

    setTrackRating(payload, rootState) {
      console.log('%c--- setTrackRating ---', 'color:#07a098');
      const { isFavourite, ratingKey, rating } = payload;

      // update artist tracks
      const allArtistTracks = { ...rootState.appModel.allArtistTracks };
      const artistKeys = Object.keys(allArtistTracks);
      artistKeys.forEach((key) => {
        const artistTracks = allArtistTracks[key];
        const trackIndex = artistTracks.findIndex((track) => track.trackId === ratingKey);
        if (trackIndex !== -1) {
          artistTracks[trackIndex].isFavourite = isFavourite;
          artistTracks[trackIndex].userRating = rating;
          allArtistTracks[key] = artistTracks;
        }
      });

      // update album tracks
      const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
      const albumKeys = Object.keys(allAlbumTracks);
      albumKeys.forEach((key) => {
        const albumTracks = allAlbumTracks[key];
        const trackIndex = albumTracks.findIndex((track) => track.trackId === ratingKey);
        if (trackIndex !== -1) {
          albumTracks[trackIndex].isFavourite = isFavourite;
          albumTracks[trackIndex].userRating = rating;
          allAlbumTracks[key] = albumTracks;
        }
      });

      // update playlist tracks
      const allPlaylistTracks = { ...rootState.appModel.allPlaylistTracks };
      const playlistKeys = Object.keys(allPlaylistTracks);
      playlistKeys.forEach((key) => {
        const playlistTracks = allPlaylistTracks[key];
        const trackIndex = playlistTracks.findIndex((track) => track.trackId === ratingKey);
        if (trackIndex !== -1) {
          playlistTracks[trackIndex].isFavourite = isFavourite;
          playlistTracks[trackIndex].userRating = rating;
          allPlaylistTracks[key] = playlistTracks;
        }
      });
      dispatch.appModel.setAppState({
        allArtistTracks,
        allAlbumTracks,
        allPlaylistTracks,
      });
    },

    //
    // MUSIC - COLLECTIONS
    //

    storeArtistCollectionItems(payload, rootState) {
      console.log('%c--- storeArtistCollectionItems ---', 'color:#07a098');
      const { libraryId, collectionId, collectionItems } = payload;
      const allArtistCollectionItems = { ...rootState.appModel.allArtistCollectionItems };
      // limit recent entries
      const keys = Object.keys(allArtistCollectionItems);
      if (keys.length >= maxDataLength) {
        delete allArtistCollectionItems[keys[0]];
      }
      // add the new entry and save
      allArtistCollectionItems[libraryId + '-' + collectionId] = collectionItems;
      dispatch.appModel.setAppState({
        allArtistCollectionItems,
      });
    },

    storeArtistCollection404(payload, rootState) {
      console.log('%c--- storeArtistCollection404 ---', 'color:#07a098');
      const { collectionId } = payload;
      const allArtistCollections = [...(rootState.appModel.allArtistCollections || [])];
      const collectionIndex = allArtistCollections.findIndex((collection) => collection.collectionId === collectionId);
      if (collectionIndex === -1) {
        allArtistCollections.push({
          collectionId: collectionId,
          error404: true,
        });
      } else {
        allArtistCollections[collectionIndex] = {
          collectionId: collectionId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allArtistCollections,
      });
    },

    storeAlbumCollectionItems(payload, rootState) {
      console.log('%c--- storeAlbumCollectionItems ---', 'color:#07a098');
      const { libraryId, collectionId, collectionItems } = payload;
      const allAlbumCollectionItems = { ...rootState.appModel.allAlbumCollectionItems };
      // limit recent entries
      const keys = Object.keys(allAlbumCollectionItems);
      if (keys.length >= maxDataLength) {
        delete allAlbumCollectionItems[keys[0]];
      }
      // add the new entry and save
      allAlbumCollectionItems[libraryId + '-' + collectionId] = collectionItems;
      dispatch.appModel.setAppState({
        allAlbumCollectionItems,
      });
    },

    storeAlbumCollection404(payload, rootState) {
      console.log('%c--- storeAlbumCollection404 ---', 'color:#07a098');
      const allAlbumCollections = [...(rootState.appModel.allAlbumCollections || [])];
      const collectionIndex = allAlbumCollections.findIndex(
        (collection) => collection.collectionId === payload.collectionId
      );
      if (collectionIndex === -1) {
        allAlbumCollections.push({
          collectionId: payload.collectionId,
          error404: true,
        });
      } else {
        allAlbumCollections[collectionIndex] = {
          collectionId: payload.collectionId,
          error404: true,
        };
      }
      dispatch.appModel.setAppState({
        allAlbumCollections,
      });
    },

    setCollectionRating(payload, rootState) {
      console.log('%c--- setCollectionRating ---', 'color:#07a098');
      const { isFavourite, ratingKey, rating } = payload;

      // update artist collections
      const prevArtistCollections = rootState.appModel.allArtistCollections;
      const allArtistCollections = prevArtistCollections ? [...prevArtistCollections] : [];
      const artistCollectionIndex = allArtistCollections.findIndex(
        (collection) => collection.collectionId === ratingKey
      );
      if (artistCollectionIndex !== -1) {
        allArtistCollections[artistCollectionIndex].isFavourite = isFavourite;
        allArtistCollections[artistCollectionIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allArtistCollections,
        });
      }

      // update album collections
      const prevAlbumCollections = rootState.appModel.allAlbumCollections;
      const allAlbumCollections = prevAlbumCollections ? [...prevAlbumCollections] : [];
      const albumCollectionIndex = allAlbumCollections.findIndex((collection) => collection.collectionId === ratingKey);
      if (albumCollectionIndex !== -1) {
        allAlbumCollections[albumCollectionIndex].isFavourite = isFavourite;
        allAlbumCollections[albumCollectionIndex].userRating = rating;
        dispatch.appModel.setAppState({
          allAlbumCollections,
        });
      }
    },

    //
    // MUSIC - GENRES
    //

    storeArtistGenreItems: createStoreTagItemsEffect('allArtistGenreItems'),
    storeArtistGenreItems404: createStoreTagItems404Effect('allArtistGenres', 'genreId'),
    storeAlbumGenreItems: createStoreTagItemsEffect('allAlbumGenreItems'),
    storeAlbumGenreItems404: createStoreTagItems404Effect('allAlbumGenres', 'genreId'),

    //
    // MUSIC - MOODS
    //

    storeArtistMoodItems: createStoreTagItemsEffect('allArtistMoodItems'),
    storeArtistMoodItems404: createStoreTagItems404Effect('allArtistMoods', 'moodId'),
    storeAlbumMoodItems: createStoreTagItemsEffect('allAlbumMoodItems'),
    storeAlbumMoodItems404: createStoreTagItems404Effect('allAlbumMoods', 'moodId'),

    //
    // MUSIC - STYLES
    //

    storeArtistStyleItems: createStoreTagItemsEffect('allArtistStyleItems'),
    storeArtistStyleItems404: createStoreTagItems404Effect('allArtistStyles', 'styleId'),
    storeAlbumStyleItems: createStoreTagItemsEffect('allAlbumStyleItems'),
    storeAlbumStyleItems404: createStoreTagItems404Effect('allAlbumStyles', 'styleId'),

    //
    // MUSIC - TAGS
    //

    storeArtistTagItems: createStoreTagItemsEffect('allArtistTagItems'),
    storeArtistTagItems404: createStoreTagItems404Effect('allArtistTags', 'tagId'),
    storeAlbumTagItems: createStoreTagItemsEffect('allAlbumTagItems'),
    storeAlbumTagItems404: createStoreTagItems404Effect('allAlbumTags', 'tagId'),
  };
};

// ======================================================================
// EXPORT
// ======================================================================

export const appModel = {
  // initial state
  state,
  // reducers - handle state changes with pure functions
  reducers,
  // effects - handle state changes with impure functions
  effects,
};
