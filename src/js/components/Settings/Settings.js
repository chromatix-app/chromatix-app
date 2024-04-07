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
        <div className={style.title}>Colour theme</div>
        <ThemeSettings />
      </div>
    </div>
  );
};

const ThemeSettings = () => {
  const dispatch = useDispatch();

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);
  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.currentColorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.currentColorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.currentColorPrimary);

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

      <div className={style.themes}>
        <button
          className={clsx(style.theme, {
            [style.themeCurrent]: currentTheme === 'custom',
          })}
          onClick={() => {
            dispatch.sessionModel.setTheme('custom');
          }}
        >
          <div className={style.themeBackground}>
            <div className={style.icon}>
              <Icon icon="PencilIcon" cover stroke />
            </div>
          </div>
        </button>

        {currentTheme === 'custom' && (
          <div className={style.custom}>
            <div className={style.customField}>
              <div className={style.customLabel}>Background:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorBackground}
                onChange={(e) => {
                  dispatch.sessionModel.setColorBackground(e.target.value);
                }}
              />
            </div>
            <div className={style.customField}>
              <div className={style.customLabel}>Text:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorText}
                onChange={(e) => {
                  dispatch.sessionModel.setColorText(e.target.value);
                }}
              />
            </div>
            <div className={style.customField}>
              <div className={style.customLabel}>Highlight:</div>
              <input
                type="color"
                className={style.customInput}
                value={currentColorPrimary}
                onChange={(e) => {
                  dispatch.sessionModel.setColorPrimary(e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Settings;
