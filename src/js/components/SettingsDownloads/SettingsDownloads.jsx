// ======================================================================
// IMPORTS
// ======================================================================

import React from 'react';
import clsx from 'clsx';

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
    <>
      <div className={clsx('settingsGroup', style.group)}>
        <div>Get the Chromatix app for desktop platforms here:</div>

        <div className={style.downloads}>
          {downloadLinks.map((downloadLink, index) => (
            <React.Fragment key={downloadLink.label}>
              {index > 0 && <br />}
              {downloadLink.kind === 'link' ? (
                <a
                  href={downloadLink.url}
                  target="_blank"
                  rel="noreferrer nofollow"
                  draggable="false"
                  onClick={() => logDownload(downloadLink.label)}
                >
                  <span className={style.downloadsIcon}>
                    <Icon icon={downloadLink.icon} cover />
                  </span>
                  {downloadLink.label}
                </a>
              ) : (
                <div className={style.note}>
                  <span className={style.downloadsIcon}>
                    <Icon icon={downloadLink.icon} cover />
                  </span>
                  {downloadLink.label}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsDownloads;
