// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';

import { ControlBar, SideBar, UserMenu } from 'js/components';
import { useGotRequiredData } from 'js/hooks';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// RENDER
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
// const isLocal = process.env.REACT_APP_ENV === 'local';

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const debugConsole = useSelector(({ persistentModel }) => persistentModel.debugConsole);

  const gotRequiredData = useGotRequiredData();

  const history = useHistory();
  const dispatch = useDispatch();

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

  // handle route changes
  useEffect(
    () =>
      history.listen((location, action) => {
        console.log(history.location.pathname);
        // scroll the page to the top
        if (action !== 'POP') {
          window.scrollTo(0, 0);
          document.getElementById('content')?.scrollTo(0, 0);
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history]
  );

  // loading
  if (!inited || (loggedIn && !gotRequiredData)) {
    return (
      <div className={clsx('wrap')}>
        <div className="loading"></div>
      </div>
    );
  }

  // logged out
  else if (!loggedIn) {
    return (
      <div className={clsx('wrap')}>
        <BrowserRouteSwitch />
        {/* <Blocker /> */}
      </div>
    );
  }

  // logged in
  else {
    if (!currentServer || !currentLibrary) {
      return (
        <div className={clsx('wrap')}>
          <BrowserRouteSwitch />
          <UserMenu />
          {/* <Blocker /> */}
        </div>
      );
    } else {
      return (
        <div className={clsx('wrap')}>
          <div className={clsx('layout')}>
            <div className="layout-sidebar">
              <SideBar />
            </div>
            <div id="content" className={clsx('layout-content')}>
              <BrowserRouteSwitch />
            </div>
            <div className={clsx('layout-controls')}>
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
