// ======================================================================
// IMPORTS
// ======================================================================

import {
  SettingsAbout,
  SettingsAccounts,
  SettingsAppearance,
  SettingsBrowse,
  SettingsChangelog,
  SettingsControls,
  SettingsDownloads,
  SettingsKeyboard,
  SettingsPlayback,
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
      <SettingsAppearance debug={true} />
      <SettingsBrowse debug={true} />
      <SettingsPlayback />
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
