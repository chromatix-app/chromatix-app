// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { Icon } from 'js/components';
import { useNavigationHistory } from 'js/hooks';
import * as plex from 'js/services/plex';

import style from './SideBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SideBar = () => {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  const {
    currentLibrary,

    menuShowIcons,
    menuShowAllPlaylists,
    menuShowSeparateBrowseSection,

    menuOpenLibrary,
    menuOpenBrowse,
    menuOpenPlaylists,

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

  const dispatch = useDispatch();

  const currentLibraryId = currentLibrary?.libraryId;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );

  const libraryIsVisible = menuShowArtists || menuShowAlbums || menuShowPlaylists;
  const browseIsVisible =
    menuShowArtistCollections ||
    menuShowAlbumCollections ||
    menuShowArtistGenres ||
    menuShowAlbumGenres ||
    menuShowArtistMoods ||
    menuShowAlbumMoods ||
    menuShowArtistStyles ||
    menuShowAlbumStyles;
  const playlistsIsVisible = menuShowAllPlaylists && allPlaylists && allPlaylists.length > 0;

  const browseIsOpen = menuShowSeparateBrowseSection ? menuOpenBrowse : menuOpenLibrary;

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <div className={style.wrap}>
      <div className={style.nav}>
        <button className={style.prev} disabled={!canGoBack} onClick={goBack}>
          <Icon icon="PreviousIcon" cover stroke />
        </button>
        <button className={style.next} disabled={!canGoForward} onClick={goForward}>
          <Icon icon="NextIcon" cover stroke />
        </button>
      </div>

      {(libraryIsVisible || (browseIsVisible && !menuShowSeparateBrowseSection)) && (
        <>
          <button
            className={style.label}
            onClick={() => {
              dispatch.sessionModel.setSessionState({ menuOpenLibrary: !menuOpenLibrary });
            }}
          >
            Library
            <span className={style.labelIcon}>
              {menuOpenLibrary ? (
                <Icon icon="ArrowDownIcon" cover stroke strokeWidth={1.4} />
              ) : (
                <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.4} />
              )}
            </span>
          </button>
          {libraryIsVisible && menuOpenLibrary && (
            <>
              {menuShowArtists && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/artists">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="PeopleIcon" cover stroke />
                    </span>
                  )}
                  Artists
                </NavLink>
              )}
              {menuShowAlbums && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/albums">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="PlayCircleIcon" cover stroke />
                    </span>
                  )}
                  Albums
                </NavLink>
              )}
              {menuShowPlaylists && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/playlists" exact>
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="MusicNoteIcon" cover stroke />
                    </span>
                  )}
                  Playlists
                </NavLink>
              )}
            </>
          )}
        </>
      )}

      {browseIsVisible && (
        <>
          {menuShowSeparateBrowseSection && (
            <button
              className={style.label}
              onClick={() => {
                dispatch.sessionModel.setSessionState({ menuOpenBrowse: !menuOpenBrowse });
              }}
            >
              Browse
              <span className={style.labelIcon}>
                {browseIsOpen ? (
                  <Icon icon="ArrowDownIcon" cover stroke strokeWidth={1.4} />
                ) : (
                  <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.4} />
                )}
              </span>
            </button>
          )}
          {browseIsOpen && (
            <>
              {menuShowArtistCollections && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-collections">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="ArtistCollectionsIcon" cover stroke />
                    </span>
                  )}
                  Artist Collections
                </NavLink>
              )}
              {menuShowAlbumCollections && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/album-collections">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="AlbumCollectionsIcon" cover stroke />
                    </span>
                  )}
                  Album Collections
                </NavLink>
              )}
              {menuShowArtistGenres && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-genres">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="ArtistGenresIcon" cover stroke />
                    </span>
                  )}
                  Artist Genres
                </NavLink>
              )}
              {menuShowAlbumGenres && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/album-genres">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="AlbumGenresIcon" cover stroke />
                    </span>
                  )}
                  Album Genres
                </NavLink>
              )}
              {menuShowArtistMoods && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-moods">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="ArtistMoodsIcon" cover stroke />
                    </span>
                  )}
                  Artist Moods
                </NavLink>
              )}
              {menuShowAlbumMoods && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/album-moods">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="AlbumMoodsIcon" cover stroke />
                    </span>
                  )}
                  Album Moods
                </NavLink>
              )}
              {menuShowArtistStyles && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-styles">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="ArtistStylesIcon" cover stroke />
                    </span>
                  )}
                  Artist Styles
                </NavLink>
              )}
              {menuShowAlbumStyles && (
                <NavLink className={style.link} activeClassName={style.linkActive} to="/album-styles">
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="AlbumStylesIcon" cover stroke />
                    </span>
                  )}
                  Album Styles
                </NavLink>
              )}
            </>
          )}
        </>
      )}

      {playlistsIsVisible && (
        <>
          <button
            className={style.label}
            onClick={() => {
              dispatch.sessionModel.setSessionState({ menuOpenPlaylists: !menuOpenPlaylists });
            }}
          >
            Playlists
            <span className={style.labelIcon}>
              {menuOpenPlaylists ? (
                <Icon icon="ArrowDownIcon" cover stroke strokeWidth={1.4} />
              ) : (
                <Icon icon="ArrowRightIcon" cover stroke strokeWidth={1.4} />
              )}
            </span>
          </button>
          {menuOpenPlaylists && (
            <>
              {allPlaylists.map((playlist) => (
                <NavLink
                  key={playlist.playlistId}
                  className={style.link}
                  activeClassName={style.linkActive}
                  to={playlist.link}
                >
                  {menuShowIcons && (
                    <span className={style.icon}>
                      <Icon icon="PlaylistIcon" cover stroke />
                    </span>
                  )}
                  {playlist.title}
                </NavLink>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SideBar;
