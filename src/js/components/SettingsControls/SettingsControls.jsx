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
        <GeneralSettings platformOpts={platformOpts} />
      </div>
    </>
  );
};

//
// GENERAL
//

const GeneralSettings = ({ platformOpts }) => {
  const controlBarIsFavourite = useSelector(({ sessionModel }) => sessionModel.controlBarIsFavourite);
  const controlBarUserRating = useSelector(({ sessionModel }) => sessionModel.controlBarUserRating);

  const menuItems = [
    ...(platformOpts.enableIsFavourite
      ? [
          {
            key: 'controlBarIsFavourite',
            label: 'Show Favourites',
            state: controlBarIsFavourite && platformOpts.enableIsFavourite,
            disabled: !platformOpts.enableIsFavourite,
          },
        ]
      : []),
    ...(platformOpts.enableUserRating
      ? [
          {
            key: 'controlBarUserRating',
            label: 'Show Star Ratings',
            state: controlBarUserRating && platformOpts.enableUserRating,
            disabled: !platformOpts.enableUserRating,
          },
        ]
      : []),
  ];

  return <SettingsList title="General" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsControls;
