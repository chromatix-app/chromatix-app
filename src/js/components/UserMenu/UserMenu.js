// ======================================================================
// IMPORTS
// ======================================================================

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Icon } from 'js/components';
import { appPlatform } from 'js/utils';

import style from './UserMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserMenu = ({ variant = 'default' }) => {
  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);

  const currentUser = useSelector(({ appModel }) => appModel.currentUser);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  const hasSelectedLibrary = currentServer && currentLibrary;
  const hasQueueVisible = queueIsVisible && hasSelectedLibrary;

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {showMenu && appPlatform !== 'win' && <div className={style.overlay} onClick={toggleMenu}></div>}

      <div
        className={clsx(style.wrap, style[`wrap${variant}`], {
          [style.wrapWithoutLibrary]: !hasSelectedLibrary,
          [style.wrapWithLibrary]: hasSelectedLibrary,
          [style.wrapWithQueue]: hasQueueVisible,
        })}
      >
        <button className={style.status} onClick={toggleMenu}>
          {hasSelectedLibrary && (
            <div className={style.content}>
              <div className={style.library}>{currentLibrary.title}</div>
              <div className={style.server}>{currentServer.name}</div>
            </div>
          )}
          <div className={style.thumb}>
            {!currentUser.thumb && (
              <span className={style.thumbIcon}>
                <Icon icon="ArtistCollectionsIcon" cover stroke strokeWidth={1.4} />
              </span>
            )}
            {currentUser.thumb && <img src={currentUser.thumb} alt={currentUser.title} draggable="false" />}
          </div>
        </button>

        {showMenu && (
          <div className={style.menu}>
            {hasSelectedLibrary && (
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
                                <Icon icon="MusicNoteDoubleIcon" cover stroke />
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
                  draggable="false"
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
