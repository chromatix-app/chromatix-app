// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { defaultRoutes, authRoutes } from 'js/_config/routes';
import BrowserRouteValidate from 'js/app/BrowserRouteValidate';
import * as pages from 'js/pages';

// ======================================================================
// COMPONENT
// ======================================================================

const BrowserRouteSwitch = () => {
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  // currentLibraryId is passed into authRoutes so xRedirects can resolve the active library
  const currentLibraryId = useSelector(({ sessionModel }) => sessionModel.currentLibrary?.libraryId);

  // Serve entirely different route sets depending on auth state
  if (loggedIn) {
    return renderRoutes(authRoutes, { currentLibraryId });
  } else {
    return renderRoutes(defaultRoutes);
  }
};

// Renders a list of route config objects as a React Router <Switch>.
// storeParams supplies store-derived values (e.g. currentLibraryId) for resolving xRedirect paths.
const renderRoutes = (routes, storeParams = {}) => {
  return (
    <Switch>
      {routes.map(({ component, ...route }, index) => {
        if (component || route.path) {
          const ActualComponent = pages[component];
          // xRedirect routes must be exact so they don't accidentally swallow child paths
          const exact = route.xRedirect ? true : route.exact;

          return (
            <Route
              key={index}
              {...route}
              exact={exact}
              render={(props) => {
                // xRedirect - a dynamic redirect that interpolates both URL params and store values.
                // Used to migrate legacy paths (e.g. /artists) to the current URL shape (/libraries/:id/artists).
                if (route.xRedirect) {
                  // Merge store values and URL params; URL params win if both supply the same key
                  const params = { ...storeParams, ...props.match.params };

                  // Replace every :token in the xRedirect string with its resolved value from params
                  // e.g. '/libraries/:currentLibraryId/artists' → '/libraries/abc123/artists'
                  const resolved = route.xRedirect.replace(/:(\w+)/g, (_, key) => params[key] ?? '');

                  // If any param was missing the replacement leaves an empty segment ("//"); fall back to /libraries
                  // This should never happen.
                  const target = resolved.includes('//') ? '/libraries' : resolved;

                  // console.log('Redirecting from', props.location.pathname, 'to', target);

                  return <Redirect to={target} />;
                }

                // Static redirect — no interpolation needed
                if (route.redirect) {
                  return <Redirect to={route.redirect} />;
                }

                // Default - render the component
                return (
                  <>
                    {ActualComponent && (
                      <BrowserRouteValidate {...route} {...props}>
                        <ActualComponent {...props} />
                      </BrowserRouteValidate>
                    )}
                  </>
                );
              }}
            />
          );
        } else {
          return null;
        }
      })}
    </Switch>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default BrowserRouteSwitch;
