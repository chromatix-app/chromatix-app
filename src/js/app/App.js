// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';

import { ControlBar, RightBar, SideBar, UserMenu } from 'js/components';
import { useColorTheme, useGotRequiredData, useScrollRestoration, useWindowSize } from 'js/hooks';
import { ErrorPage } from 'js/pages';
import { isElectron, electronPlatform } from 'js/utils';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// COMPONENT
// ======================================================================

// const isLocal = process.env.REACT_APP_ENV === 'local';
const isProduction = process.env.REACT_APP_ENV === 'production';

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);

  const errorPlexFastestServer = useSelector(({ appModel }) => appModel.errorPlexFastestServer);
  const errorPlexLibraries = useSelector(({ appModel }) => appModel.errorPlexLibraries);
  const errorPlexLogin = useSelector(({ appModel }) => appModel.errorPlexLogin);
  const errorPlexServers = useSelector(({ appModel }) => appModel.errorPlexServers);
  const errorPlexUser = useSelector(({ appModel }) => appModel.errorPlexUser);

  const accessibilityFocus = useSelector(({ sessionModel }) => sessionModel.accessibilityFocus);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const gotRequiredData = useGotRequiredData();

  const history = useHistory();
  const dispatch = useDispatch();

  useColorTheme();
  useScrollRestoration();

  // disable console logs
  useEffect(() => {
    if (isProduction) {
      console.log = () => {};
      console.error = () => {};
      console.debug = () => {};
    }
  }, []);

  // initialise on load
  useEffect(() => {
    // add electron classes to html
    if (isElectron) {
      document.documentElement.classList.add('electron');
      document.documentElement.classList.add('electron-platform-' + electronPlatform);
    }

    // save history for reference within models
    dispatch.appModel.init({
      history: history,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toggle class on html if accessibility focus is enabled
  useEffect(() => {
    if (accessibilityFocus) {
      document.documentElement.classList.add('access-focus');
    } else {
      document.documentElement.classList.remove('access-focus');
    }
  }, [accessibilityFocus]);

  // toggle class on html if logged in
  useEffect(() => {
    if (loggedIn) {
      document.documentElement.classList.add('logged-in');
    } else {
      document.documentElement.classList.remove('logged-in');
    }
  }, [loggedIn]);

  // error pages
  if (errorPlexFastestServer) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, it was not possible to connect to the requested Plex server.
              <br />
              <br />
              Please try again later.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorPlexFastestServer}
        />
      </div>
    );
  } else if (errorPlexLibraries) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your available Plex libraries.
              <br />
              <br />
              Please try again later.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorPlexLibraries}
        />
      </div>
    );
  } else if (errorPlexLogin) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error logging in to Plex.
              <br />
              <br />
              Please try again later.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorPlexLogin}
        />
      </div>
    );
  } else if (errorPlexServers) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your available Plex servers.
              <br />
              <br />
              Please try again later.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorPlexServers}
        />
      </div>
    );
  } else if (errorPlexUser) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your user data from Plex.
              <br />
              <br />
              Please try again later.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorPlexUser}
        />
      </div>
    );
  }

  // loading
  else if (!inited || (loggedIn && !gotRequiredData)) {
    return (
      <div className="wrap">
        <div className="electron-drag"></div>
        <div className="loading"></div>
      </div>
    );
  }

  // logged out
  else if (!loggedIn) {
    return (
      <div className="wrap wrap--home">
        <div className="electron-drag"></div>
        <BrowserRouteSwitch />
      </div>
    );
  }

  // logged in
  else {
    if (!currentServer || !currentLibrary) {
      return (
        <div className="wrap">
          <div className="electron-drag"></div>
          <BrowserRouteSwitch />
          <UserMenu />
        </div>
      );
    } else {
      return <AppMain />;
    }
  }
};

const breakPoints = [620, 680, 800, 860, 920, 980];

const AppMain = () => {
  const contentRef = useRef();

  const [contentContainerClass, setContentContainerClass] = useState(0);

  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const { windowWidth } = useWindowSize();

  // handle window size
  useEffect(() => {
    const contentWidth = contentRef.current.offsetWidth;
    const classList = breakPoints
      .filter((bp) => bp <= contentWidth)
      .map((bp) => 'cq-' + bp)
      .join(' ');
    setContentContainerClass(classList);
  }, [windowWidth, queueIsVisible]);

  return (
    <div className="wrap">
      <div className="electron-drag"></div>
      <div className="layout">
        <div className="layout-sidebar">
          <SideBar />
        </div>
        <div className="layout-controls">
          <ControlBar />
        </div>
        <div ref={contentRef} id="content" className={clsx('layout-content', contentContainerClass)}>
          {electronPlatform !== 'win' && <UserMenu />}
          <BrowserRouteSwitch />
        </div>
        {queueIsVisible && (
          <div className="layout-rightbar">
            <RightBar />
          </div>
        )}
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default App;
