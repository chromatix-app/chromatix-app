// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import style from './SettingsGeneral.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsGeneral = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>Interface</div>
        <InterfaceSettings />
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

  const { optionShowFullTitles, optionShowStarRatings } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    {
      key: 'optionShowFullTitles',
      label: 'Always show full track, artist and album titles',
      state: optionShowFullTitles,
    },
    { key: 'optionShowStarRatings', label: 'Show star ratings', state: optionShowStarRatings },
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

  const { optionLogPlexPlayback } = useSelector(({ sessionModel }) => sessionModel);

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
