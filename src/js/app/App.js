// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';

import { ControlBar, SideBar, UserStatus } from 'js/components';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// RENDER
// ======================================================================

const isProduction = process.env.REACT_APP_ENV === 'production';
// const isLocal = process.env.REACT_APP_ENV === 'local';

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);

  const debugConsole = useSelector(({ persistentModel }) => persistentModel.debugConsole);

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
      history.listen(() => {
        console.log(history.location.pathname);
        // scroll the page to the top
        window.scrollTo(0, 0);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history]
  );

  // loading
  if (!inited) {
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
    return (
      <div className={clsx('wrap')}>
        <div className={clsx('layout')}>
          <div className="layout-sidebar">
            <SideBar />
          </div>
          <div className={clsx('layout-content')}>
            <BrowserRouteSwitch />
          </div>
          <div className={clsx('layout-controls')}>
            <ControlBar />
          </div>
          {/* <Blocker /> */}
        </div>
        <UserStatus />
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default App;
