// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsPlayback = () => {
  return (
    <>
      <GeneralSettings />
      <RepeatSettings />
      <GaplessSettings />
      <ServerSettings />
    </>
  );
};

//
// GENERAL
//

const GeneralSettings = () => {
  const switchToTrackViewOnArtistPlay = useSelector(({ sessionModel }) => sessionModel.switchToTrackViewOnArtistPlay);

  const menuItems = [
    {
      key: 'switchToTrackViewOnArtistPlay',
      label: 'Switch to track view when playing from artist page.',
      description:
        'When enabled, if you start artist playback from an artist page while in grid or list view, the app will switch to track view and highlight the currently playing track. When disabled, it will keep you in grid or list view instead.',
      state: switchToTrackViewOnArtistPlay,
    },
  ];

  return <SettingsList title="General" menuItems={menuItems} />;
};

//
// REPEAT
//

const RepeatSettings = () => {
  const disableRepeatOnceOnTrackChange = useSelector(({ sessionModel }) => sessionModel.disableRepeatOnceOnTrackChange);
  const disableRepeatOnceOnSourceChange = useSelector(
    ({ sessionModel }) => sessionModel.disableRepeatOnceOnSourceChange
  );
  const revertRepeatOnceToRepeatAll = useSelector(({ sessionModel }) => sessionModel.revertRepeatOnceToRepeatAll);

  const menuItems = [
    {
      key: 'disableRepeatOnceOnTrackChange',
      label: 'Disable "repeat 1" mode when changing tracks.',
      description: '',
      state: disableRepeatOnceOnTrackChange,
    },
    {
      key: 'disableRepeatOnceOnSourceChange',
      label: 'Disable "repeat 1" mode when loading a new album or playlist.',
      description: '',
      state: disableRepeatOnceOnSourceChange,
    },
    {
      key: 'revertRepeatOnceToRepeatAll',
      label: 'When automatically disabling "repeat 1" mode (in the above scenarios) enable "repeat all" mode instead.',
      description: '',
      state: revertRepeatOnceToRepeatAll,
      disabled: !disableRepeatOnceOnTrackChange && !disableRepeatOnceOnSourceChange,
    },
  ];

  return <SettingsList title="Repeat Mode" menuItems={menuItems} />;
};

//
// SERVER
//

const ServerSettings = () => {
  const optionLogPlaybackToServer = useSelector(({ sessionModel }) => sessionModel.optionLogPlaybackToServer);

  const menuItems = [
    {
      key: 'optionLogPlaybackToServer',
      label: 'Log playback events to server.',
      description:
        'This is used to tell your media server what is currently playing. Your server may use this information for things like updating play counts and tracking usage.',
      state: optionLogPlaybackToServer,
    },
  ];

  return <SettingsList title="Server" menuItems={menuItems} />;
};

//
// GAPLESS
//

const GaplessSettings = () => {
  return (
    <SettingsList
      title="Gapless Playback"
      menuItems={[
        {
          type: 'label',
          label:
            'Gapless playback is not currently supported in this app. Chromatix is built using web technologies, where gapless playback is very challenging to successfully achieve. Existing solutions are complex and have a lot of trade-offs. We hope to be able to add this in the future, but cannot currently make any promises about if or when it will be available.',
        },
      ]}
    />
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsPlayback;
