// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router-dom';

// ======================================================================
// RENDER
// ======================================================================

const BrowserRouteValidate = ({ children }) => {
  const { path } = useRouteMatch();

  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);

  if (loggedIn) {
    // no server set
    if (!currentServer && path !== '/servers') {
      console.log(111);
      return <Redirect to="/servers" />;
    }

    // server set
    if (currentServer && path === '/servers') {
      console.log(222);
      return <Redirect to="/" />;
    }
  }

  return children;
};

// ======================================================================
// EXPORT
// ======================================================================

export default BrowserRouteValidate;
