// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import clsx from 'clsx';

import style from './Loading.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Loading = ({ forceVisible, inline, route }) => {
  const loaderVisible = useSelector(({ appModel }) => appModel.loaderVisible);

  if (loaderVisible || forceVisible) {
    return <div className={clsx(style.loader, { [style.inline]: inline, [style.route]: route })}>Loading...</div>;
  } else {
    return null;
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default Loading;
