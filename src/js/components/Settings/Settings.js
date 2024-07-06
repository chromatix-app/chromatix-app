// ======================================================================
// IMPORTS
// ======================================================================

import { NavLink } from 'react-router-dom';

import { Icon } from 'js/components';

import style from './Settings.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Settings = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>General</div>

        <NavLink className={style.entry} to={'/settings/options'}>
          <div className={style.entryIcon}>
            <Icon icon="CogIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Options</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/appearance'}>
          <div className={style.entryIconSmall}>
            <Icon icon="PaintPaletteIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Appearance</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </NavLink>
      </div>

      <div className={style.group}>
        <div className={style.title}>About</div>

        {/* <NavLink className={style.entry} to={'/settings/about'}>
          <div className={style.entryIcon}>
            <Icon icon="InfoIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>About Chromatix</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </NavLink> */}

        <NavLink className={style.entry} to={'/settings/changelog'}>
          <div className={style.entryIconSmall}>
            <Icon icon="ClockRewindIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Changelog</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </NavLink>

        <a className={style.entry} href="https://www.reddit.com/r/chromatix/" target="_blank" rel="noreferrer nofollow">
          <div className={style.entryIconLarge}>
            <Icon icon="RedditIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            Join us on Reddit
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </a>

        <a className={style.entry} href="https://github.com/chromatix-app" target="_blank" rel="noreferrer nofollow">
          <div className={style.entryIcon}>
            <Icon icon="GithubIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            View us on GitHub
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke />
          </div>
        </a>
      </div>

      <div className={style.group}>
        <div className={style.kofiWrap}>
          <a className={style.kofi} href="https://ko-fi.com/chromaticnova" target="_blank" rel="noreferrer nofollow">
            Support me on Ko-fi
          </a>
        </div>

        <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Settings;
