// ======================================================================
// IMPORTS
// ======================================================================

import { Icon } from 'js/components';
import { useGetDownloadLinks } from 'js/hooks';
import { analyticsEvent } from 'js/utils';

import style from './SettingsDownloads.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsDownloads = () => {
  const { macSiliconDownloadUrl, macUniversalDownloadUrl, windowsDownloadUrl } = useGetDownloadLinks();

  const logDownloadMacSilicon = () => {
    analyticsEvent('Download / Settings / macOS');
  };
  const logDownloadMacUniversal = () => {
    analyticsEvent('Download / Settings / macOS (Universal)');
  };
  const logDownloadWindows = () => {
    analyticsEvent('Download / Settings / Windows');
  };

  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div>Get the Chromatix app for desktop platforms here:</div>

        <div className={style.downloads}>
          <a
            href={macSiliconDownloadUrl}
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
            onClick={logDownloadMacSilicon}
          >
            <span className={style.downloadsIcon}>
              <Icon icon="AppleSiteIcon" cover />
            </span>
            Download for macOS (Apple Silicon)
          </a>

          <br />

          <a
            href={macUniversalDownloadUrl}
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
            onClick={logDownloadMacUniversal}
          >
            <span className={style.downloadsIcon}>
              <Icon icon="AppleSiteIcon" cover />
            </span>
            Download for macOS (Intel)
          </a>

          <br />

          <a
            href={windowsDownloadUrl}
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
            onClick={logDownloadWindows}
          >
            <span className={style.downloadsIcon}>
              <Icon icon="WindowsSiteIcon" cover />
            </span>
            Download for Windows
          </a>

          <br />

          <div className={style.note}>
            <span className={style.downloadsIcon}>
              <Icon icon="LinuxSiteIcon" cover />
            </span>
            Linux coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsDownloads;
