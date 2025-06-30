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

const isLocal = process.env.REACT_APP_ENV === 'local';

export const SettingsMenu = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      {isLocal && (
        <PageText fontSize="small">
          <p>Some sections may be unavailable, depending on whether you are logged in with Plex or Jellyfin.</p>
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
  const menuShowArtistTags = useSelector(({ sessionModel }) => sessionModel.menuShowArtistTags);
  const menuShowAlbumTags = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumTags);

  const menuItems = [
    {
      key: 'menuShowSeparateBrowseSection',
      variant: 'spaceBelow',
      label: 'Show as separate "Browse" section',
      state: menuShowSeparateBrowseSection,
    },
    {
      key: 'menuShowArtistCollections',
      label: 'Artist Collections',
      state: menuShowArtistCollections && platformOpts.menuArtistCollections,
      disabled: !platformOpts.menuArtistCollections,
    },
    {
      key: 'menuShowAlbumCollections',
      label: 'Album Collections',
      state: menuShowAlbumCollections && platformOpts.menuAlbumCollections,
      disabled: !platformOpts.menuAlbumCollections,
    },
    {
      key: 'menuShowArtistGenres',
      label: 'Artist Genres',
      state: menuShowArtistGenres && platformOpts.menuArtistGenres,
      disabled: !platformOpts.menuArtistGenres,
    },
    {
      key: 'menuShowAlbumGenres',
      label: 'Album Genres',
      state: menuShowAlbumGenres && platformOpts.menuAlbumGenres,
      disabled: !platformOpts.menuAlbumGenres,
    },
    {
      key: 'menuShowArtistMoods',
      label: 'Artist Moods',
      state: menuShowArtistMoods && platformOpts.menuArtistStyles,
      disabled: !platformOpts.menuArtistStyles,
    },
    {
      key: 'menuShowAlbumMoods',
      label: 'Album Moods',
      state: menuShowAlbumMoods && platformOpts.menuAlbumStyles,
      disabled: !platformOpts.menuAlbumStyles,
    },
    {
      key: 'menuShowArtistStyles',
      label: 'Artist Styles',
      state: menuShowArtistStyles && platformOpts.menuArtistStyles,
      disabled: !platformOpts.menuArtistStyles,
    },
    {
      key: 'menuShowAlbumStyles',
      label: 'Album Styles',
      state: menuShowAlbumStyles && platformOpts.menuAlbumStyles,
      disabled: !platformOpts.menuAlbumStyles,
    },
    {
      key: 'menuShowArtistTags',
      label: 'Artist Tags',
      state: menuShowArtistTags && platformOpts.menuArtistTags,
      disabled: !platformOpts.menuArtistTags,
    },
    {
      key: 'menuShowAlbumTags',
      label: 'Album Tags',
      state: menuShowAlbumTags && platformOpts.menuAlbumTags,
      disabled: !platformOpts.menuAlbumTags,
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
