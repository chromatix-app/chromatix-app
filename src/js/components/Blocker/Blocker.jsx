// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import clsx from 'clsx';

import style from './Blocker.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = import.meta.env.VITE_ENV === 'local';

export const Blocker = () => {
  const blockerVisible = useSelector(({ appModel }) => appModel.blockerVisible);

  if (!blockerVisible) {
    return null;
  }

  return <div className={clsx(style.blocker, { [style.dev]: isLocal })} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default Blocker;
