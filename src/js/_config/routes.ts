// ======================================================================
// DEFAULT (LOGGED OUT) ROUTES
// ======================================================================

// const isProduction = process.env.REACT_APP_ENV === 'production';

export const defaultRoutes = [
  // index
  {
    path: '/',
    exact: true,
    component: 'Login',
  },

  // other
  {
    component: 'Error404Default',
  },
];

// ======================================================================
// AUTHORISED (LOGGED IN) ROUTES
// ======================================================================

export const authRoutes = [
  // index
  {
    path: '/',
    exact: true,
    redirect: '/artists',
  },
  {
    path: '/servers',
    exact: true,
    component: 'ServerList',
  },
  {
    path: '/libraries',
    exact: true,
    component: 'LibraryList',
  },

  // artists
  {
    path: '/artists',
    exact: true,
    component: 'ArtistList',
  },
  {
    path: '/artists/:libraryId',
    exact: true,
    redirect: '/artists',
  },
  {
    path: '/artists/:libraryId/:artistId',
    exact: true,
    component: 'ArtistDetail',
  },

  // albums
  {
    path: '/albums',
    exact: true,
    component: 'AlbumList',
  },
  {
    path: '/albums/:libraryId',
    exact: true,
    redirect: '/albums',
  },
  {
    path: '/albums/:libraryId/:albumId',
    exact: true,
    component: 'AlbumDetail',
  },

  // playlists
  {
    path: '/playlists',
    exact: true,
    component: 'PlaylistList',
  },
  {
    path: '/playlists/:libraryId',
    exact: true,
    redirect: '/playlists',
  },
  {
    path: '/playlists/:libraryId/:playlistId',
    exact: true,
    component: 'PlaylistDetail',
  },

  // folders
  {
    path: '/folders',
    exact: true,
    component: 'FolderList',
  },
  {
    path: '/folders/:libraryId/:folderId',
    exact: true,
    component: 'FolderList',
  },

  // artist collections
  {
    path: '/artist-collections',
    exact: true,
    component: 'ArtistCollectionList',
  },
  {
    path: '/artist-collections/:libraryId/:collectionId',
    exact: true,
    component: 'ArtistCollectionItems',
  },

  // album collections
  {
    path: '/album-collections',
    exact: true,
    component: 'AlbumCollectionList',
  },
  {
    path: '/album-collections/:libraryId/:collectionId',
    exact: true,
    component: 'AlbumCollectionItems',
  },

  // artist genres
  {
    path: '/artist-genres',
    exact: true,
    component: 'ArtistGenreList',
  },
  {
    path: '/artist-genres/:libraryId/:genreId',
    exact: true,
    component: 'ArtistGenreItems',
  },

  // album genres
  {
    path: '/album-genres',
    exact: true,
    component: 'AlbumGenreList',
  },
  {
    path: '/album-genres/:libraryId/:genreId',
    exact: true,
    component: 'AlbumGenreItems',
  },

  // artist styles
  {
    path: '/artist-styles',
    exact: true,
    component: 'ArtistStyleList',
  },
  {
    path: '/artist-styles/:libraryId/:styleId',
    exact: true,
    component: 'ArtistStyleItems',
  },

  // album styles
  {
    path: '/album-styles',
    exact: true,
    component: 'AlbumStyleList',
  },
  {
    path: '/album-styles/:libraryId/:styleId',
    exact: true,
    component: 'AlbumStyleItems',
  },

  // artist moods
  {
    path: '/artist-moods',
    exact: true,
    component: 'ArtistMoodList',
  },
  {
    path: '/artist-moods/:libraryId/:moodId',
    exact: true,
    component: 'ArtistMoodItems',
  },

  // album moods
  {
    path: '/album-moods',
    exact: true,
    component: 'AlbumMoodList',
  },
  {
    path: '/album-moods/:libraryId/:moodId',
    exact: true,
    component: 'AlbumMoodItems',
  },

  // settings
  {
    path: '/settings',
    exact: true,
    component: 'Settings',
  },
  {
    path: '/settings/general',
    exact: true,
    component: 'SettingsGeneral',
  },
  {
    path: '/settings/appearance',
    exact: true,
    component: 'SettingsAppearance',
  },
  {
    path: '/settings/menu',
    exact: true,
    component: 'SettingsMenu',
  },
  {
    path: '/settings/lastfm',
    exact: true,
    component: 'SettingsLastFM',
  },
  {
    path: '/settings/changelog',
    exact: true,
    component: 'SettingsChangelog',
  },

  // other
  {
    component: 'Error404Auth',
  },
];

// ======================================================================
// ROUTE CONTENT
// ======================================================================

// type Route = {
//   path?: string;
//   exact?: boolean;
//   component?: string;
//   redirect?: string;
// };

// const formatConfig = (routes: Route[]): { [key: string]: Route } => {
//   let configObject: { [key: string]: Route } = {};
//   for (let i in routes) {
//     let route = routes[i];
//     if (route.path) {
//       configObject[route.path] = { ...route };
//     }
//   }
//   return configObject;
// };

// export const defaultRouteConfig = formatConfig(defaultRoutes);
// export const authRouteConfig = formatConfig(authRoutes);
