// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Button, Icon } from 'js/components';

import style from './PageHome.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const PageHome = () => {
  const dispatch = useDispatch();

  return (
    <div className={clsx(style.wrap, 'text-center')}>
      <div className={style.intro}>
        <div className={style.badge}>Free to use</div>

        <div className="mt-30 mt-lg-40"></div>

        <h1 className={style.title}>Chromatix</h1>

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
      </div>

      <div className={clsx(style.image, style.margin)}>
        <img src="/images/chromatix001.jpg" alt="Chromatix music player for Plex" width="2000" height="1484" />
      </div>

      <div className={style.intro}>
        <h1 className={style.title}>Get Started</h1>

        <div className="mt-40"></div>

        <div className={style.body}>
          <p>Login with your Plex account to begin experiencing your music library in a whole new way.</p>
        </div>

        <div className="mt-50"></div>

        <Button onClick={dispatch.appModel.doLogin}>Login with Plex</Button>
      </div>

      <div className={clsx(style.social, style.margin)}>
        <div className={style.icons}>
          <a
            className={style.icon}
            href="https://www.reddit.com/r/chromatix/"
            target="_blank"
            rel="noreferrer nofollow"
          >
            <Icon icon="RedditIcon" cover />
            <span className="u-hide-text">Join us on Reddit</span>
          </a>
          <a className={style.icon} href="https://github.com/chromatix-app" target="_blank" rel="noreferrer nofollow">
            <Icon icon="GithubIcon" cover />
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
