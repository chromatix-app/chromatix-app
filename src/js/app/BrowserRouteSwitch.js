// ======================================================================
// IMPORTS
// ======================================================================

// import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import { defaultRoutes, authRoutes } from 'js/_config/routes';
import * as pages from 'js/pages';

// ======================================================================
// RENDER
// ======================================================================

const renderRoutes = (routes) => {
  return (
    <Switch>
      {routes.map(({ component, ...route }, index) => {
        if (component || route.path) {
          const ActualComponent = pages[component];
          return (
            <Route
              key={index}
              {...route}
              render={(props) =>
                route.redirect ? (
                  <Redirect to={route.redirect} />
                ) : (
                  <>{ActualComponent && <ActualComponent {...props} />}</>
                )
              }
            />
          );
        } else {
          return null;
        }
      })}
    </Switch>
  );
};

const BrowserRouteSwitch = () => {
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);

  if (loggedIn) {
    return renderRoutes(authRoutes);
  } else {
    return renderRoutes(defaultRoutes);
  }
};

// ======================================================================
// PROPTYPES
// ======================================================================

// BrowserRouteSwitch.propTypes = {
//   loggedIn: PropTypes.bool.isRequired,
// };

// ======================================================================
// EXPORT
// ======================================================================

export default BrowserRouteSwitch;
