// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

import style from './SettingsGeneral.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsGeneral = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <div className={style.wrap}>
      <GeneralSettings />
      <ServerSettings />
      <SortSettings />
      {platformOpts.enableUserRating && <RatingSettings />}
      <PlaybackSettings />
    </div>
  );
};

//
// GENERAL
//

const GeneralSettings = () => {
  const menuShowBanners = useSelector(({ sessionModel }) => sessionModel.menuShowBanners);

  const menuItems = [
    {
      key: 'menuShowBanners',
      label: 'Show "what’s new" banners',
      description:
        'When major new features are added, we’ll display a small notification banner at the top of the sidebar menu to let you know.',
      state: menuShowBanners,
    },
  ];

  return <SettingsList title="General" menuItems={menuItems} />;
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
// SORTING
//

const SortSettings = () => {
  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  const menuItems = [
    {
      key: 'optionSortNumbersFirst',
      label: 'Sort with numbers on top.',
      description: 'When sorting alphabetically, put entries that start with a number at the top of the list.',
      state: optionSortNumbersFirst,
    },
    {
      key: 'optionSortIgnoreLeadingArticles',
      label: 'Ignore "a", "an" and "the" when sorting.',
      description:
        'When sorting alphabetically, ignore leading prefixes like "A", "An", and "The" at the start of titles.',
      state: optionSortIgnoreLeadingArticles,
    },
  ];

  return <SettingsList title="Sorting" menuItems={menuItems} />;
};

//
// RATINGS
//

const RatingSettings = () => {
  const optionUseHalfStars = useSelector(({ sessionModel }) => sessionModel.optionUseHalfStars);

  const menuItems = [
    {
      key: 'optionUseHalfStars',
      label: 'Use half stars in ratings.',
      description: 'Enable to allow setting half-star ratings. Disable to set whole stars only.',
      state: optionUseHalfStars,
    },
  ];

  return <SettingsList title="Rating System" menuItems={menuItems} />;
};

//
// PLAYBACK
//

const PlaybackSettings = () => {
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

  return <SettingsList title="Playback" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsGeneral;
