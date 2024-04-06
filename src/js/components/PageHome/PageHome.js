// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { Button } from 'js/components';

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

      <div className={style.image}>
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

      <div className={style.border}></div>

      <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageHome;
