// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';

import style from './SideBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SideBar = () => {
  return (
    <div className={style.wrap}>
      <div className={style.label}>Library</div>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/artists">
        Artists
      </NavLink>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/albums">
        Albums
      </NavLink>
      <NavLink className={style.link} activeClassName={style.linkActive} to="/playlists">
        Playlists
      </NavLink>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SideBar;
