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

        <NavLink className={style.entry} to={'/settings/general'}>
          <div className={style.entryIconMed}>
            <Icon icon="CogIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>General</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/accessibility'}>
          <div className={style.entryIconSmall}>
            <Icon icon="AccessibilityIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Accessibility</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/appearance'}>
          <div className={style.entryIconSmall}>
            <Icon icon="PaintPaletteIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Appearance</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/menu'}>
          <div className={style.entryIconSmall}>
            <Icon icon="SideBarSmallIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Menu</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/lastfm'}>
          <div className={style.entryIconSmall}>
            <Icon icon="LastFMIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Last.fm</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>
      </div>

      <div className={style.group}>
        <div className={style.title}>Downloads</div>

        <NavLink className={style.entry} to={'/settings/downloads'}>
          <div className={style.entryIconSmall}>
            <Icon icon="DownloadIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Download desktop apps</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>
      </div>

      <div className={style.group}>
        <div className={style.title}>About</div>

        <NavLink className={style.entry} to={'/settings/about'}>
          <div className={style.entryIconSmall}>
            <Icon icon="InfoIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>About Chromatix</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/changelog'}>
          <div className={style.entryIconSmall}>
            <Icon icon="ClockRewindIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Changelog</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <a className={style.entry} href="https://www.reddit.com/r/chromatix/" target="_blank" rel="noreferrer nofollow">
          <div className={style.entryIconLarge}>
            <Icon icon="RedditIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            Join Chromatix on Reddit
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </a>

        <a className={style.entry} href="https://github.com/chromatix-app" target="_blank" rel="noreferrer nofollow">
          <div className={style.entryIconMed}>
            <Icon icon="GithubIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            View Chromatix on GitHub
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </a>

        <a
          className={style.entry}
          href="https://bsky.app/profile/chromaticnova.com"
          target="_blank"
          rel="noreferrer nofollow"
        >
          <div className={style.entryIconMed}>
            <Icon icon="BlueskyIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            Follow the developer on Bluesky
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
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
