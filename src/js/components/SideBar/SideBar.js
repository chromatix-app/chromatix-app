// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import * as plex from 'js/services/plex';

import style from './SideBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SideBar = () => {
  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <div className={style.wrap}>
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
      {allPlaylists && (
        <>
          <div className={style.label}>Playlists</div>
          {allPlaylists.map((playlist) => (
            <NavLink
              key={playlist.id}
              className={style.link}
              activeClassName={style.linkActive}
              to={`/playlists/${playlist.id}`}
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
