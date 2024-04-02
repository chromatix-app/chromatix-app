// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ControlBar, SideBar, UserMenu } from 'js/components';
import { useGotRequiredData, useScrollRestoration } from 'js/hooks';
import { ErrorPlex } from 'js/pages';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// RENDER
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
// const isLocal = process.env.REACT_APP_ENV === 'local';

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  const plexError = useSelector(({ appModel }) => appModel.plexError);

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const debugConsole = useSelector(({ persistentModel }) => persistentModel.debugConsole);

  const gotRequiredData = useGotRequiredData();

  const history = useHistory();
  const dispatch = useDispatch();

  useScrollRestoration();

  // disable console logs
  useEffect(() => {
    if (isProduction && !debugConsole) {
      console.log = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }, [debugConsole]);

  // initialise on load
  useEffect(() => {
    // save history for reference within models
    dispatch.appModel.init({
      history: history,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // plex error
  if (plexError) {
    return (
      <div className="wrap">
        <ErrorPlex />
      </div>
    );
  }

  // loading
  else if (!inited || (loggedIn && !gotRequiredData)) {
    return (
      <div className="wrap">
        <div className="loading"></div>
      </div>
    );
  }

  // logged out
  else if (!loggedIn) {
    return (
      <div className="wrap">
        <BrowserRouteSwitch />
        {/* <Blocker /> */}
      </div>
    );
  }

  // logged in
  else {
    if (!currentServer || !currentLibrary) {
      return (
        <div className="wrap wrap--auth">
          <BrowserRouteSwitch />
          <UserMenu />
          {/* <Blocker /> */}
        </div>
      );
    } else {
      return (
        <div className="wrap wrap--auth">
          <div className="layout">
            <div className="layout-sidebar">
              <SideBar />
            </div>
            <div id="content" className="layout-content">
              <BrowserRouteSwitch />
            </div>
            <div className="layout-controls">
              <ControlBar />
            </div>
            {/* <Blocker /> */}
          </div>
          <UserMenu />
        </div>
      );
    }
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default App;
