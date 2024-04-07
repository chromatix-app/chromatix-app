// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { themes } from 'js/_config/themes';
import { Icon } from 'js/components';

import style from './Settings.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const Settings = () => {
  return (
    <div className={style.wrap}>
      <div className={style.entry}>
        <div className={style.title}>Theme</div>
        <ThemeSettings />
      </div>
    </div>
  );
};

const ThemeSettings = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);

  const groupedThemes = Object.entries(themes).reduce((groups, [themeName, themeDetails]) => {
    const group = themeDetails.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push([themeName, themeDetails]);
    return groups;
  }, {});

  return (
    <>
      {Object.entries(groupedThemes).map(([groupName, groupThemes], groupIndex) => (
        <div key={groupIndex} className={style.themes}>
          {groupThemes.map(([themeName, themeDetails], themeIndex) => (
            <button
              key={themeIndex}
              className={clsx(style.theme, {
                [style.themeCurrent]: currentTheme === themeName,
              })}
              onClick={() => {
                dispatch.sessionModel.setTheme(themeName);
              }}
            >
              <div className={style.themeBackground} style={{ background: themeDetails.background }}>
                <div
                  className={style.themeText}
                  style={{ borderColor: `transparent transparent ${themeDetails.primary} transparent` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Settings;
