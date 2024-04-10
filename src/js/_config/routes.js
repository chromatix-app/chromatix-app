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

  // artist collections
  {
    path: '/artist-collections',
    exact: true,
    component: 'ArtistCollectionList',
  },
  {
    path: '/artist-collections/:libraryId/:collectionId',
    exact: true,
    component: 'CollectionDetail',
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
    component: 'CollectionDetail',
  },

  // artist genres
  {
    path: '/artist-genres',
    exact: true,
    component: 'ArtistGenreList',
  },

  // album genres
  {
    path: '/album-genres',
    exact: true,
    component: 'AlbumGenreList',
  },

  // settings
  {
    path: '/settings',
    exact: true,
    component: 'Settings',
  },

  // other
  {
    component: 'Error404Auth',
  },
];

// ======================================================================
// ROUTE CONTENT
// ======================================================================

const formatConfig = (routes) => {
  let configObject = {};
  for (let i in routes) {
    let route = routes[i];
    if (route.path) {
      configObject[route.path] = { ...route };
    }
  }
  return configObject;
};

export const defaultRouteConfig = formatConfig(defaultRoutes);
export const authRouteConfig = formatConfig(authRoutes);
