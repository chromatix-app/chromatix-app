// ======================================================================
// IMPORTS
// ======================================================================

import {
  SettingsAbout,
  SettingsAppearance,
  SettingsBrowse,
  SettingsChangelog,
  SettingsControls,
  SettingsDownloads,
  SettingsAccounts,
  SettingsKeyboard,
  SettingsSidebar,
  TitleHeading,
} from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

const Component = () => {
  return (
    <>
      <TitleHeading title="All Settings" />
      <SettingsAccounts debug={true} />
      <SettingsBrowse debug={true} />
      <SettingsAppearance debug={true} />
      <SettingsKeyboard />
      <SettingsSidebar />
      <SettingsControls />
      <SettingsDownloads />
      <SettingsAbout />
      <SettingsChangelog />
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Component;
