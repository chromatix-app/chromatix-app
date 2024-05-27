// ======================================================================
// IMPORTS
// ======================================================================

import * as plex from 'js/services/plex';

// ======================================================================
// OPTIONS
// ======================================================================

const maxDataLength = 5;

// ======================================================================
// STATE
// ======================================================================

const appState = {
  inited: false,
  standalone: false,
  history: null,

  plexErrorGeneral: false,
  plexErrorLogin: false,
  plexErrorServer: false,

  scrollToPlaying: false,
};

const userState = {
  loggedIn: false,
  currentUser: null,
  allServers: null,
};

const plexServerState = {
  plexBaseUrl: null,
  allLibraries: null,
};

const plexLibraryState = {
  // artists
  allArtists: null,
  allArtistAlbums: {},
  allArtistRelated: {},
  // albums
  allAlbums: null,
  allAlbumTracks: {},
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
  // styles
  allArtistStyles: null,
  allArtistStyleItems: {},
  allAlbumStyles: null,
  allAlbumStyleItems: {},
  // moods
  allArtistMoods: null,
  allArtistMoodItems: {},
  allAlbumMoods: null,
  allAlbumMoodItems: {},
};

const state = Object.assign({}, appState, userState, plexServerState, plexLibraryState);

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

const effects = (dispatch) => ({
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
    // initialise plex
    plex.init();
  },

  //
  // AUTH
  //

  doLogin(payload, rootState) {
    console.log('%c--- login ---', 'color:#07a098');
    plex.login();
  },

  doLogout(payload, rootState) {
    console.log('%c--- logout ---', 'color:#07a098');
    dispatch.playerModel.playerLogQuit();
    plex.logout();
    rootState.appModel.history.replace('/');
  },

  setLoggedIn(payload, rootState) {
    console.log('%c--- setLoggedIn ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      inited: true,
      loggedIn: true,
      currentUser: payload,
    });
    dispatch.sessionModel.loadLocalStorage();
    dispatch.playerModel.playerRefresh();
    plex.getAllServers();
  },

  setLoggedOut(payload, rootState) {
    console.log('%c--- setLoggedOut ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      inited: true,
      ...Object.assign({}, userState),
      ...Object.assign({}, plexServerState),
      ...Object.assign({}, plexLibraryState),
    });
    dispatch.playerModel.playerUnload();
    dispatch.sessionModel.setLoggedOut();
  },

  //
  // PLEX
  //

  plexErrorLogin(payload, rootState) {
    // console.log('%c--- plexErrorLogin ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      plexErrorLogin: true,
    });
  },

  dismissPlexErrorLogin(payload, rootState) {
    // console.log('%c--- dismissPlexErrorLogin ---', 'color:#07a098');
    if (rootState.appModel.isInited) {
      dispatch.appModel.setAppState({
        plexErrorLogin: false,
      });
    } else {
      window.location.reload();
    }
  },

  clearPlexServerState(payload, rootState) {
    console.log('%c--- clearPlexServerState ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      ...Object.assign({}, plexServerState),
      ...Object.assign({}, plexLibraryState),
    });
    dispatch.playerModel.playerUnload();
  },

  clearPlexLibraryState(payload, rootState) {
    console.log('%c--- clearPlexLibraryState ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      ...Object.assign({}, plexLibraryState),
    });
    rootState.appModel.history.push('/');
    plex.getAllPlaylists();
  },

  storeAllServers(payload, rootState) {
    // console.log('%c--- storeAllServers ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      allServers: payload,
    });
    dispatch.sessionModel.refreshCurrentServer(payload);
    plex.getAllLibraries();
  },

  storeAllLibraries(payload, rootState) {
    // console.log('%c--- storeAllLibraries ---', 'color:#07a098');
    dispatch.appModel.setAppState({
      allLibraries: payload,
    });
    dispatch.sessionModel.refreshCurrentLibrary(payload);
  },

  //
  // PLEX - ARTISTS
  //

  storeArtistDetails(payload, rootState) {
    console.log('%c--- storeArtistDetails ---', 'color:#07a098');
    const allArtists = [...rootState.appModel.allArtists];
    const artistIndex = allArtists.findIndex((artist) => artist.artistId === payload.artistId);
    if (artistIndex === -1) {
      // limit recent entries
      if (allArtists.length >= maxDataLength) {
        allArtists.shift();
      }
      // add the new entry and save
      allArtists.push(payload);
    } else {
      allArtists[artistIndex] = payload;
    }
    dispatch.appModel.setAppState({
      allArtists,
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
    const allArtistRelated = { ...rootState.appModel.allArtistRelated };
    // limit recent entries
    const keys = Object.keys(allArtistRelated);
    if (keys.length >= maxDataLength) {
      delete allArtistRelated[keys[0]];
    }
    // add the new entry and save
    allArtistRelated[libraryId + '-' + artistId] = artistRelated;
    dispatch.appModel.setAppState({
      allArtistRelated,
    });
  },

  setArtistRating(payload, rootState) {
    console.log('%c--- setArtistRating ---', 'color:#07a098');
    const { ratingKey, rating } = payload;

    // update artist
    const prevArtists = rootState.appModel.allArtists;
    const allArtists = prevArtists ? [...prevArtists] : [];
    const artistIndex = allArtists.findIndex((artist) => artist.artistId === ratingKey);
    if (artistIndex !== -1) {
      allArtists[artistIndex].userRating = rating;
      dispatch.appModel.setAppState({
        allArtists,
      });
    }

    // update artist collection items
    const allArtistCollectionItems = { ...rootState.appModel.allArtistCollectionItems };
    const collectionKeys = Object.keys(allArtistCollectionItems);
    collectionKeys.forEach((key) => {
      const artistCollectionItems = allArtistCollectionItems[key];
      const artistIndex = artistCollectionItems.findIndex((artist) => artist.artistId === ratingKey);
      if (artistIndex !== -1) {
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
        artistGenreItems[artistIndex].userRating = rating;
        allArtistGenreItems[key] = artistGenreItems;
      }
    });

    // update artist style items
    const allArtistStyleItems = { ...rootState.appModel.allArtistStyleItems };
    const styleKeys = Object.keys(allArtistStyleItems);
    styleKeys.forEach((key) => {
      const artistStyleItems = allArtistStyleItems[key];
      const artistIndex = artistStyleItems.findIndex((artist) => artist.artistId === ratingKey);
      if (artistIndex !== -1) {
        artistStyleItems[artistIndex].userRating = rating;
        allArtistStyleItems[key] = artistStyleItems;
      }
    });

    // update artist mood items
    const allArtistMoodItems = { ...rootState.appModel.allArtistMoodItems };
    const moodKeys = Object.keys(allArtistMoodItems);
    moodKeys.forEach((key) => {
      const artistMoodItems = allArtistMoodItems[key];
      const artistIndex = artistMoodItems.findIndex((artist) => artist.artistId === ratingKey);
      if (artistIndex !== -1) {
        artistMoodItems[artistIndex].userRating = rating;
        allArtistMoodItems[key] = artistMoodItems;
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
  // PLEX - ALBUMS
  //

  storeAlbumDetails(payload, rootState) {
    console.log('%c--- storeAlbumDetails ---', 'color:#07a098');
    const allAlbums = [...rootState.appModel.allAlbums];
    const albumIndex = allAlbums.findIndex((album) => album.albumId === payload.albumId);
    if (albumIndex === -1) {
      // limit recent entries
      if (allAlbums.length >= maxDataLength) {
        allAlbums.shift();
      }
      // add the new entry and save
      allAlbums.push(payload);
    } else {
      allAlbums[albumIndex] = payload;
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
    const { ratingKey, rating } = payload;

    // update albums
    const prevAlbums = rootState.appModel.allAlbums;
    const allAlbums = prevAlbums ? [...prevAlbums] : [];
    const albumIndex = allAlbums.findIndex((album) => album.albumId === ratingKey);
    if (albumIndex !== -1) {
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
        artistAlbums[albumIndex].userRating = rating;
        allArtistAlbums[key] = artistAlbums;
      }
    });
    dispatch.appModel.setAppState({
      allArtistAlbums,
    });

    // update album collection items
    const allAlbumCollectionItems = { ...rootState.appModel.allAlbumCollectionItems };
    const collectionKeys = Object.keys(allAlbumCollectionItems);
    collectionKeys.forEach((key) => {
      const albumCollectionItems = allAlbumCollectionItems[key];
      console.log(albumCollectionItems);
      const albumIndex = albumCollectionItems.findIndex((album) => album.albumId === ratingKey);
      if (albumIndex !== -1) {
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
        albumGenreItems[albumIndex].userRating = rating;
        allAlbumGenreItems[key] = albumGenreItems;
      }
    });

    // update album style items
    const allAlbumStyleItems = { ...rootState.appModel.allAlbumStyleItems };
    const styleKeys = Object.keys(allAlbumStyleItems);
    styleKeys.forEach((key) => {
      const albumStyleItems = allAlbumStyleItems[key];
      const albumIndex = albumStyleItems.findIndex((album) => album.albumId === ratingKey);
      if (albumIndex !== -1) {
        albumStyleItems[albumIndex].userRating = rating;
        allAlbumStyleItems[key] = albumStyleItems;
      }
    });

    // update album mood items
    const allAlbumMoodItems = { ...rootState.appModel.allAlbumMoodItems };
    const moodKeys = Object.keys(allAlbumMoodItems);
    moodKeys.forEach((key) => {
      const albumMoodItems = allAlbumMoodItems[key];
      const albumIndex = albumMoodItems.findIndex((album) => album.albumId === ratingKey);
      if (albumIndex !== -1) {
        albumMoodItems[albumIndex].userRating = rating;
        allAlbumMoodItems[key] = albumMoodItems;
      }
    });

    // save
    dispatch.appModel.setAppState({
      allAlbumCollectionItems,
      allAlbumGenreItems,
      allAlbumStyleItems,
      allAlbumMoodItems,
    });
  },

  //
  // PLEX - PLAYLISTS
  //

  storePlaylistDetails(payload, rootState) {
    console.log('%c--- storePlaylistDetails ---', 'color:#07a098');
    const allPlaylists = [...rootState.appModel.allPlaylists];
    const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === payload.playlistId);
    if (playlistIndex === -1) {
      // limit recent entries
      if (allPlaylists.length >= maxDataLength) {
        allPlaylists.shift();
      }
      // add the new entry and save
      allPlaylists.push(payload);
    } else {
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
    const { ratingKey, rating } = payload;
    const prevPlaylists = rootState.appModel.allPlaylists;
    const allPlaylists = prevPlaylists ? [...prevPlaylists] : [];
    const playlistIndex = allPlaylists.findIndex((playlist) => playlist.playlistId === ratingKey);
    if (playlistIndex !== -1) {
      allPlaylists[playlistIndex].userRating = rating;
      dispatch.appModel.setAppState({
        allPlaylists,
      });
    }
  },

  //
  // PLEX - TRACKS
  //

  setTrackRating(payload, rootState) {
    console.log('%c--- setTrackRating ---', 'color:#07a098');
    const { ratingKey, rating } = payload;

    // update album tracks
    const allAlbumTracks = { ...rootState.appModel.allAlbumTracks };
    const albumKeys = Object.keys(allAlbumTracks);
    albumKeys.forEach((key) => {
      const albumTracks = allAlbumTracks[key];
      const trackIndex = albumTracks.findIndex((track) => track.trackId === ratingKey);
      if (trackIndex !== -1) {
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
        playlistTracks[trackIndex].userRating = rating;
        allPlaylistTracks[key] = playlistTracks;
      }
    });
    dispatch.appModel.setAppState({
      allAlbumTracks,
      allPlaylistTracks,
    });
  },

  //
  // PLEX - COLLECTIONS
  //

  storeArtistCollectionItems(payload, rootState) {
    console.log('%c--- storeArtistCollectionItems ---', 'color:#07a098');
    const { libraryId, collectionId, artistCollectionItems } = payload;
    const allArtistCollectionItems = { ...rootState.appModel.allArtistCollectionItems };
    // limit recent entries
    const keys = Object.keys(allArtistCollectionItems);
    if (keys.length >= maxDataLength) {
      delete allArtistCollectionItems[keys[0]];
    }
    // add the new entry and save
    allArtistCollectionItems[libraryId + '-' + collectionId] = artistCollectionItems;
    dispatch.appModel.setAppState({
      allArtistCollectionItems,
    });
  },

  storeAlbumCollectionItems(payload, rootState) {
    console.log('%c--- storeAlbumCollectionItems ---', 'color:#07a098');
    const { libraryId, collectionId, albumCollectionItems } = payload;
    const allAlbumCollectionItems = { ...rootState.appModel.allAlbumCollectionItems };
    // limit recent entries
    const keys = Object.keys(allAlbumCollectionItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumCollectionItems[keys[0]];
    }
    // add the new entry and save
    allAlbumCollectionItems[libraryId + '-' + collectionId] = albumCollectionItems;
    dispatch.appModel.setAppState({
      allAlbumCollectionItems,
    });
  },

  setCollectionRating(payload, rootState) {
    console.log('%c--- setCollectionRating ---', 'color:#07a098');
    const { ratingKey, rating } = payload;

    // update artist collections
    const prevArtistCollections = rootState.appModel.allArtistCollections;
    const allArtistCollections = prevArtistCollections ? [...prevArtistCollections] : [];
    const artistCollectionIndex = allArtistCollections.findIndex((collection) => collection.collectionId === ratingKey);
    if (artistCollectionIndex !== -1) {
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
      allAlbumCollections[albumCollectionIndex].userRating = rating;
      dispatch.appModel.setAppState({
        allAlbumCollections,
      });
    }
  },

  //
  // PLEX - GENRES
  //

  storeArtistGenreItems(payload, rootState) {
    console.log('%c--- storeArtistGenreItems ---', 'color:#07a098');
    const { libraryId, genreId, artistGenreItems } = payload;
    const allArtistGenreItems = { ...rootState.appModel.allArtistGenreItems };
    // limit recent entries
    const keys = Object.keys(allArtistGenreItems);
    if (keys.length >= maxDataLength) {
      delete allArtistGenreItems[keys[0]];
    }
    // add the new entry and save
    allArtistGenreItems[libraryId + '-' + genreId] = artistGenreItems;
    dispatch.appModel.setAppState({
      allArtistGenreItems,
    });
  },

  storeAlbumGenreItems(payload, rootState) {
    console.log('%c--- storeAlbumGenreItems ---', 'color:#07a098');
    const { libraryId, genreId, albumGenreItems } = payload;
    const allAlbumGenreItems = { ...rootState.appModel.allAlbumGenreItems };
    // limit recent entries
    const keys = Object.keys(allAlbumGenreItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumGenreItems[keys[0]];
    }
    // add the new entry and save
    allAlbumGenreItems[libraryId + '-' + genreId] = albumGenreItems;
    dispatch.appModel.setAppState({
      allAlbumGenreItems,
    });
  },

  //
  // PLEX - STYLES
  //

  storeArtistStyleItems(payload, rootState) {
    console.log('%c--- storeArtistStyleItems ---', 'color:#07a098');
    const { libraryId, styleId, artistStyleItems } = payload;
    const allArtistStyleItems = { ...rootState.appModel.allArtistStyleItems };
    // limit recent entries
    const keys = Object.keys(allArtistStyleItems);
    if (keys.length >= maxDataLength) {
      delete allArtistStyleItems[keys[0]];
    }
    // add the new entry and save
    allArtistStyleItems[libraryId + '-' + styleId] = artistStyleItems;
    dispatch.appModel.setAppState({
      allArtistStyleItems,
    });
  },

  storeAlbumStyleItems(payload, rootState) {
    console.log('%c--- storeAlbumStyleItems ---', 'color:#07a098');
    const { libraryId, styleId, albumStyleItems } = payload;
    const allAlbumStyleItems = { ...rootState.appModel.allAlbumStyleItems };
    // limit recent entries
    const keys = Object.keys(allAlbumStyleItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumStyleItems[keys[0]];
    }
    // add the new entry and save
    allAlbumStyleItems[libraryId + '-' + styleId] = albumStyleItems;
    dispatch.appModel.setAppState({
      allAlbumStyleItems,
    });
  },

  //
  // PLEX - MOODS
  //

  storeArtistMoodItems(payload, rootState) {
    console.log('%c--- storeArtistMoodItems ---', 'color:#07a098');
    const { libraryId, moodId, artistMoodItems } = payload;
    const allArtistMoodItems = { ...rootState.appModel.allArtistMoodItems };
    // limit recent entries
    const keys = Object.keys(allArtistMoodItems);
    if (keys.length >= maxDataLength) {
      delete allArtistMoodItems[keys[0]];
    }
    // add the new entry and save
    allArtistMoodItems[libraryId + '-' + moodId] = artistMoodItems;
    dispatch.appModel.setAppState({
      allArtistMoodItems,
    });
  },

  storeAlbumMoodItems(payload, rootState) {
    console.log('%c--- storeAlbumMoodItems ---', 'color:#07a098');
    const { libraryId, moodId, albumMoodItems } = payload;
    const allAlbumMoodItems = { ...rootState.appModel.allAlbumMoodItems };
    // limit recent entries
    const keys = Object.keys(allAlbumMoodItems);
    if (keys.length >= maxDataLength) {
      delete allAlbumMoodItems[keys[0]];
    }
    // add the new entry and save
    allAlbumMoodItems[libraryId + '-' + moodId] = albumMoodItems;
    dispatch.appModel.setAppState({
      allAlbumMoodItems,
    });
  },
});

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
