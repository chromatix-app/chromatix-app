// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { SettingsList } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsSidebar = () => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      {/* <PageText fontSize="small">
        <p>Some sections may be unavailable, depending on whether you are logged in with Plex or Jellyfin.</p>
      </PageText> */}
      <>
        <AnnouncementSettings />
        <GeneralSettings platformOpts={platformOpts} />
        <LibrarySettings platformOpts={platformOpts} />
        <BrowseSettings platformOpts={platformOpts} />
        <PlaylistSettings />
      </>
    </>
  );
};

//
// ANNOUNCEMENTS
//

const AnnouncementSettings = () => {
  const menuShowBanners = useSelector(({ sessionModel }) => sessionModel.menuShowBanners);
  const prevMenuShowBanners = useRef(menuShowBanners);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!prevMenuShowBanners.current && menuShowBanners) {
      dispatch.sessionModel.setSessionState({
        savedAppVersion: '0.0.0',
      });
    }
    prevMenuShowBanners.current = menuShowBanners;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuShowBanners]);

  const menuItems = [
    {
      key: 'menuShowBanners',
      label: 'Show "what’s new" banners',
      description:
        'When major new features are added, we’ll display a small notification banner at the top of the sidebar menu to let you know. These can be dismissed by clicking the "X" in the corner of the banner.',
      state: menuShowBanners,
    },
  ];

  return <SettingsList title="Announcements" menuItems={menuItems} />;
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

  return <SettingsList title="General" menuItems={menuItems} variant="compact" />;
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

  return <SettingsList title="Library" menuItems={menuItems} variant="compact" />;
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

  return <SettingsList title="Browse" menuItems={menuItems} variant="compact" />;
};

//
// PLAYLIST
//

const PlaylistSettings = () => {
  const menuShowAllPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowAllPlaylists);
  const menuShowAddPlaylist = useSelector(({ sessionModel }) => sessionModel.menuShowAddPlaylist);

  const menuItems = [
    {
      key: 'menuShowAllPlaylists',
      label: 'Show playlists',
      state: menuShowAllPlaylists,
    },
    {
      key: 'menuShowAddPlaylist',
      label: 'Show "New Playlist" button',
      state: menuShowAddPlaylist,
      disabled: !menuShowAllPlaylists,
    },
  ];

  return <SettingsList title="Playlists" menuItems={menuItems} variant="compact" />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsSidebar;
