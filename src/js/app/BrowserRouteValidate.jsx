// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router-dom';

// ======================================================================
// COMPONENT
// ======================================================================

const BrowserRouteValidate = ({ children }) => {
  const { path } = useRouteMatch();

  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  const currentUser = useSelector(({ sessionModel }) => sessionModel.currentUser);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  if (loggedIn) {
    // no user set
    if (!currentUser && path !== '/users') {
      // console.log(111);
      return <Redirect to="/users" />;
    }

    // user set
    else if (currentUser && path === '/users') {
      // console.log(222);
      return <Redirect to="/" />;
    }

    // no server set
    else if (currentUser && !currentServer && path !== '/servers') {
      // console.log(333);
      return <Redirect to="/servers" />;
    }

    // server set
    else if (currentServer && path === '/servers') {
      // console.log(444);
      return <Redirect to="/" />;
    }

    // no library set
    else if (currentUser && currentServer && !currentLibrary && path !== '/libraries') {
      // console.log(555);
      return <Redirect to="/libraries" />;
    }

    // library set
    else if (currentLibrary && path === '/libraries') {
      // console.log(666);
      return <Redirect to="/" />;
    }
  }

  return children;
};

// ======================================================================
// EXPORT
// ======================================================================

export default BrowserRouteValidate;
