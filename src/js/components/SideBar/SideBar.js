// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';

import { Icon } from 'js/components';
import * as plex from 'js/services/plex';

import style from './SideBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SideBar = () => {
  const history = useHistory();

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);

  const canGoBack = history.length > 1;
  const canGoForward = history.index < history.length - 1;

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <div className={style.wrap}>
      <div className={style.nav}>
        <button className={style.prev} disabled={!canGoBack} onClick={() => history.goBack()}>
          <Icon icon="PreviousIcon" cover stroke />
        </button>
        <button className={style.next} disabled={!canGoForward} onClick={() => history.goForward()}>
          <Icon icon="NextIcon" cover stroke />
        </button>
      </div>
      <div className={style.label}>Library</div>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/artists">
        Artists
      </NavLink>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/albums">
        Albums
      </NavLink>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/playlists" exact>
        Playlists
      </NavLink>
      {allPlaylists && allPlaylists.length > 0 && (
        <>
          <div className={style.label}>Playlists</div>
          {allPlaylists.map((playlist) => (
            <NavLink
              key={playlist.playlistId}
              className={style.link}
              activeClassName={style.linkActive}
              to={`/playlists/${playlist.playlistId}`}
            >
              {playlist.title}
            </NavLink>
          ))}
        </>
      )}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SideBar;
