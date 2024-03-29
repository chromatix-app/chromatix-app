// ======================================================================
// IMPORTS
// ======================================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './UserStatus.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserStatus = () => {
  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);

  const currentUser = useSelector(({ appModel }) => appModel.currentUser);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {showMenu && <div className={style.overlay} onClick={toggleMenu}></div>}

      <div className={style.wrap}>
        <button className={style.status} onClick={toggleMenu}>
          <div className={style.content}>
            {currentLibrary && currentServer && (
              <>
                <div className={style.library}>{currentLibrary.title}</div>
                <div className={style.server}>{currentServer.name}</div>
              </>
            )}
            {!(currentLibrary && currentServer) && <div className={style.library}>{currentUser.title}</div>}
          </div>
          <div className={style.thumb}>
            {currentUser.thumb && <img src={currentUser.thumb} alt={currentUser.title} />}
          </div>
        </button>

        {showMenu && (
          <div className={style.menu}>
            {currentLibrary && currentServer && (
              <>
                {allServers &&
                  allServers.map((server) => (
                    <React.Fragment key={server.accessToken}>
                      <NavLink className={clsx(style.button, style.buttonServer)} to={'/'}>
                        <span className={style.iconBefore}>
                          <Icon icon="ServerIcon" cover stroke />
                        </span>
                        {server.name}
                        <span className={clsx(style.iconArrow, style.iconHover)}>
                          <Icon icon="NextIcon" cover stroke />
                        </span>
                      </NavLink>

                      {server.accessToken === currentServer.accessToken &&
                        allLibraries &&
                        allLibraries.map((library) => {
                          const isCurrentLibrary = library.libraryId === currentLibrary.libraryId;
                          return (
                            <NavLink
                              key={library.libraryId}
                              className={clsx(style.button, style.buttonLibrary)}
                              to={'/'}
                            >
                              <span className={style.iconBefore}>
                                <Icon icon="MusicNoteIcon" cover stroke />
                              </span>
                              {library.title}
                              {isCurrentLibrary && (
                                <span className={clsx(style.iconAfter, style.iconCurrent)}>
                                  <Icon icon="CheckCircleIcon" cover stroke />
                                </span>
                              )}
                              {!isCurrentLibrary && (
                                <span className={clsx(style.iconAfter, style.iconHover)}>
                                  <Icon icon="CheckCircleIcon" cover stroke />
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                    </React.Fragment>
                  ))}

                <NavLink
                  className={style.button}
                  to={'/settings'}
                  onClick={() => {
                    toggleMenu();
                  }}
                >
                  <span className={style.iconBefore}>
                    <Icon icon="CogIcon" cover stroke />
                  </span>
                  Settings
                  <span className={clsx(style.iconArrow, style.iconHover)}>
                    <Icon icon="NextIcon" cover stroke />
                  </span>
                </NavLink>
              </>
            )}

            <button
              className={style.button}
              onClick={() => {
                dispatch.appModel.doLogout();
                toggleMenu();
              }}
            >
              <span className={style.iconBefore}>
                <Icon icon="LogoutIcon" cover stroke />
              </span>
              Logout
              <span className={clsx(style.iconArrow, style.iconHover)}>
                <Icon icon="NextIcon" cover stroke />
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default UserStatus;
