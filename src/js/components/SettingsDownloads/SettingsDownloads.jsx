// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';

import { Icon } from 'js/components';
import { useGetDownloadLinks } from 'js/hooks';
import { analyticsEvent } from 'js/utils';

import style from './SettingsDownloads.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsDownloads = () => {
  const downloadLinks = useGetDownloadLinks();

  const logDownload = (label) => {
    analyticsEvent(`Download / Settings / ${label}`);
  };

  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div>Get the Chromatix app for desktop platforms here:</div>

        <div className={style.downloads}>
          {downloadLinks.map(({ icon, label, url }, index) => (
            <React.Fragment key={label}>
              {index > 0 && <br />}
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer nofollow"
                  draggable="false"
                  onClick={() => logDownload(label)}
                >
                  <span className={style.downloadsIcon}>
                    <Icon icon={icon} cover />
                  </span>
                  {label}
                </a>
              ) : (
                <div className={style.note}>
                  <span className={style.downloadsIcon}>
                    <Icon icon={icon} cover />
                  </span>
                  {label}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsDownloads;
