// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { Button } from 'js/components';

import style from './PageHome.module.scss';

// ======================================================================
// RENDER
// ======================================================================

export const PageHome = () => {
  const dispatch = useDispatch();

  return (
    <div className={style.wrap}>
      <h1 className={style.title}>Chromatix</h1>

      <div className="mt-50"></div>

      <hr className={style.hr} />

      <div className="mt-50"></div>

      <div className={style.body}>
        <p>
          Chromatix is a desktop music player for Plex, that transforms your listening experience and makes interacting
          with your music libraries a joy.
        </p>
      </div>

      <div className="mt-50"></div>

      <Button onClick={dispatch.appModel.doLogin}>Login with Plex</Button>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PageHome;
