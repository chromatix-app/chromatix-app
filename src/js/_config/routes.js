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

  // artists
  {
    path: '/artists',
    exact: true,
    component: 'Artists',
  },
  {
    path: '/artists/:artistId',
    exact: true,
    component: 'ArtistDetail',
  },

  // albums
  {
    path: '/albums',
    exact: true,
    component: 'Albums',
  },
  {
    path: '/albums/:albumId',
    exact: true,
    component: 'AlbumDetail',
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
