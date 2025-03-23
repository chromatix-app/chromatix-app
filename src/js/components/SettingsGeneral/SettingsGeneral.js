// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import style from './SettingsGeneral.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsGeneral = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>User Interface</div>
        <InterfaceSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Accessibility</div>
        <AccessibilitySettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Plex</div>
        <PlexSettings />
      </div>
    </div>
  );
};

//
// INTERFACE
//

const InterfaceSettings = () => {
  const dispatch = useDispatch();

  // const optionShowFullTitles_Deprecated = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles_Deprecated);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const menuItems = [
    { key: 'optionShowStarRatings', label: 'Show star ratings', state: optionShowStarRatings },
    {
      key: 'optionShowFullTitles_Deprecated',
      label: 'Always show full track, artist and album titles',
      description: 'Sorry, this option has been removed for performance reasons.',
      state: false,
      disabled: true,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state, disabled }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
              disabled={disabled}
            />
            <div>
              {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// ACCESSIBILITY
//

const AccessibilitySettings = () => {
  const dispatch = useDispatch();

  const accessibilityFocus = useSelector(({ sessionModel }) => sessionModel.accessibilityFocus);

  const menuItems = [
    {
      key: 'accessibilityFocus',
      label: 'Highlight focused elements',
      description:
        'When enabled, elements such as buttons, links, and form controls are highlighted when focused. For example, when using the keyboard to navigate the interface.',
      state: accessibilityFocus,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>
              {label && <div className={style.label}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// PLEX
//

const PlexSettings = () => {
  const dispatch = useDispatch();

  const optionLogPlexPlayback = useSelector(({ sessionModel }) => sessionModel.optionLogPlexPlayback);

  const menuItems = [
    {
      key: 'optionLogPlexPlayback',
      label: 'Log playback events to Plex',
      description: 'This is used to tell the Plex server what is currently playing, and to update the play count.',
      state: optionLogPlexPlayback,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>
              {label && <div className={style.label}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsGeneral;
