// ======================================================================
// IMPORTS
// ======================================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './UserMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserMenu = () => {
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
                    <React.Fragment key={server.serverId}>
                      <button
                        className={clsx(style.button, style.buttonServer)}
                        onClick={() => {
                          dispatch.sessionModel.switchCurrentServer(server.serverId);
                          toggleMenu();
                        }}
                      >
                        <span className={style.iconBefore}>
                          <Icon icon="ServerIcon" cover stroke />
                        </span>
                        {server.name}
                        <span className={clsx(style.iconArrow, style.iconHover)}>
                          <Icon icon="NextIcon" cover stroke />
                        </span>
                      </button>

                      {server.serverId === currentServer.serverId &&
                        allLibraries &&
                        allLibraries.map((library) => {
                          const isCurrentLibrary = library.libraryId === currentLibrary.libraryId;
                          return (
                            <button
                              key={library.libraryId}
                              className={clsx(style.button, style.buttonLibrary)}
                              onClick={() => {
                                dispatch.sessionModel.switchCurrentLibrary(library.libraryId);
                                toggleMenu();
                              }}
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
                            </button>
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

export default UserMenu;
