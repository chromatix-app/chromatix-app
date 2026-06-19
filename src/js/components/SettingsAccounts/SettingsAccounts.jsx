// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsAccounts = ({ debug }) => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);

  return <>{(currentService === 'plex' || debug) && <PlexHomeSettings />}</>;
};

//
// PLEX HOME
//

const PlexHomeSettings = () => {
  const optionKeepHomeUsersLoggedIn = useSelector(({ sessionModel }) => sessionModel.optionKeepHomeUsersLoggedIn);
  const optionRememberLastLibrary = useSelector(({ sessionModel }) => sessionModel.optionRememberLastLibrary);

  const menuItems = [
    {
      key: 'optionKeepHomeUsersLoggedIn',
      label: 'Automatically sign in Plex Home users.',
      state: optionKeepHomeUsersLoggedIn,
    },
    {
      key: 'optionRememberLastLibrary',
      label: 'Remember currently selected library when switching Plex Home users.',
      state: optionRememberLastLibrary,
    },
  ];

  return <SettingsList title="Plex Home" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsAccounts;
