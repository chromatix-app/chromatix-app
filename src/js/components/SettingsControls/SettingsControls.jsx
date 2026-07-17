// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsControls = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      <NowPlayingSettings platformOpts={platformOpts} />
      <SecondarySettings platformOpts={platformOpts} />
    </>
  );
};

//
// NOW PLAYING
//

const NowPlayingSettings = ({ platformOpts }) => {
  const controlBarTitle = useSelector(({ sessionModel }) => sessionModel.controlBarTitle);
  const controlBarArtist = useSelector(({ sessionModel }) => sessionModel.controlBarArtist);
  const controlBarIsFavourite = useSelector(({ sessionModel }) => sessionModel.controlBarIsFavourite);
  const controlBarUserRating = useSelector(({ sessionModel }) => sessionModel.controlBarUserRating);

  const menuItems = [
    {
      key: 'controlBarTitle',
      label: 'Title',
      state: controlBarTitle,
    },
    {
      key: 'controlBarArtist',
      label: 'Artist',
      state: controlBarArtist,
    },
    ...(platformOpts.enableIsFavourite
      ? [
          {
            key: 'controlBarIsFavourite',
            label: 'Favourites',
            state: controlBarIsFavourite && platformOpts.enableIsFavourite,
            disabled: !platformOpts.enableIsFavourite,
          },
        ]
      : []),
    ...(platformOpts.enableUserRating
      ? [
          {
            key: 'controlBarUserRating',
            label: 'Star ratings',
            state: controlBarUserRating && platformOpts.enableUserRating,
            disabled: !platformOpts.enableUserRating,
          },
        ]
      : []),
  ];

  return <SettingsList title="Now Playing" menuItems={menuItems} variant="compact" />;
};

//
// SECONDARY CONTROLS
//

const SecondarySettings = ({ platformOpts }) => {
  const controlBarFullPageToggle = useSelector(({ sessionModel }) => sessionModel.controlBarFullPageToggle);
  const controlBarQueueToggle = useSelector(({ sessionModel }) => sessionModel.controlBarQueueToggle);
  const controlBarAirPlayToggle = useSelector(({ sessionModel }) => sessionModel.controlBarAirPlayToggle);
  const controlBarVolumeToggle = useSelector(({ sessionModel }) => sessionModel.controlBarVolumeToggle);
  const controlBarVolumeSlider = useSelector(({ sessionModel }) => sessionModel.controlBarVolumeSlider);

  const menuItems = [
    {
      key: 'controlBarFullPageToggle',
      label: 'Full screen player toggle',
      state: controlBarFullPageToggle,
    },
    {
      key: 'controlBarQueueToggle',
      label: 'Queue toggle',
      state: controlBarQueueToggle,
    },
    {
      key: 'controlBarAirPlayToggle',
      label: 'AirPlay toggle',
      state: controlBarAirPlayToggle,
    },
    {
      key: 'controlBarVolumeToggle',
      label: 'Volume toggle',
      state: controlBarVolumeToggle,
    },
    {
      key: 'controlBarVolumeSlider',
      label: 'Volume slider',
      state: controlBarVolumeSlider,
    },
  ];

  return <SettingsList title="Secondary Controls" menuItems={menuItems} variant="compact" />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsControls;
