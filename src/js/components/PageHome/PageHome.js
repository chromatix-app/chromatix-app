// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import clsx from 'clsx';

import { Button, Icon } from 'js/components';
import { analyticsEvent } from 'js/utils';

import style from './PageHome.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const isElectron = window?.isElectron;

export const PageHome = () => {
  const dispatch = useDispatch();

  const downloadsRef = useRef(null);

  const [macSiliconDownloadUrl, setMacSiliconDownloadUrl] = useState(
    'https://github.com/chromatix-app/chromatix-release/releases/latest'
  );
  const [macUniversalDownloadUrl, setMacUniversalDownloadUrl] = useState(
    'https://github.com/chromatix-app/chromatix-release/releases/latest'
  );

  const scrollToDownloads = () => {
    downloadsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownloadMacSilicon = () => {
    analyticsEvent('Download: macOS');
  };

  const handleDownloadMacUniversal = () => {
    analyticsEvent('Download: macOS (Universal)');
  };

  useEffect(() => {
    axios.get('https://api.github.com/repos/chromatix-app/chromatix-release/releases/latest').then((response) => {
      const assets = response.data.assets;
      const macSiliconAsset = assets.find((asset) => asset.name.endsWith('arm64.dmg'));
      const macUniversalAsset = assets.find((asset) => asset.name.endsWith('universal.dmg'));
      if (macSiliconAsset) {
        setMacSiliconDownloadUrl(macSiliconAsset.browser_download_url);
      }
      if (macUniversalAsset) {
        setMacUniversalDownloadUrl(macUniversalAsset.browser_download_url);
      }
    });
  }, []);

  return (
    <div className={clsx(style.wrap, 'text-center')}>
      <div className={style.intro}>
        <div className={style.badge}>Free to use</div>

        <div className="mt-30 mt-lg-40"></div>

        <h1 className={style.h1}>Chromatix</h1>

        <div className="mt-35 mt-lg-50"></div>

        <hr className={style.hr} />

        <div className="mt-35 mt-lg-50"></div>

        <div className={style.body}>
          <p>
            Chromatix is a desktop music player for Plex, that transforms your listening experience and makes
            interacting with your music libraries a joy.
          </p>
        </div>

        <div className="mt-45 mt-lg-50"></div>

        <Button onClick={dispatch.appModel.doLogin}>Login with Plex</Button>

        {!isElectron && (
          <>
            <div className="mt-10"></div>

            <Button variant={'download'} onClick={scrollToDownloads}>
              Download
            </Button>
          </>
        )}
      </div>

      <div className={clsx(style.image, style.margin)}>
        <img src="/images/chromatix003.jpg" alt="Chromatix music player for Plex" width="2000" height="1484" />
      </div>

      <div className={style.intro}>
        <h1 className={style.h1}>Get Started</h1>

        <div className="mt-40"></div>

        <div className={style.body}>
          <p>Login with your Plex account to begin experiencing your music library in a whole new way.</p>
        </div>

        <div className="mt-50"></div>

        <Button onClick={dispatch.appModel.doLogin}>Login with Plex</Button>

        {!isElectron && (
          <>
            <div className="mt-100"></div>

            <div className={style.downloads} ref={downloadsRef}>
              <h2 className={style.h2}>Downloads</h2>

              <div className={style.borderSmall}></div>

              <div className={style.downloadsFlex}>
                <div>
                  <a
                    href={macSiliconDownloadUrl}
                    target="_blank"
                    rel="noreferrer nofollow"
                    onClick={handleDownloadMacSilicon}
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
                    onClick={handleDownloadMacUniversal}
                  >
                    <span className={style.downloadsIcon}>
                      <Icon icon="AppleSiteIcon" cover />
                    </span>
                    Download for macOS (Intel)
                  </a>

                  <br />

                  <div className={style.note}>
                    <span className={style.downloadsIcon}>
                      <Icon icon="WindowsSiteIcon" cover />
                    </span>
                    Windows coming soon
                  </div>

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

            <div className="mt-25"></div>
          </>
        )}
      </div>

      <div className={clsx(style.social, style.margin)}>
        <div className={style.icons}>
          <a
            className={style.icon}
            href="https://www.reddit.com/r/chromatix/"
            target="_blank"
            rel="noreferrer nofollow"
          >
            <Icon icon="RedditSiteIcon" cover />
            <span className="u-hide-text">Join us on Reddit</span>
          </a>
          <a className={style.icon} href="https://github.com/chromatix-app" target="_blank" rel="noreferrer nofollow">
            <Icon icon="GithubSiteIcon" cover />
            <span className="u-hide-text">View us on Github</span>
          </a>
        </div>
        <a className={style.kofi} href="https://ko-fi.com/chromaticnova" target="_blank" rel="noreferrer nofollow">
          Support me on Ko-fi
        </a>
      </div>

      <div className={style.border}></div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageHome;
