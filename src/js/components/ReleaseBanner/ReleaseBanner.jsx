// ======================================================================
// IMPORTS
// ======================================================================

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import semver from 'semver';

import { Icon } from 'js/components';
import { analyticsEvent } from 'js/utils';
import whatsNew from 'js/_config/whatsNew';

import style from './ReleaseBanner.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const ReleaseBanner = () => {
  const dispatch = useDispatch();

  const savedAppVersion = useSelector(({ sessionModel }) => sessionModel.savedAppVersion);

  // options
  const messageAppVersion = whatsNew[0]?.version || '0.0.0';
  const currentAppVersion = process.env.REACT_APP_VERSION?.split('-')[0] || messageAppVersion;

  // // dev testing overrides
  // currentAppVersion = '0.51.0';
  // messageAppVersion = '0.5.0';
  // savedAppVersion = '0.1.0';

  // determine whether the release banner should be shown
  const savedVersionIsValid = semver.valid(savedAppVersion) && semver.gt(savedAppVersion, '0.0.0');
  const savedVersionIsOutdated = !savedVersionIsValid || semver.lt(savedAppVersion, messageAppVersion);

  // // dev debugging
  // console.log(111);
  // console.log(`currentAppVersion: ${currentAppVersion}`);
  // console.log(`messageAppVersion: ${messageAppVersion}`);
  // console.log(`savedAppVersion: ${savedAppVersion}`);
  // console.log(`savedVersionIsValid: ${savedVersionIsValid}`);
  // console.log(`savedVersionIsOutdated: ${savedVersionIsOutdated}`);

  // state ensures banner is immediately hidden on close, rather than awaiting the amplify refresh
  const [showBanner, setShowBanner] = useState(savedVersionIsOutdated);

  // on click, show the release notes modal
  const handleClick = () => {
    dispatch.dialogModel.showModal('ReleaseNotes');
    analyticsEvent('Release Banner / Clicked');
  };

  // on close, update the user version to match the current version in order to hide the banner
  const handleClose = () => {
    setShowBanner(false);
    dispatch.sessionModel.setSessionState({
      savedAppVersion: currentAppVersion,
    });
    analyticsEvent('Release Banner / Closed');
  };

  // only show the release banner if the user version is lower than the required version
  if (showBanner) {
    return (
      <div className={style.wrap}>
        <button className={style.banner} onClick={handleClick}>
          <div className={style.title}>What&rsquo;s new</div>
          {/* <div className={style.body}>Full screen player mode added.</div> */}
          <div className={style.body}>Jellyfin server support is now available.</div>
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
