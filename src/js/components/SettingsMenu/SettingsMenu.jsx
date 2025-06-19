// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { PageText } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

import style from './SettingsMenu.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsMenu = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      {currentService === 'jellyfin' && (
        <PageText fontSize="small">
          <p>Some sections are available for Jellyfin libraries.</p>
        </PageText>
      )}
      <div className={style.wrap}>
        <div className={style.group}>
          <div className={style.title}>General</div>
          <GeneralSettings platformOpts={platformOpts} />
        </div>
        <div className={style.group}>
          <div className={style.title}>Library</div>
          <LibrarySettings platformOpts={platformOpts} />
        </div>
        <div className={style.group}>
          <div className={style.title}>Browse</div>
          <BrowseSettings platformOpts={platformOpts} />
        </div>
        <div className={style.group}>
          <div className={style.title}>Playlists</div>
          <PlaylistSettings platformOpts={platformOpts} />
        </div>
      </div>
    </>
  );
};

//
// GENERAL
//

const GeneralSettings = ({ platformOpts }) => {
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

const LibrarySettings = ({ platformOpts }) => {
  const dispatch = useDispatch();

  const menuShowArtists = useSelector(({ sessionModel }) => sessionModel.menuShowArtists);
  const menuShowAlbums = useSelector(({ sessionModel }) => sessionModel.menuShowAlbums);
  const menuShowFolders = useSelector(({ sessionModel }) => sessionModel.menuShowFolders);
  const menuShowPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowPlaylists);

  const menuItems = [
    { key: 'menuShowArtists', label: 'Artists', state: menuShowArtists },
    { key: 'menuShowAlbums', label: 'Albums', state: menuShowAlbums },
    {
      key: 'menuShowFolders',
      label: 'Folders',
      state: menuShowFolders && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    { key: 'menuShowPlaylists', label: 'Playlists', state: menuShowPlaylists },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state, disabled }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
              disabled={disabled}
            />
            {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
          </label>
        </div>
      ))}
    </div>
  );
};

//
// BROWSE
//

const BrowseSettings = ({ platformOpts }) => {
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
      variant: 'spaceBelow',
      label: 'Show as separate "Browse" section',
      state: menuShowSeparateBrowseSection && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowArtistCollections',
      label: 'Artist Collections',
      state: menuShowArtistCollections && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowAlbumCollections',
      label: 'Album Collections',
      state: menuShowAlbumCollections && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowArtistGenres',
      label: 'Artist Genres',
      state: menuShowArtistGenres && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowAlbumGenres',
      label: 'Album Genres',
      state: menuShowAlbumGenres && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowArtistMoods',
      label: 'Artist Moods',
      state: menuShowArtistMoods && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowAlbumMoods',
      label: 'Album Moods',
      state: menuShowAlbumMoods && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowArtistStyles',
      label: 'Artist Styles',
      state: menuShowArtistStyles && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
    {
      key: 'menuShowAlbumStyles',
      label: 'Album Styles',
      state: menuShowAlbumStyles && platformOpts.menuFolders,
      disabled: !platformOpts.menuFolders,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, variant, label, state, disabled }) => (
        <div key={key} className={clsx(style.menuEntry, variant && style[variant])}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
              disabled={disabled}
            />
            {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
          </label>
        </div>
      ))}
    </div>
  );
};

//
// PLAYLIST
//

const PlaylistSettings = ({ platformOpts }) => {
  const dispatch = useDispatch();

  const menuShowAllPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowAllPlaylists);

  const menuItems = [{ key: 'menuShowAllPlaylists', label: 'Show playlists', state: menuShowAllPlaylists }];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, state, disabled }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
              disabled={disabled}
            />
            {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
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
