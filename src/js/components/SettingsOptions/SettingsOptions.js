// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import style from './SettingsOptions.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsOptions = () => {
  return (
    <div className={style.wrap}>
      <div className={style.entry}>
        <div className={style.title}>General</div>
        <GeneralSettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Menu</div>
        <MenuSettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Menu Library Sections</div>
        <MenuSections />
      </div>
    </div>
  );
};

//
// GENERAL
//

const GeneralSettings = () => {
  const dispatch = useDispatch();

  const { optionShowFullTitles, optionShowStarRatings, optionLogPlexPlayback } = useSelector(
    ({ sessionModel }) => sessionModel
  );

  const menuItems = [
    {
      key: 'optionShowFullTitles',
      label: 'Always show full track, artist and album titles',
      state: optionShowFullTitles,
    },
    { key: 'optionShowStarRatings', label: 'Show star ratings', state: optionShowStarRatings },
    {
      key: 'optionLogPlexPlayback',
      label: 'Log playback events to Plex',
      description: 'This is used to tell the Plex server what is currently playing, and to update the play count.',
      state: optionLogPlexPlayback,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>
              {label && <div className={style.label}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// MENU
//

const MenuSettings = () => {
  const dispatch = useDispatch();

  const { menuShowIcons, menuShowAllPlaylists } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    { key: 'menuShowIcons', label: 'Show Icons', state: menuShowIcons },
    { key: 'menuShowAllPlaylists', label: 'Show Playlists', state: menuShowAllPlaylists },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>{label}</div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// MENU SECTIONS
//

const MenuSections = () => {
  const dispatch = useDispatch();

  const {
    menuShowArtists,
    menuShowAlbums,
    menuShowPlaylists,
    menuShowArtistCollections,
    menuShowAlbumCollections,
    menuShowArtistGenres,
    menuShowAlbumGenres,
    menuShowArtistStyles,
    menuShowAlbumStyles,
    menuShowArtistMoods,
    menuShowAlbumMoods,
  } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    { key: 'menuShowArtists', label: 'Artists', state: menuShowArtists },
    { key: 'menuShowAlbums', label: 'Albums', state: menuShowAlbums },
    { key: 'menuShowPlaylists', label: 'Playlists', state: menuShowPlaylists },
    { key: 'menuShowArtistCollections', label: 'Artist Collections', state: menuShowArtistCollections },
    { key: 'menuShowAlbumCollections', label: 'Album Collections', state: menuShowAlbumCollections },
    { key: 'menuShowArtistGenres', label: 'Artist Genres', state: menuShowArtistGenres },
    { key: 'menuShowAlbumGenres', label: 'Album Genres', state: menuShowAlbumGenres },
    { key: 'menuShowArtistStyles', label: 'Artist Styles', state: menuShowArtistStyles },
    { key: 'menuShowAlbumStyles', label: 'Album Styles', state: menuShowAlbumStyles },
    { key: 'menuShowArtistMoods', label: 'Artist Moods', state: menuShowArtistMoods },
    { key: 'menuShowAlbumMoods', label: 'Album Moods', state: menuShowAlbumMoods },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
            />
            <div>{label}</div>
          </label>
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsOptions;
