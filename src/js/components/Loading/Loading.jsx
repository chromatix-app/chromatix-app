// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { Icon } from 'js/components';

import style from './Loading.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Loading = ({ forceVisible, inline, route, showOffline }) => {
  const isOnline = useSelector(({ appModel }) => appModel.isOnline);
  const loaderVisible = useSelector(({ appModel }) => appModel.loaderVisible);

  if (loaderVisible || forceVisible) {
    // Standard loader
    if (isOnline || !showOffline) {
      return <div className={clsx(style.loader, { [style.inline]: inline, [style.route]: route })}>Loading...</div>;
    }

    // Offline messaging
    else {
      return (
        <div className={clsx(style.loaderOffline, { [style.inline]: inline, [style.route]: route })}>
          <div className={style.icon}>
            <Icon icon="CloudOfflineIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div className={style.message}>No Internet Connection</div>
        </div>
      );
    }
  } else {
    return null;
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default Loading;
