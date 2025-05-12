// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './UserMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserMenu = ({ variant = 'default' }) => {
  const dispatch = useDispatch();

  const currentUser = useSelector(({ appModel }) => appModel.currentUser);
  const currentServer = useSelector(({ sessionModel }) => sessionModel.currentServer);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const queueIsVisible = useSelector(({ sessionModel }) => sessionModel.queueIsVisible);

  const allServers = useSelector(({ appModel }) => appModel.allServers);
  const allLibraries = useSelector(({ appModel }) => appModel.allLibraries);

  const hasSelectedLibrary = currentServer && currentLibrary;
  const hasQueueVisible = queueIsVisible && hasSelectedLibrary;

  const anchorSide = variant === 'Inline' ? 'right' : 'bottom';
  const anchorAlign = variant === 'Inline' ? 'start' : 'end';

  return (
    <>
      <div
        className={clsx(style.wrap, style[`wrap${variant}`], {
          [style.wrapWithoutLibrary]: !hasSelectedLibrary,
          [style.wrapWithLibrary]: hasSelectedLibrary,
          [style.wrapWithQueue]: hasQueueVisible,
        })}
      >
        <RadixMenu.Root
        // open
        >
          <RadixMenu.Trigger className={style.status}>
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
          </RadixMenu.Trigger>

          <RadixMenu.Portal>
            <RadixMenu.Content
              side={anchorSide}
              align={anchorAlign}
              className={clsx(style.menu, style[`menu${variant}`])}
            >
              {hasSelectedLibrary && allServers && (
                <>
                  <RadixMenu.Group>
                    <RadixMenu.Label className={style.label}>
                      {/* Plex •  */}
                      {currentUser.email}
                    </RadixMenu.Label>

                    {allServers.map((server) => (
                      <React.Fragment key={server.serverId}>
                        <RadixMenu.Item asChild>
                          <button
                            className={clsx(style.button, style.buttonServer)}
                            onClick={() => {
                              dispatch.sessionModel.switchCurrentServer(server.serverId);
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
                        </RadixMenu.Item>

                        {server.serverId === currentServer.serverId &&
                          allLibraries &&
                          allLibraries.map((library) => {
                            const isCurrentLibrary = library.libraryId === currentLibrary.libraryId;
                            return (
                              <RadixMenu.Item key={library.libraryId} asChild>
                                <button
                                  className={clsx(style.button, style.buttonLibrary, {
                                    [style.buttonCurrent]: isCurrentLibrary,
                                  })}
                                  onClick={() => {
                                    dispatch.sessionModel.switchCurrentLibrary(library.libraryId);
                                  }}
                                >
                                  <span className={style.iconBefore}>
                                    <Icon icon="MusicNoteDoubleIcon" cover stroke />
                                  </span>
                                  {library.title}
                                  {isCurrentLibrary && (
                                    <span className={clsx(style.iconAfter, style.iconCurrent)}>
                                      <Icon icon="CheckCircleFilledIcon" cover />
                                    </span>
                                  )}
                                  {!isCurrentLibrary && (
                                    <span className={clsx(style.iconAfter, style.iconHover)}>
                                      <Icon icon="CheckCircleCheckedIcon" cover stroke />
                                    </span>
                                  )}
                                </button>
                              </RadixMenu.Item>
                            );
                          })}
                      </React.Fragment>
                    ))}
                  </RadixMenu.Group>

                  <RadixMenu.Separator className={style.separator} />
                </>
              )}

              <RadixMenu.Group>
                {hasSelectedLibrary && allServers && (
                  <RadixMenu.Item asChild>
                    <NavLink className={style.button} to={'/settings'} draggable="false">
                      <span className={style.iconBefore}>
                        <Icon icon="CogIcon" cover stroke />
                      </span>
                      Settings
                      <span className={clsx(style.iconArrow, style.iconHover)}>
                        <Icon icon="NextIcon" cover stroke />
                      </span>
                    </NavLink>
                  </RadixMenu.Item>
                )}

                <RadixMenu.Item asChild>
                  <button
                    className={style.button}
                    onClick={() => {
                      dispatch.appModel.doLogout();
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
                </RadixMenu.Item>
              </RadixMenu.Group>
            </RadixMenu.Content>
          </RadixMenu.Portal>
        </RadixMenu.Root>
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default UserMenu;
