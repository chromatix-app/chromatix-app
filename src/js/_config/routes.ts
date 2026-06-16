// ======================================================================
// DEFAULT (LOGGED OUT) ROUTES
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';
// const isProduction = import.meta.env.VITE_ENV === 'production';

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
  // redirects — handled by BrowserRouteSwitch
  {
    path: '/',
    xRedirect: '/libraries/:currentLibraryId/artists',
  },
  {
    path: '/login-jellyfin',
    xRedirect: '/libraries/:currentLibraryId/artists',
  },

  // main
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
  {
    path: '/libraries/:libraryId',
    xRedirect: '/libraries/:libraryId/artists',
  },

  // artists
  {
    path: '/libraries/:libraryId/artists',
    exact: true,
    component: 'ArtistArray',
  },
  {
    path: '/libraries/:libraryId/artists/:artistId',
    exact: true,
    component: 'ArtistDetail',
  },

  // album artists
  {
    path: '/libraries/:libraryId/album-artists',
    exact: true,
    component: 'AlbumArtistArray',
  },
  {
    path: '/libraries/:libraryId/album-artists/:artistId',
    exact: true,
    component: 'AlbumArtistDetail',
  },

  // albums
  {
    path: '/libraries/:libraryId/albums',
    exact: true,
    component: 'AlbumArray',
  },
  {
    path: '/libraries/:libraryId/albums/:albumId',
    exact: true,
    component: 'AlbumDetail',
  },

  // folders
  {
    path: '/libraries/:libraryId/folders',
    exact: true,
    component: 'FolderItems',
  },
  {
    path: '/libraries/:libraryId/folders/:folderId',
    exact: true,
    component: 'FolderItems',
  },

  // playlists
  {
    path: '/libraries/:libraryId/playlists',
    exact: true,
    component: 'PlaylistArray',
  },
  {
    path: '/libraries/:libraryId/playlists/:playlistId',
    exact: true,
    component: 'PlaylistDetail',
  },

  // artist collections
  {
    path: '/libraries/:libraryId/artist-collections',
    exact: true,
    component: 'ArtistCollectionArray',
  },
  {
    path: '/libraries/:libraryId/artist-collections/:collectionId',
    exact: true,
    component: 'ArtistCollectionItems',
  },

  // album collections
  {
    path: '/libraries/:libraryId/album-collections',
    exact: true,
    component: 'AlbumCollectionArray',
  },
  {
    path: '/libraries/:libraryId/album-collections/:collectionId',
    exact: true,
    component: 'AlbumCollectionItems',
  },

  // artist genres
  {
    path: '/libraries/:libraryId/artist-genres',
    exact: true,
    component: 'ArtistGenreArray',
  },
  {
    path: '/libraries/:libraryId/artist-genres/:genreId',
    exact: true,
    component: 'ArtistGenreItems',
  },

  // album genres
  {
    path: '/libraries/:libraryId/album-genres',
    exact: true,
    component: 'AlbumGenreArray',
  },
  {
    path: '/libraries/:libraryId/album-genres/:genreId',
    exact: true,
    component: 'AlbumGenreItems',
  },

  // artist moods
  {
    path: '/libraries/:libraryId/artist-moods',
    exact: true,
    component: 'ArtistMoodArray',
  },
  {
    path: '/libraries/:libraryId/artist-moods/:moodId',
    exact: true,
    component: 'ArtistMoodItems',
  },

  // album moods
  {
    path: '/libraries/:libraryId/album-moods',
    exact: true,
    component: 'AlbumMoodArray',
  },
  {
    path: '/libraries/:libraryId/album-moods/:moodId',
    exact: true,
    component: 'AlbumMoodItems',
  },

  // artist styles
  {
    path: '/libraries/:libraryId/artist-styles',
    exact: true,
    component: 'ArtistStyleArray',
  },
  {
    path: '/libraries/:libraryId/artist-styles/:styleId',
    exact: true,
    component: 'ArtistStyleItems',
  },

  // album styles
  {
    path: '/libraries/:libraryId/album-styles',
    exact: true,
    component: 'AlbumStyleArray',
  },
  {
    path: '/libraries/:libraryId/album-styles/:styleId',
    exact: true,
    component: 'AlbumStyleItems',
  },

  // artist tags
  {
    path: '/libraries/:libraryId/artist-tags',
    exact: true,
    component: 'ArtistTagArray',
  },
  {
    path: '/libraries/:libraryId/artist-tags/:tagId',
    exact: true,
    component: 'ArtistTagItems',
  },

  // album tags
  {
    path: '/libraries/:libraryId/album-tags',
    exact: true,
    component: 'AlbumTagArray',
  },
  {
    path: '/libraries/:libraryId/album-tags/:tagId',
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
    path: '/settings/keyboard',
    exact: true,
    component: 'SettingsKeyboard',
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
          path: '/dev',
          exact: true,
          component: 'DevIndex',
        },
        {
          path: '/dev/components',
          exact: true,
          component: 'DevComponents',
        },
        {
          path: '/dev/icons',
          exact: true,
          component: 'DevIcons',
        },
        {
          path: '/dev/modals',
          exact: true,
          component: 'DevModals',
        },
        {
          path: '/dev/settings',
          exact: true,
          component: 'DevSettings',
        },
      ]
    : []),

  // legacy path redirects — handled by BrowserRouteSwitch
  // [NOTE] not used locally to avoid masking potential issues with legacy paths during development,
  // but included in production to avoid breaking existing links and user habits
  // [NOTE] to be removed in future
  ...(!isLocal
    ? [
        {
          path: '/artists',
          xRedirect: '/libraries/:currentLibraryId/artists',
        },
        {
          path: '/artists/:libraryId',
          xRedirect: '/libraries/:libraryId/artists',
        },
        {
          path: '/artists/:libraryId/:artistId',
          xRedirect: '/libraries/:libraryId/artists/:artistId',
        },

        {
          path: '/album-artists',
          xRedirect: '/libraries/:currentLibraryId/album-artists',
        },
        {
          path: '/album-artists/:libraryId',
          xRedirect: '/libraries/:libraryId/album-artists',
        },
        {
          path: '/album-artists/:libraryId/:artistId',
          xRedirect: '/libraries/:libraryId/album-artists/:artistId',
        },

        {
          path: '/albums',
          xRedirect: '/libraries/:currentLibraryId/albums',
        },
        {
          path: '/albums/:libraryId',
          xRedirect: '/libraries/:libraryId/albums',
        },
        {
          path: '/albums/:libraryId/:albumId',
          xRedirect: '/libraries/:libraryId/albums/:albumId',
        },

        {
          path: '/folders',
          xRedirect: '/libraries/:currentLibraryId/folders',
        },
        {
          path: '/folders/:libraryId',
          xRedirect: '/libraries/:libraryId/folders',
        },
        {
          path: '/folders/:libraryId/:folderId',
          xRedirect: '/libraries/:libraryId/folders/:folderId',
        },

        {
          path: '/playlists',
          xRedirect: '/libraries/:currentLibraryId/playlists',
        },
        {
          path: '/playlists/:libraryId',
          xRedirect: '/libraries/:libraryId/playlists',
        },
        {
          path: '/playlists/:libraryId/:playlistId',
          xRedirect: '/libraries/:libraryId/playlists/:playlistId',
        },

        {
          path: '/artist-collections',
          xRedirect: '/libraries/:currentLibraryId/artist-collections',
        },
        {
          path: '/artist-collections/:libraryId',
          xRedirect: '/libraries/:libraryId/artist-collections',
        },
        {
          path: '/artist-collections/:libraryId/:collectionId',
          xRedirect: '/libraries/:libraryId/artist-collections/:collectionId',
        },

        {
          path: '/album-collections',
          xRedirect: '/libraries/:currentLibraryId/album-collections',
        },
        {
          path: '/album-collections/:libraryId',
          xRedirect: '/libraries/:libraryId/album-collections',
        },
        {
          path: '/album-collections/:libraryId/:collectionId',
          xRedirect: '/libraries/:libraryId/album-collections/:collectionId',
        },

        {
          path: '/artist-genres',
          xRedirect: '/libraries/:currentLibraryId/artist-genres',
        },
        {
          path: '/artist-genres/:libraryId',
          xRedirect: '/libraries/:libraryId/artist-genres',
        },
        {
          path: '/artist-genres/:libraryId/:genreId',
          xRedirect: '/libraries/:libraryId/artist-genres/:genreId',
        },

        {
          path: '/album-genres',
          xRedirect: '/libraries/:currentLibraryId/album-genres',
        },
        {
          path: '/album-genres/:libraryId',
          xRedirect: '/libraries/:libraryId/album-genres',
        },
        {
          path: '/album-genres/:libraryId/:genreId',
          xRedirect: '/libraries/:libraryId/album-genres/:genreId',
        },

        {
          path: '/artist-moods',
          xRedirect: '/libraries/:currentLibraryId/artist-moods',
        },
        {
          path: '/artist-moods/:libraryId',
          xRedirect: '/libraries/:libraryId/artist-moods',
        },
        {
          path: '/artist-moods/:libraryId/:moodId',
          xRedirect: '/libraries/:libraryId/artist-moods/:moodId',
        },

        {
          path: '/album-moods',
          xRedirect: '/libraries/:currentLibraryId/album-moods',
        },
        {
          path: '/album-moods/:libraryId',
          xRedirect: '/libraries/:libraryId/album-moods',
        },
        {
          path: '/album-moods/:libraryId/:moodId',
          xRedirect: '/libraries/:libraryId/album-moods/:moodId',
        },

        {
          path: '/artist-styles',
          xRedirect: '/libraries/:currentLibraryId/artist-styles',
        },
        {
          path: '/artist-styles/:libraryId',
          xRedirect: '/libraries/:libraryId/artist-styles',
        },
        {
          path: '/artist-styles/:libraryId/:styleId',
          xRedirect: '/libraries/:libraryId/artist-styles/:styleId',
        },

        {
          path: '/album-styles',
          xRedirect: '/libraries/:currentLibraryId/album-styles',
        },
        {
          path: '/album-styles/:libraryId',
          xRedirect: '/libraries/:libraryId/album-styles',
        },
        {
          path: '/album-styles/:libraryId/:styleId',
          xRedirect: '/libraries/:libraryId/album-styles/:styleId',
        },

        {
          path: '/artist-tags',
          xRedirect: '/libraries/:currentLibraryId/artist-tags',
        },
        {
          path: '/artist-tags/:libraryId',
          xRedirect: '/libraries/:libraryId/artist-tags',
        },
        {
          path: '/artist-tags/:libraryId/:tagId',
          xRedirect: '/libraries/:libraryId/artist-tags/:tagId',
        },

        {
          path: '/album-tags',
          xRedirect: '/libraries/:currentLibraryId/album-tags',
        },
        {
          path: '/album-tags/:libraryId',
          xRedirect: '/libraries/:libraryId/album-tags',
        },
        {
          path: '/album-tags/:libraryId/:tagId',
          xRedirect: '/libraries/:libraryId/album-tags/:tagId',
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
