// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

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
                <NavLink
                  className={style.button}
                  to={'/settings'}
                  onClick={() => {
                    toggleMenu();
                  }}
                >
                  Settings
                  <span className={style.icon}>
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
              Logout
              <span className={style.icon}>
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
