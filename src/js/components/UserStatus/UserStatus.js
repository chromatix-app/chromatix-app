// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import * as plex from 'js/services/plex';

import style from './UserStatus.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const UserStatus = () => {
  const currentUser = useSelector(({ appModel }) => appModel.currentUser);

  return (
    <div className={style.wrap}>
      <button onClick={plex.logout}>{currentUser.title} &nbsp;&nbsp;|&nbsp;&nbsp; Logout</button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default UserStatus;
