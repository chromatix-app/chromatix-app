// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { SettingsList } from 'js/components';
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
      {/* <PageText fontSize="small">
        <p>Some sections may be unavailable, depending on whether you are logged in with Plex or Jellyfin.</p>
      </PageText> */}
      <div className={style.wrap}>
        <GeneralSettings platformOpts={platformOpts} />
        <LibrarySettings platformOpts={platformOpts} />
        <BrowseSettings platformOpts={platformOpts} />
        <PlaylistSettings platformOpts={platformOpts} />
      </div>
    </>
  );
};

//
// GENERAL
//

const GeneralSettings = ({ platformOpts }) => {
  const menuShowSearch = useSelector(({ sessionModel }) => sessionModel.menuShowSearch);
  const menuShowIcons = useSelector(({ sessionModel }) => sessionModel.menuShowIcons);

  const menuItems = [
    { key: 'menuShowSearch', label: 'Show search', state: menuShowSearch },
    { key: 'menuShowIcons', label: 'Show icons', state: menuShowIcons },
  ];

  return <SettingsList title="General" menuItems={menuItems} />;
};

//
// LIBRARY
//

const LibrarySettings = ({ platformOpts }) => {
  const menuShowArtists = useSelector(({ sessionModel }) => sessionModel.menuShowArtists);
  const menuShowAlbumArtists = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumArtists);
  const menuShowAlbums = useSelector(({ sessionModel }) => sessionModel.menuShowAlbums);
  const menuShowFolders = useSelector(({ sessionModel }) => sessionModel.menuShowFolders);
  const menuShowPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowPlaylists);

  const menuItems = [
    {
      key: 'menuShowArtists',
      label: 'Artists',
      state: menuShowArtists && platformOpts.menuArtists,
      disabled: !platformOpts.menuArtists,
    },
    ...(platformOpts.menuAlbumArtists
      ? [
          {
            key: 'menuShowAlbumArtists',
            label: 'Album Artists',
            state: menuShowAlbumArtists && platformOpts.menuAlbumArtists,
            disabled: !platformOpts.menuAlbumArtists,
          },
        ]
      : []),
    {
      key: 'menuShowAlbums',
      label: 'Albums',
      state: menuShowAlbums && platformOpts.menuAlbums,
      disabled: !platformOpts.menuAlbums,
    },
    ...(platformOpts.menuFolders
      ? [
          {
            key: 'menuShowFolders',
            label: 'Folders',
            state: menuShowFolders && platformOpts.menuFolders,
            disabled: !platformOpts.menuFolders,
          },
        ]
      : []),
    {
      key: 'menuShowPlaylists',
      label: 'Playlists',
      state: menuShowPlaylists && platformOpts.menuPlaylists,
      disabled: !platformOpts.menuPlaylists,
    },
  ];

  return <SettingsList title="Library" menuItems={menuItems} />;
};

//
// BROWSE
//

const BrowseSettings = ({ platformOpts }) => {
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
      type: 'spacer',
    },
    ...(platformOpts.menuArtistCollections
      ? [
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
        ]
      : []),
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
    ...(platformOpts.menuArtistMoods
      ? [
          {
            key: 'menuShowArtistMoods',
            label: 'Artist Moods',
            state: menuShowArtistMoods && platformOpts.menuArtistMoods,
            disabled: !platformOpts.menuArtistMoods,
          },
          {
            key: 'menuShowAlbumMoods',
            label: 'Album Moods',
            state: menuShowAlbumMoods && platformOpts.menuAlbumMoods,
            disabled: !platformOpts.menuAlbumMoods,
          },
        ]
      : []),
    ...(platformOpts.menuArtistStyles
      ? [
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
        ]
      : []),
    ...(platformOpts.menuArtistTags
      ? [
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
        ]
      : []),
  ];

  return <SettingsList title="Browse" menuItems={menuItems} />;
};

//
// PLAYLIST
//

const PlaylistSettings = ({ platformOpts }) => {
  const menuShowAllPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowAllPlaylists);

  const menuItems = [
    {
      key: 'menuShowAllPlaylists',
      label: 'Show playlists',
      state: menuShowAllPlaylists,
    },
  ];

  return <SettingsList title="Playlists" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsMenu;
