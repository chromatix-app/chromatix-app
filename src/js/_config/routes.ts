// ======================================================================
// DEFAULT (LOGGED OUT) ROUTES
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';
// const isProduction = process.env.REACT_APP_ENV === 'production';

export const defaultRoutes = [
  // main
  {
    path: '/',
    exact: true,
    component: 'Home',
  },
  {
    path: '/login-jellyfin',
    exact: true,
    component: 'LoginJelly',
  },

  // error
  {
    component: 'Error404Default',
  },
];

// ======================================================================
// AUTHORISED (LOGGED IN) ROUTES
// ======================================================================

export const authRoutes = [
  // main
  {
    path: '/',
    exact: true,
    redirect: '/artists',
  },
  {
    path: '/login-jellyfin',
    exact: true,
    redirect: '/artists',
  },
  {
    path: '/users',
    exact: true,
    component: 'UserArray',
  },
  {
    path: '/servers',
    exact: true,
    component: 'ServerArray',
  },
  {
    path: '/libraries',
    exact: true,
    component: 'LibraryArray',
  },

  // artists
  {
    path: '/artists',
    exact: true,
    component: 'ArtistArray',
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

  // album
  {
    path: '/album-artists',
    exact: true,
    component: 'AlbumArtistArray',
  },
  {
    path: '/album-artists/:libraryId',
    exact: true,
    redirect: '/album-artists',
  },
  {
    path: '/album-artists/:libraryId/:artistId',
    exact: true,
    component: 'AlbumArtistDetail',
  },

  // albums
  {
    path: '/albums',
    exact: true,
    component: 'AlbumArray',
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

  // folders
  {
    path: '/folders',
    exact: true,
    component: 'FolderItems',
  },
  {
    path: '/folders/:libraryId',
    exact: true,
    redirect: '/folders',
  },
  {
    path: '/folders/:libraryId/:folderId',
    exact: true,
    component: 'FolderItems',
  },

  // playlists
  {
    path: '/playlists',
    exact: true,
    component: 'PlaylistArray',
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

  // artist collections
  {
    path: '/artist-collections',
    exact: true,
    component: 'ArtistCollectionArray',
  },
  {
    path: '/artist-collections/:libraryId',
    exact: true,
    redirect: '/artist-collections',
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
    component: 'AlbumCollectionArray',
  },
  {
    path: '/album-collections/:libraryId',
    exact: true,
    redirect: '/album-collections',
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
    component: 'ArtistGenreArray',
  },
  {
    path: '/artist-genres/:libraryId',
    exact: true,
    redirect: '/artist-genres',
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
    component: 'AlbumGenreArray',
  },
  {
    path: '/album-genres/:libraryId',
    exact: true,
    redirect: '/album-genres',
  },
  {
    path: '/album-genres/:libraryId/:genreId',
    exact: true,
    component: 'AlbumGenreItems',
  },

  // artist moods
  {
    path: '/artist-moods',
    exact: true,
    component: 'ArtistMoodArray',
  },
  {
    path: '/artist-moods/:libraryId',
    exact: true,
    redirect: '/artist-moods',
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
    component: 'AlbumMoodArray',
  },
  {
    path: '/album-moods/:libraryId',
    exact: true,
    redirect: '/album-moods',
  },
  {
    path: '/album-moods/:libraryId/:moodId',
    exact: true,
    component: 'AlbumMoodItems',
  },

  // artist styles
  {
    path: '/artist-styles',
    exact: true,
    component: 'ArtistStyleArray',
  },
  {
    path: '/artist-styles/:libraryId',
    exact: true,
    redirect: '/artist-styles',
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
    component: 'AlbumStyleArray',
  },
  {
    path: '/album-styles/:libraryId',
    exact: true,
    redirect: '/album-styles',
  },
  {
    path: '/album-styles/:libraryId/:styleId',
    exact: true,
    component: 'AlbumStyleItems',
  },

  // artist tags
  {
    path: '/artist-tags',
    exact: true,
    component: 'ArtistTagArray',
  },
  {
    path: '/artist-tags/:libraryId',
    exact: true,
    redirect: '/artist-tags',
  },
  {
    path: '/artist-tags/:libraryId/:tagId',
    exact: true,
    component: 'ArtistTagItems',
  },

  // album tags
  {
    path: '/album-tags',
    exact: true,
    component: 'AlbumTagArray',
  },
  {
    path: '/album-tags/:libraryId',
    exact: true,
    redirect: '/album-tags',
  },
  {
    path: '/album-tags/:libraryId/:tagId',
    exact: true,
    component: 'AlbumTagItems',
  },

  // settings
  {
    path: '/settings',
    exact: true,
    component: 'Settings',
  },
  {
    path: '/settings/about',
    exact: true,
    component: 'SettingsAbout',
  },
  {
    path: '/settings/appearance',
    exact: true,
    component: 'SettingsAppearance',
  },
  {
    path: '/settings/browse',
    exact: true,
    component: 'SettingsBrowse',
  },
  {
    path: '/settings/changelog',
    exact: true,
    component: 'SettingsChangelog',
  },
  {
    path: '/settings/controls',
    exact: true,
    component: 'SettingsControls',
  },
  {
    path: '/settings/downloads',
    exact: true,
    component: 'SettingsDownloads',
  },
  {
    path: '/settings/general',
    exact: true,
    component: 'SettingsGeneral',
  },
  {
    path: '/settings/lastfm',
    exact: true,
    component: 'SettingsLastFM',
  },
  {
    path: '/settings/sidebar',
    exact: true,
    component: 'SettingsSidebar',
  },

  // dev tools
  ...(isLocal
    ? [
        {
          path: '/components',
          exact: true,
          component: 'DevComponents',
        },
        {
          path: '/dev-components',
          exact: true,
          redirect: '/components',
        },
        {
          path: '/icons',
          exact: true,
          component: 'DevIcons',
        },
        {
          path: '/dev-icons',
          exact: true,
          redirect: '/icons',
        },
        {
          path: '/modals',
          exact: true,
          component: 'DevModals',
        },
        {
          path: '/dev-modals',
          exact: true,
          redirect: '/modals',
        },
      ]
    : []),

  // error
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
