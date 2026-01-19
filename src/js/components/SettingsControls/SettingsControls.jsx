// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

import style from './SettingsControls.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsControls = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      <div className={style.wrap}>
        <NowPlayingSettings platformOpts={platformOpts} />
      </div>
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
      label: 'Show title',
      state: controlBarTitle,
    },
    {
      key: 'controlBarArtist',
      label: 'Show artist',
      state: controlBarArtist,
    },
    ...(platformOpts.enableIsFavourite
      ? [
          {
            key: 'controlBarIsFavourite',
            label: 'Show favourites',
            state: controlBarIsFavourite && platformOpts.enableIsFavourite,
            disabled: !platformOpts.enableIsFavourite,
          },
        ]
      : []),
    ...(platformOpts.enableUserRating
      ? [
          {
            key: 'controlBarUserRating',
            label: 'Show star ratings',
            state: controlBarUserRating && platformOpts.enableUserRating,
            disabled: !platformOpts.enableUserRating,
          },
        ]
      : []),
  ];

  return <SettingsList title="Now playing" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsControls;
