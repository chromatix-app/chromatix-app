// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import style from './SettingsMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsMenu = () => {
  return (
    <div className={style.wrap}>
      <div className={style.entry}>
        <div className={style.title}>General</div>
        <GeneralSettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Library</div>
        <LibrarySettings />
      </div>
      <div className={style.entry}>
        <div className={style.title}>Browse</div>
        <BrowseSettings />
      </div>
    </div>
  );
};

//
// GENERAL
//

const GeneralSettings = () => {
  const dispatch = useDispatch();

  const { menuShowIcons, menuShowAllPlaylists, menuShowSeparateBrowseSection } = useSelector(
    ({ sessionModel }) => sessionModel
  );

  const menuItems = [
    { key: 'menuShowIcons', label: 'Show icons', state: menuShowIcons },
    { key: 'menuShowAllPlaylists', label: 'Show playlists', state: menuShowAllPlaylists },
    {
      key: 'menuShowSeparateBrowseSection',
      label: 'Show separate "Browse" section',
      state: menuShowSeparateBrowseSection,
    },
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
// LIBRARY
//

const LibrarySettings = () => {
  const dispatch = useDispatch();

  const { menuShowArtists, menuShowAlbums, menuShowPlaylists } = useSelector(({ sessionModel }) => sessionModel);

  const menuItems = [
    { key: 'menuShowArtists', label: 'Artists', state: menuShowArtists },
    { key: 'menuShowAlbums', label: 'Albums', state: menuShowAlbums },
    { key: 'menuShowPlaylists', label: 'Playlists', state: menuShowPlaylists },
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
// BROWSE
//

const BrowseSettings = () => {
  const dispatch = useDispatch();

  const {
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
    { key: 'menuShowArtistCollections', label: 'Artist Collections', state: menuShowArtistCollections },
    { key: 'menuShowAlbumCollections', label: 'Album Collections', state: menuShowAlbumCollections },
    { key: 'menuShowArtistGenres', label: 'Artist Genres', state: menuShowArtistGenres },
    { key: 'menuShowAlbumGenres', label: 'Album Genres', state: menuShowAlbumGenres },
    { key: 'menuShowArtistMoods', label: 'Artist Moods', state: menuShowArtistMoods },
    { key: 'menuShowAlbumMoods', label: 'Album Moods', state: menuShowAlbumMoods },
    { key: 'menuShowArtistStyles', label: 'Artist Styles', state: menuShowArtistStyles },
    { key: 'menuShowAlbumStyles', label: 'Album Styles', state: menuShowAlbumStyles },
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

export default SettingsMenu;
