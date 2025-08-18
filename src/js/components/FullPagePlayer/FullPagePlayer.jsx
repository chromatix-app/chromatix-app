// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
// import clsx from 'clsx';

// import { Icon } from 'js/components';

// import style from './FullPagePlayer.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const FullPagePlayer = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch.appModel.fullPageOff()}>Close</button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default FullPagePlayer;
