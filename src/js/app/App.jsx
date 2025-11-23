// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import Modals from 'js/app/Modals';
import { ControlBar, ElectronUI, FullPagePlayer, Queue, SideBar, ToastNotification, UserMenu } from 'js/components';
import {
  useColorTheme,
  useElectronStatus,
  useGotRequiredData,
  useNetworkStatus,
  useScrollRestoration,
  useStyleOptions,
  useWindowSize,
} from 'js/hooks';
import { ErrorPage } from 'js/pages';
import { getEnvironment, sendToElectron } from 'js/utils';
import BrowserRouteSwitch from 'js/app/BrowserRouteSwitch';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';
const isPreview = process.env.REACT_APP_ENV === 'preview';
const isProduction = process.env.REACT_APP_ENV === 'production';

const envData = getEnvironment();

const App = () => {
  const inited = useSelector(({ appModel }) => appModel.inited);
  const loggedIn = useSelector(({ appModel }) => appModel.loggedIn);

  const errorAllUsers = useSelector(({ appModel }) => appModel.errorAllUsers);
  const errorFastestConnection = useSelector(({ appModel }) => appModel.errorFastestConnection);
  const errorLibraries = useSelector(({ appModel }) => appModel.errorLibraries);
  const errorLogin = useSelector(({ appModel }) => appModel.errorLogin);
  const errorServers = useSelector(({ appModel }) => appModel.errorServers);
  const errorSwitchUser = useSelector(({ appModel }) => appModel.errorSwitchUser);
  const errorUser = useSelector(({ appModel }) => appModel.errorUser);

  const accessibilityFocus = useSelector(({ sessionModel }) => sessionModel.accessibilityFocus);
  const currentUser = useSelector(({ sessionModel }) => sessionModel.currentUser);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const winCustomScrollbars = useSelector(({ sessionModel }) => sessionModel.winCustomScrollbars);
  const winAutoHideScrollbars = useSelector(({ sessionModel }) => sessionModel.winAutoHideScrollbars);

  const gotRequiredData = useGotRequiredData();

  const dispatch = useDispatch();
  const history = useHistory();

  useColorTheme();
  useElectronStatus();
  useNetworkStatus();
  useScrollRestoration();
  useStyleOptions();

  // disable console logs in production
  useEffect(() => {
    if (isProduction) {
      console.log('Console logs are disabled in production');
      console.debug = () => {};
      console.error = () => {};
      console.log = () => {};
    }
  }, []);

  // set document title based on environment
  useEffect(() => {
    if (isLocal) {
      if (document.title.indexOf('(Local)') === -1) {
        document.title = document.title + ' (Local)';
      }
    } else if (isPreview) {
      if (document.title.indexOf('(Preview)') === -1) {
        document.title = document.title + ' (Preview)';
      }
    }
  }, []);

  // initialise on load
  useEffect(() => {
    // send app info to electron
    sendToElectron('any', 'app-info', {
      version: process.env.REACT_APP_VERSION,
    });

    // add browser and OS information to html
    document.documentElement.setAttribute('data-browser', envData.browserName);
    document.documentElement.setAttribute('data-os', envData.osName);

    // add local class to html
    if (isLocal) {
      document.documentElement.classList.add('env-local');
    }

    // add electron classes to html
    if (envData.isElectron) {
      document.documentElement.classList.add('electron');
      document.documentElement.classList.add('electron-platform-' + envData.electronPlatformId);
    }

    // save history for reference within models
    dispatch.appModel.init({
      history: history,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initialise on load
  useEffect(() => {
    // add scrollbars preferences to html
    document.documentElement.setAttribute('data-scrollbars', winCustomScrollbars);
    document.documentElement.setAttribute('data-scrollbars-hide', winAutoHideScrollbars);
  }, [winCustomScrollbars, winAutoHideScrollbars]);

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
  if (errorAllUsers) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your available users.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorAllUsers}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorFastestConnection) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, it was not possible to connect to the requested server.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorFastestConnection}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorLibraries) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your available libraries.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorLibraries}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorLogin) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error logging in to your account.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorLogin}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorServers) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your available servers.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorServers}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorSwitchUser) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error switching your user.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorSwitchUser}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  } else if (errorUser) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <ErrorPage
          title="Oops!"
          body={
            <>
              Sorry, there was an error retrieving your user data.
              <br />
              <br />
              Please try again.
            </>
          }
          buttonText="Ok"
          buttonClick={dispatch.appModel.dismissErrorUser}
        />
        {loggedIn && <UserMenu withoutLibrary />}
      </div>
    );
  }

  // loading
  else if (!inited || (loggedIn && !gotRequiredData)) {
    return (
      <div className="wrap">
        {envData.isElectron && <ElectronUI />}
        <div className="loading"></div>
      </div>
    );
  }

  // logged out
  else if (!loggedIn) {
    return (
      <div className="wrap wrap--home">
        {envData.isElectron && <ElectronUI />}
        <BrowserRouteSwitch />
      </div>
    );
  }

  // logged in
  else {
    if (!currentUser || !currentServer || !currentLibrary) {
      return (
        <div className="wrap">
          {envData.isElectron && <ElectronUI />}
          <BrowserRouteSwitch />
          <UserMenu />
        </div>
      );
    } else {
      return <AppMain />;
    }
  }
};

const breakPoints = [620, 680, 800, 860, 920, 980, 1100, 1220];

const AppMain = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const contentRef = useRef();

  const [contentBreakpoint, setContentBreakpoint] = useState(0);
  const [contentContainerClass, setContentContainerClass] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const fullPageMode = useSelector(({ appModel }) => appModel.fullPageMode);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const { windowWidth } = useWindowSize();

  // Disable full page view on history change
  useEffect(() => {
    if (fullPageMode) {
      dispatch.appModel.fullPageOff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Handle window resizing
  useEffect(() => {
    if (fullPageMode) return;
    const newWidth = contentRef.current.offsetWidth;
    const bpList = breakPoints.filter((bp) => bp <= newWidth);
    const newContainerClass = bpList.map((bp) => 'cq-' + bp).join(' ');
    const newBreakpoint = bpList[bpList.length - 1] || 0;
    if (contentContainerClass !== newContainerClass) {
      setContentContainerClass(newContainerClass);
    }
    if (contentWidth !== newWidth) {
      setContentWidth(newWidth);
    }
    if (contentBreakpoint !== newBreakpoint) {
      setContentBreakpoint(newBreakpoint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowWidth, queueIsVisible, fullPageMode]);

  // Store current breakpoint (this theoretically won't run until after the HTML has re-rendered, which is essential)
  useEffect(() => {
    dispatch.appModel.setAppState({
      contentBreakpoint,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentBreakpoint]);

  // Store current content width
  useEffect(() => {
    dispatch.appModel.setAppState({
      contentWidth,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentWidth]);

  return (
    <div className="wrap">
      {envData.isElectron && <ElectronUI />}

      {fullPageMode && <FullPagePlayer />}

      {!fullPageMode && (
        <div className="layout">
          <div className="layout-sidebar">
            <SideBar />
          </div>
          <div className="layout-controls">
            <ControlBar />
          </div>
          <div ref={contentRef} id="content" className={clsx('layout-content', contentContainerClass)}>
            {envData.electronPlatformId !== 'win' && <UserMenu />}
            <BrowserRouteSwitch />
          </div>
          {queueIsVisible && (
            <div className="layout-rightbar">
              <Queue />
            </div>
          )}
        </div>
      )}

      <Modals />
      <ToastNotification />
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default App;
