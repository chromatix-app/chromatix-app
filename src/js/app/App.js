// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ControlBar, RightBar, SideBar, UserMenu } from 'js/components';
import { useColorTheme, useGotRequiredData, useScrollRestoration } from 'js/hooks';
import { ErrorPlexGeneral, ErrorPlexLogin } from 'js/pages';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// RENDER
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
// const isLocal = process.env.REACT_APP_ENV === 'local';

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  const plexErrorGeneral = useSelector(({ appModel }) => appModel.plexErrorGeneral);
  const plexErrorLogin = useSelector(({ appModel }) => appModel.plexErrorLogin);

  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const debugConsole = useSelector(({ persistentModel }) => persistentModel.debugConsole);

  const gotRequiredData = useGotRequiredData();

  const history = useHistory();
  const dispatch = useDispatch();

  useColorTheme();
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

  // toggle class on html if logged in
  useEffect(() => {
    if (loggedIn) {
      document.documentElement.classList.add('logged-in');
    } else {
      document.documentElement.classList.remove('logged-in');
    }
  }, [loggedIn]);

  // plex errors
  if (plexErrorLogin) {
    return (
      <div className="wrap">
        <ErrorPlexLogin />
      </div>
    );
  } else if (plexErrorGeneral) {
    return (
      <div className="wrap">
        <ErrorPlexGeneral />
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
      <div className="wrap wrap--home">
        <BrowserRouteSwitch />
        {/* <Blocker /> */}
      </div>
    );
  }

  // logged in
  else {
    if (!currentServer || !currentLibrary) {
      return (
        <div className="wrap">
          <BrowserRouteSwitch />
          <UserMenu />
          {/* <Blocker /> */}
        </div>
      );
    } else {
      return (
        <div className="wrap">
          <div className="layout">
            <div className="layout-sidebar">
              <SideBar />
            </div>
            <div id="content" className="layout-content">
              <BrowserRouteSwitch />
            </div>
            {queueIsVisible && (
              <div className="layout-rightbar">
                <RightBar />
              </div>
            )}
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
