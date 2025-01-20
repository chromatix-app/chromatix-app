// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { themes } from 'js/_config/themes';
import { Icon } from 'js/components';

import style from './SettingsAppearance.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsAppearance = () => {
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

  const resetCustomTheme = () => {
    dispatch.sessionModel.setColorBackground(themes.chromatix.background);
    dispatch.sessionModel.setColorText(themes.chromatix.text);
    dispatch.sessionModel.setColorPrimary(themes.chromatix.primary);
  };

  return (
    <div className={style.wrap}>
      {Object.entries(groupedThemes).map(([groupName, groupThemes], groupIndex) => (
        <div key={groupIndex} className={style.section}>
          <div className={style.title}>{groupName}</div>
          <div className={style.themes}>
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
        </div>
      ))}

      <div className={style.section}>
        <div className={style.title}>Custom</div>
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
                  onChange={(event) => {
                    dispatch.sessionModel.setColorBackground(event.target.value);
                  }}
                />
              </div>
              <div className={style.customField}>
                <div className={style.customLabel}>Text:</div>
                <input
                  type="color"
                  className={style.customInput}
                  value={currentColorText}
                  onChange={(event) => {
                    dispatch.sessionModel.setColorText(event.target.value);
                  }}
                />
              </div>
              <div className={style.customField}>
                <div className={style.customLabel}>Highlight:</div>
                <input
                  type="color"
                  className={style.customInput}
                  value={currentColorPrimary}
                  onChange={(event) => {
                    dispatch.sessionModel.setColorPrimary(event.target.value);
                  }}
                />
              </div>
              {(currentColorBackground !== themes.chromatix.background ||
                currentColorText !== themes.chromatix.text ||
                currentColorPrimary !== themes.chromatix.primary) && (
                <div className={style.customField}>
                  <button className={style.button} onClick={resetCustomTheme}>
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAppearance;
