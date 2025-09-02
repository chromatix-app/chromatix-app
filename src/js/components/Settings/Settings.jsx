// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { Icon } from 'js/components';

import style from './Settings.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Settings = () => {
  const dispatch = useDispatch();

  return (
    <div className={style.wrap}>
      {/* GENERAL */}

      <div className={style.group}>
        <div className={style.title}>General</div>

        <NavLink className={style.entry} to={'/settings/general'} draggable="false">
          <div className={style.entryIconMed}>
            <Icon icon="CogIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>General</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/browse'} draggable="false">
          <div className={style.entryIconMed}>
            <Icon icon="EyeIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Browsing</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/appearance'} draggable="false">
          <div className={style.entryIconSmall}>
            <Icon icon="PaintPaletteIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Appearance</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/sidebar'} draggable="false">
          <div className={style.entryIconSmall}>
            <Icon icon="SideBarSmallIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Sidebar</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/lastfm'} draggable="false">
          <div className={style.entryIconMed}>
            <Icon icon="LastFMIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Last.fm</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>
      </div>

      {/* DOWNLOADS */}

      <div className={style.group}>
        <div className={style.title}>Downloads</div>

        <NavLink className={style.entry} to={'/settings/downloads'} draggable="false">
          <div className={style.entryIconSmall}>
            <Icon icon="DownloadIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Download desktop apps</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>
      </div>

      {/* CONNECT */}

      <div className={style.group}>
        <div className={style.title}>Connect</div>
        <div className={style.body}>If possible, please use Featurebase for bug reports and feature requests.</div>

        <a
          className={style.entry}
          href={'mailto:' + process.env.REACT_APP_EMAIL_ADDRESS + '?subject=Feedback'}
          target="_blank"
          rel="noreferrer nofollow"
          draggable="false"
        >
          <div className={style.entryIconSmall}>
            <Icon icon="MailIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            Email Chromatix
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
          href="https://www.reddit.com/r/chromatix/"
          target="_blank"
          rel="noreferrer nofollow"
          draggable="false"
        >
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

        <a
          className={style.entry}
          href="https://github.com/chromatix-app"
          target="_blank"
          rel="noreferrer nofollow"
          draggable="false"
        >
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
          draggable="false"
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

        <a
          className={style.entry}
          href="https://chromatix.featurebase.app"
          target="_blank"
          rel="noreferrer nofollow"
          draggable="false"
        >
          <div className={style.entryIconMed}>
            <Icon icon="FeaturebaseIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>
            Roadmap, feature requests and bug reports on Featurebase
            <div className={style.externalIcon}>
              <Icon icon="ExternalLinkIcon" cover stroke />
            </div>
          </div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </a>
      </div>

      {/* ABOUT */}

      <div className={style.group}>
        <div className={style.title}>About</div>

        <NavLink className={style.entry} to={'/settings/about'} draggable="false">
          <div className={style.entryIconSmall}>
            <Icon icon="InfoIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>About Chromatix</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <NavLink className={style.entry} to={'/settings/changelog'} draggable="false">
          <div className={style.entryIconSmall}>
            <Icon icon="ClockRewindIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Changelog</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </NavLink>

        <button
          className={style.entry}
          draggable="false"
          onClick={() => {
            dispatch.dialogModel.showModal('ReleaseNotes');
          }}
        >
          <div className={style.entryIconSmall}>
            <Icon icon="MegaphoneIcon" cover stroke strokeWidth={1.5} />
          </div>
          <div>Latest release announcements</div>
          <div className={style.entryArrow}>
            <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.2} />
          </div>
        </button>
      </div>

      {/* KO-FI */}

      <div className={style.group}>
        <div className={style.kofiWrap}>
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

        <div className={style.legal}>Copyright &copy; {new Date().getFullYear()}</div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Settings;
