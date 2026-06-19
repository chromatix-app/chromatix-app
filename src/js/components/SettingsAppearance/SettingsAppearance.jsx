// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { themes } from 'js/_config/themes';
import { Button, FormTheme, SettingsList } from 'js/components';
import { getEnvironment } from 'js/utils';

import style from './SettingsAppearance.module.scss';

const envData = getEnvironment();

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsAppearance = ({ debug }) => {
  const isLinuxOS = envData.osName === 'Linux';
  const isWindowsOS = envData.osName === 'Windows';

  const currentTheme = useSelector(({ sessionModel }) => sessionModel.currentTheme);

  return (
    <>
      {/* <ThemeModeSettings /> */}

      <DefaultThemeSettings />
      {currentTheme === 'custom' && (
        <>
          <DefaultCustomSettings />
          <TintSettings />
        </>
      )}
      <ContrastSettings />

      <AccessibilitySettings />
      {(isLinuxOS || isWindowsOS || debug) && <ScrollbarSettings />}
    </>
  );
};

//
// THEME MODE SETTINGS
//

// const ThemeModeSettings = () => {
//   const themeMode = useSelector(({ sessionModel }) => sessionModel.themeMode);

//   const menuItems = [
//     {
//       type: 'tabGroup',
//       key: 'themeMode',
//       state: themeMode,
//       options: [
//         {
//           label: 'Auto',
//           value: 'system',
//         },
//         {
//           label: 'Manual',
//           value: 'single',
//         },
//       ],
//     },
//   ];

//   return (
//     <SettingsList
//       title="Theme Switching"
//       description="Choose whether to automatically switch between light and dark themes based on your system settings (if available) or manually select a single theme."
//       menuItems={menuItems}
//     />
//   );
// };

//
// THEME SETTINGS
//

const DefaultThemeSettings = () => {
  return (
    <div className="settingsGroup">
      <div className={style.title}>Theme</div>
      <FormTheme themeKey="currentTheme" />
    </div>
  );
};

//
// CUSTOM THEME
//

const DefaultCustomSettings = () => {
  const dispatch = useDispatch();

  const currentColorBackground = useSelector(({ sessionModel }) => sessionModel.currentColorBackground);
  const currentColorText = useSelector(({ sessionModel }) => sessionModel.currentColorText);
  const currentColorPrimary = useSelector(({ sessionModel }) => sessionModel.currentColorPrimary);

  const resetCustomTheme = () => {
    dispatch.sessionModel.setColorBackground(themes['chromatix-magenta'].background);
    dispatch.sessionModel.setColorText(themes['chromatix-magenta'].text);
    dispatch.sessionModel.setColorPrimary(themes['chromatix-magenta'].primary);
  };

  const resetIsDisabled =
    currentColorBackground === themes['chromatix-magenta'].background &&
    currentColorText === themes['chromatix-magenta'].text &&
    currentColorPrimary === themes['chromatix-magenta'].primary;

  return (
    <div className="settingsGroup">
      <div className={style.title}>Custom Theme</div>
      <div className={style.colorWrap}>
        <div className={style.colorField}>
          <div className={style.colorLabel}>Background:</div>
          <input
            type="color"
            className={style.colorInput}
            value={currentColorBackground}
            onChange={(event) => {
              dispatch.sessionModel.setColorBackground(event.target.value);
            }}
          />
        </div>
        <div className={style.colorField}>
          <div className={style.colorLabel}>Text:</div>
          <input
            type="color"
            className={style.colorInput}
            value={currentColorText}
            onChange={(event) => {
              dispatch.sessionModel.setColorText(event.target.value);
            }}
          />
        </div>
        <div className={style.colorField}>
          <div className={style.colorLabel}>Highlight:</div>
          <input
            type="color"
            className={style.colorInput}
            value={currentColorPrimary}
            onChange={(event) => {
              dispatch.sessionModel.setColorPrimary(event.target.value);
            }}
          />
        </div>
        <div className={style.colorField}>
          <Button size="tab" color="secondary" wrap={false} onClick={resetCustomTheme} disabled={resetIsDisabled}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

//
// TINT SETTINGS
//

const TintSettings = () => {
  const currentUiTinting = useSelector(({ sessionModel }) => sessionModel.currentUiTinting);

  const menuItems = [
    {
      type: 'tabGroup',
      key: 'currentUiTinting',
      state: currentUiTinting,
      options: [
        {
          label: 'Auto',
          value: 'auto',
        },
        {
          label: 'Darken',
          value: 'darken',
        },
        {
          label: 'Lighten',
          value: 'lighten',
        },
      ],
    },
  ];

  return <SettingsList title="Sidebar Tint" menuItems={menuItems} />;
};

//
// CONTRAST SETTINGS
//

const ContrastSettings = () => {
  const currentContrast = useSelector(({ sessionModel }) => sessionModel.currentContrast);

  const menuItems = [
    {
      type: 'tabGroup',
      key: 'currentContrast',
      state: currentContrast,
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'High',
          value: 'high',
        },
      ],
    },
  ];

  return <SettingsList title="Contrast" menuItems={menuItems} />;
};

//
// ACCESSIBILITY SETTINGS
//

const AccessibilitySettings = () => {
  const themeKeyFocus = useSelector(({ sessionModel }) => sessionModel.themeKeyFocus);

  const menuItems = [
    {
      key: 'themeKeyFocus',
      label: 'Highlight focused elements.',
      description:
        'When enabled, elements such as buttons, links, and form controls are highlighted when focused. For example, when using the keyboard to navigate the interface.',
      footnote: 'Note: this option is also displayed in the keyboard settings section.',
      state: themeKeyFocus,
    },
  ];

  return <SettingsList title="Accessibility" menuItems={menuItems} />;
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

  return <SettingsList title="Scrollbars (Windows and Linux only)" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAppearance;
