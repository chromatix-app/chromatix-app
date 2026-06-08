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

  return (
    <>
      <div className={clsx('settingsGroup', style.group)}>
        <div>Get the Chromatix app for desktop platforms here:</div>

        <div className={style.downloadsWrap}>
          {downloadLinks.map((downloadLink, index) => (
            <React.Fragment key={index}>
              {downloadLink.kind === 'divider' ? (
                <div className={style.downloadsDivider}></div>
              ) : downloadLink.kind === 'link' ? (
                <div>
                  <a
                    className={style.downloadsLink}
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
                </div>
              ) : (
                <div className={style.downloadsNote}>
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
// HELPERS
// ======================================================================

const logDownload = (label) => {
  analyticsEvent(`Download / Settings / ${label}`);
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsDownloads;
