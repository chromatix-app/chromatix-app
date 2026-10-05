// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Button, Icon } from 'js/components';
import { analyticsEvent } from 'js/utils';

import style from 'js/components/PageHome/PageHome.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const PageLanding = () => {
  const dispatch = useDispatch();
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

        <div className={style.buttons}>
          <Button
            onClick={dispatch.appModel.doPlexLogin}
            color="primary"
            size="large"
            wrap={false}
            icon={<Icon icon="PlexSiteIcon" cover />}
          >
            Login with Plex
          </Button>
          <Button
            to="/login-jellyfin"
            color="primary"
            size="large"
            wrap={false}
            icon={<Icon icon="JellyfinSiteIcon" cover />}
          >
            Login with Jellyfin
          </Button>
        </div>
      </div>

      <div className={clsx(style.image, style.margin)}>
        <picture>
          <source type="image/webp" srcSet="/images/webp/chromatix006.webp" />
          <img
            src="/images/compressed/chromatix006.jpg"
            alt="Chromatix music player for Plex"
            width="1920"
            height="1425"
            draggable="false"
          />
        </picture>
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
        <div className={style.support}>
          <a
            className={style.github}
            href="https://github.com/sponsors/alexb148"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
            onClick={() => {
              analyticsEvent('Link / GitHub Sponsors');
            }}
          >
            Sponsor me on GitHub
          </a>
          <a
            className={style.kofi}
            href="https://ko-fi.com/chromaticnova"
            target="_blank"
            rel="noreferrer nofollow"
            draggable="false"
            onClick={() => {
              analyticsEvent('Link / Ko-fi');
            }}
          >
            Support me on Ko-fi
          </a>
        </div>
      </div>

      <div className={style.border}></div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageLanding;
