// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import semver from 'semver';

import { Icon } from 'js/components';

import style from './ReleaseBanner.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

export const ReleaseBanner = () => {
  const dispatch = useDispatch();
  const savedAppVersion = useSelector(({ sessionModel }) => sessionModel.savedAppVersion);
  const menuShowBanners = useSelector(({ sessionModel }) => sessionModel.menuShowBanners);

  // options
  let messageAppVersion = '0.10.0';
  let currentAppVersion = process.env.REACT_APP_VERSION || messageAppVersion;

  // option overrides for local development
  if (isLocal) {
    messageAppVersion = '0.0.7';
    currentAppVersion = messageAppVersion;
  }

  // determine whether the release badge should be shown
  const savedVersionIsValid = semver.valid(savedAppVersion) && semver.gt(savedAppVersion, '0.0.0');
  const savedVersionIsOutdated = !savedVersionIsValid || semver.lt(savedAppVersion, messageAppVersion);

  // state ensures badge is immediately hidden on close, rather than awaiting the amplify refresh
  const [showBadge, setShowBadge] = useState(savedVersionIsOutdated);

  // TO DO: remove isLocal check
  if (!isLocal || !menuShowBanners) return null;

  // show the release notes modal
  const handleOpen = () => {
    dispatch.dialogModel.showModal('ReleaseNotes');
  };

  // on close, update the user version to match the current version in order to hide the badge
  const handleClose = () => {
    setShowBadge(false);
    dispatch.sessionModel.setSessionState({
      savedAppVersion: currentAppVersion,
    });
  };

  // only show the release badge if the user version is lower than the required version
  if (showBadge) {
    return (
      <div className={style.wrap}>
        <button className={style.badge} onClick={handleOpen}>
          <div className={style.title}>What&rsquo;s new</div>
          <div className={style.body}>Full screen player mode added.</div>
          <div className={style.cta}>
            Read more
            <span className={style.icon}>
              <Icon icon="ArrowRightLongIcon" cover stroke />
            </span>
          </div>
        </button>
        <button className={style.close} onClick={handleClose}>
          Close
        </button>
      </div>
    );
  }
};

// ======================================================================
// EXPORT
// ======================================================================

export default ReleaseBanner;
