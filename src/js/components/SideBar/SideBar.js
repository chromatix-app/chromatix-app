// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
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
    menuShowArtists,
    menuShowAlbums,
    menuShowPlaylists,
    menuShowArtistCollections,
    menuShowAlbumCollections,
    menuShowArtistGenres,
    menuShowAlbumGenres,
    menuShowAllPlaylists,
  } = useSelector(({ sessionModel }) => sessionModel);

  const currentLibraryId = currentLibrary?.libraryId;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );

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
      <div className={style.label}>Library</div>
      {menuShowArtists && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/artists">
          Artists
        </NavLink>
      )}
      {menuShowAlbums && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/albums">
          Albums
        </NavLink>
      )}
      {menuShowPlaylists && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/playlists" exact>
          Playlists
        </NavLink>
      )}
      {menuShowArtistCollections && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-collections">
          Artist Collections
        </NavLink>
      )}
      {menuShowAlbumCollections && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/album-collections">
          Album Collections
        </NavLink>
      )}
      {menuShowArtistGenres && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/artist-genres">
          Artist Genres
        </NavLink>
      )}
      {menuShowAlbumGenres && (
        <NavLink className={style.link} activeClassName={style.linkActive} to="/album-genres">
          Album Genres
        </NavLink>
      )}
      {menuShowAllPlaylists && allPlaylists && allPlaylists.length > 0 && (
        <>
          <div className={style.label}>Playlists</div>
          {allPlaylists.map((playlist) => (
            <NavLink
              key={playlist.playlistId}
              className={style.link}
              activeClassName={style.linkActive}
              to={playlist.link}
            >
              {playlist.title}
            </NavLink>
          ))}
        </>
      )}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SideBar;
