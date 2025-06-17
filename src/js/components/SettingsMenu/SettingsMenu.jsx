// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import style from './SettingsMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsMenu = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>General</div>
        <GeneralSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Library</div>
        <LibrarySettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Browse</div>
        <BrowseSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Playlists</div>
        <PlaylistSettings />
      </div>
    </div>
  );
};

//
// GENERAL
//

const GeneralSettings = () => {
  const dispatch = useDispatch();

  const menuShowIcons = useSelector(({ sessionModel }) => sessionModel.menuShowIcons);
  const menuShowSearch = useSelector(({ sessionModel }) => sessionModel.menuShowSearch);

  const menuItems = [
    { key: 'menuShowIcons', label: 'Show icons', state: menuShowIcons },
    { key: 'menuShowSearch', label: 'Show search', state: menuShowSearch },
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

  const menuShowArtists = useSelector(({ sessionModel }) => sessionModel.menuShowArtists);
  const menuShowAlbums = useSelector(({ sessionModel }) => sessionModel.menuShowAlbums);
  const menuShowFolders = useSelector(({ sessionModel }) => sessionModel.menuShowFolders);
  const menuShowPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowPlaylists);

  const menuItems = [
    { key: 'menuShowArtists', label: 'Artists', state: menuShowArtists },
    { key: 'menuShowAlbums', label: 'Albums', state: menuShowAlbums },
    { key: 'menuShowFolders', label: 'Folders', state: menuShowFolders },
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

  const menuShowSeparateBrowseSection = useSelector(({ sessionModel }) => sessionModel.menuShowSeparateBrowseSection);
  const menuShowArtistCollections = useSelector(({ sessionModel }) => sessionModel.menuShowArtistCollections);
  const menuShowAlbumCollections = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumCollections);
  const menuShowArtistGenres = useSelector(({ sessionModel }) => sessionModel.menuShowArtistGenres);
  const menuShowAlbumGenres = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumGenres);
  const menuShowArtistMoods = useSelector(({ sessionModel }) => sessionModel.menuShowArtistMoods);
  const menuShowAlbumMoods = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumMoods);
  const menuShowArtistStyles = useSelector(({ sessionModel }) => sessionModel.menuShowArtistStyles);
  const menuShowAlbumStyles = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumStyles);

  const menuItems = [
    {
      key: 'menuShowSeparateBrowseSection',
      label: 'Show as separate "Browse" section',
      state: menuShowSeparateBrowseSection,
      variant: 'spaceBelow',
    },
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
      {menuItems.map(({ key, label, state, variant }) => (
        <div key={key} className={clsx(style.menuEntry, variant && style[variant])}>
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
// PLAYLIST
//

const PlaylistSettings = () => {
  const dispatch = useDispatch();

  const menuShowAllPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowAllPlaylists);

  const menuItems = [{ key: 'menuShowAllPlaylists', label: 'Show playlists', state: menuShowAllPlaylists }];

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
