// ======================================================================
// IMPORTS
// ======================================================================

import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Button, Icon } from 'js/components';
import { useGetDownloadLinks } from 'js/hooks';
import { analyticsEvent, getEnvironment } from 'js/utils';

import style from './PageHome.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const envData = getEnvironment();

export const PageHome = () => {
  const dispatch = useDispatch();
  const downloadsRef = useRef(null);

  const { macSiliconDownloadUrl, macUniversalDownloadUrl, windowsDownloadUrl } = useGetDownloadLinks();

  const scrollToDownloads = () => {
    downloadsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const logDownloadMacSilicon = () => {
    analyticsEvent('Download / Home / macOS');
  };
  const logDownloadMacUniversal = () => {
    analyticsEvent('Download / Home / macOS (Universal)');
  };
  const logDownloadWindows = () => {
    analyticsEvent('Download / Home / Windows');
  };

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
            Chromatix is a desktop music player for Plex and Jellyfin that transforms your listening experience and
            makes interacting with your music libraries a joy.
          </p>
        </div>

        <div className="mt-45 mt-lg-50"></div>

        {!envData.isElectron && (
          <>
            <Button onClick={scrollToDownloads} icon={<Icon icon="DownloadIcon" cover stroke strokeWidth={2} />}>
              Download the App
            </Button>
            <div className="mt-20"></div>
          </>
        )}

        <div className={style.buttons}>
          <Button
            onClick={dispatch.appModel.doPlexLogin}
            color={envData.isElectron ? 'primary' : 'tertiary'}
            size={envData.isElectron ? 'large' : 'medium'}
            wrap={false}
            icon={<Icon icon="PlexSiteIcon" cover />}
          >
            Login with Plex
          </Button>
          <Button
            to="/login-jellyfin"
            color={envData.isElectron ? 'primary' : 'tertiary'}
            size={envData.isElectron ? 'large' : 'medium'}
            wrap={false}
            icon={<Icon icon="JellyfinSiteIcon" cover />}
          >
            Login with Jellyfin
          </Button>
        </div>
      </div>

      <div className={clsx(style.image, style.margin)}>
        <picture>
          <source type="image/webp" srcSet="/images/webp/chromatix005.webp" />
          <img
            src="/images/compressed/chromatix005.jpg"
            alt="Chromatix music player for Plex"
            width="1920"
            height="1425"
            draggable="false"
          />
        </picture>
      </div>

      <div className={style.intro}>
        <h1 className={style.h1}>Get Started</h1>

        <div className="mt-40"></div>

        <div className={style.body}>
          <p>Login with your Plex or Jellyfin account to begin experiencing your music library in a whole new way.</p>
        </div>

        <div className="mt-50"></div>

        <div className={style.buttons}>
          <Button
            onClick={dispatch.appModel.doPlexLogin}
            color={envData.isElectron ? 'primary' : 'tertiary'}
            size={envData.isElectron ? 'large' : 'medium'}
            wrap={false}
            icon={<Icon icon="PlexSiteIcon" cover />}
          >
            Login with Plex
          </Button>
          <Button
            to="/login-jellyfin"
            color={envData.isElectron ? 'primary' : 'tertiary'}
            size={envData.isElectron ? 'large' : 'medium'}
            wrap={false}
            icon={<Icon icon="JellyfinSiteIcon" cover />}
          >
            Login with Jellyfin
          </Button>
        </div>

        {!envData.isElectron && (
          <>
            <div className="mt-100"></div>

            <div className={style.downloads} ref={downloadsRef}>
              <h2 className={style.h2}>Downloads</h2>

              <div className={style.borderSmall}></div>

              <div className={style.downloadsFlex}>
                <div>
                  <a
                    className={style.downloadsLink}
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
                    className={style.downloadsLink}
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
                    className={style.downloadsLink}
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

                  <div className={style.downloadsLink}>
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
            title="Join Chromatix on Reddit"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
          >
            <Icon icon="RedditSiteIcon" cover />
            <span className="u-hide-text">Join Chromatix on Reddit</span>
          </a>
          <a
            className={style.icon}
            href="https://github.com/chromatix-app"
            title="View Chromatix on GitHub"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
          >
            <Icon icon="GithubSiteIcon" cover />
            <span className="u-hide-text">View Chromatix on GitHub</span>
          </a>
          <a
            className={style.icon}
            href="https://chromatix.featurebase.app"
            title="Roadmap, feature requests and bug reports on Featurebase"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
          >
            <Icon icon="FeaturebaseSiteIcon" cover />
            <span className="u-hide-text">Roadmap, feature requests and bug reports on Featurebase</span>
          </a>
        </div>
        <a
          className={style.kofi}
          href="https://ko-fi.com/chromaticnova"
          target="_blank"
          rel="noreferrer nofollow"
          draggable="false"
        >
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
