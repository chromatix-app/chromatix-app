// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import style from './UserStatus.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserStatus = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(({ appModel }) => appModel.currentUser);

  return (
    <div className={style.wrap}>
      <div className={style.entry}>{currentUser.title}</div>
      <span className={style.divider}>|</span>
      <NavLink className={style.entry} to={'/settings'}>
        Settings
      </NavLink>
      <span className={style.divider}>|</span>
      <button className={style.entry} onClick={dispatch.appModel.doLogout}>
        Logout
      </button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default UserStatus;
