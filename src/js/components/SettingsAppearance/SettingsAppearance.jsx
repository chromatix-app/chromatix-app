// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { themes } from 'js/_config/themes';
import { Icon, SettingsList } from 'js/components';
import { getOperatingSystemName, isElectron, electronPlatform } from 'js/utils';

import style from './SettingsAppearance.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsAppearance = () => {
  const osName = getOperatingSystemName();
  const isWin = osName === 'Windows' || (isElectron && electronPlatform === 'win');

  return (
    <div className={style.wrap}>
      <PresetThemeSettings />
      <CustomThemeSettings />
      <DisplaySettings />
      {isWin && <ScrollbarSettings />}
    </div>
  );
};

//
// PRESET THEMES
//

const PresetThemeSettings = () => {
  const dispatch = useDispatch();

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);

  const groupedThemes = Object.entries(themes).reduce((groups, [themeName, themeDetails]) => {
    const group = themeDetails.group;
    if (group) {
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push([themeName, themeDetails]);
    }
    return groups;
  }, {});

  return Object.entries(groupedThemes).map(([groupName, groupThemes], groupIndex) => (
    <div key={groupIndex} className={style.group}>
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
  ));
};

//
// CUSTOM THEME
//

const CustomThemeSettings = () => {
  const dispatch = useDispatch();

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);
  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.currentColorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.currentColorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.currentColorPrimary);

  const resetCustomTheme = () => {
    dispatch.sessionModel.setColorBackground(themes.chromatix.background);
    dispatch.sessionModel.setColorText(themes.chromatix.text);
    dispatch.sessionModel.setColorPrimary(themes.chromatix.primary);
  };

  return (
    <div className={style.group}>
      <div className={style.title}>Custom theme</div>
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
  );
};

//
// SCROLLBAR SETTINGS
//

const ScrollbarSettings = () => {
  const dispatch = useDispatch();

  const winCustomScrollbars = useSelector(({ sessionModel }) => sessionModel.winCustomScrollbars);
  const winAutoHideScrollbars = useSelector(({ sessionModel }) => sessionModel.winAutoHideScrollbars);
  const winScrollbarWidth = useSelector(({ sessionModel }) => sessionModel.winScrollbarWidth);

  const handleScrollbarChange = (value) => {
    dispatch.sessionModel.setSessionState({ winScrollbarWidth: value });
  };

  const menuItems = [
    {
      key: 'winCustomScrollbars',
      label: 'Custom scrollbars',
      description: 'When enabled, the app will use custom scrollbars instead of the default ones.',
      state: winCustomScrollbars,
    },
    {
      key: 'winAutoHideScrollbars',
      label: 'Only show scrollbars on hover',
      description: 'When enabled, scrollbars will only be visible when hovering over the scrollable area.',
      state: winAutoHideScrollbars,
      disabled: !winCustomScrollbars,
    },
    {
      type: 'range',
      key: 'winScrollbarWidth',
      label: 'Scrollbar width',
      description: '',
      state: winScrollbarWidth,
      disabled: !winCustomScrollbars,
      props: {
        max: 20,
        min: 8,
        step: 4,
        handleChange: handleScrollbarChange,
      },
    },
  ];

  return <SettingsList title="Scrollbars (Windows only)" menuItems={menuItems} />;
};

//
// DISPLAY SETTINGS
//

const DisplaySettings = () => {
  const accessibilityContrast = useSelector(({ sessionModel }) => sessionModel.accessibilityContrast);
  const accessibilityFocus = useSelector(({ sessionModel }) => sessionModel.accessibilityFocus);

  const menuItems = [
    {
      key: 'accessibilityContrast',
      label: 'Increase contrast',
      // description:
      //   'This will increase the contrast of the interface, making it easier to read and interact with. This is particularly useful for users with visual impairments.',
      state: accessibilityContrast,
    },
    {
      key: 'accessibilityFocus',
      label: 'Highlight focused elements.',
      description:
        'When enabled, elements such as buttons, links, and form controls are highlighted when focused. For example, when using the keyboard to navigate the interface.',
      state: accessibilityFocus,
    },
  ];

  return <SettingsList title="Display Options" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAppearance;
