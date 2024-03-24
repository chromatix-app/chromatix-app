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
    component: 'Error404',
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
    path: '/albums',
    exact: true,
    component: 'Albums',
  },
  {
    path: '/artists',
    exact: true,
    component: 'Artists',
  },

  // other
  {
    component: 'Error404',
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
