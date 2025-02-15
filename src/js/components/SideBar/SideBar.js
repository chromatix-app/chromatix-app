// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import * as RadixPopover from '@radix-ui/react-popover';

import { Icon, UserMenu } from 'js/components';
import { useKeyControl, useNavigationHistory } from 'js/hooks';
import { electronPlatform } from 'js/utils';
import * as plex from 'js/services/plex';

import style from './SideBar.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

// const isLocal = process.env.REACT_APP_ENV === 'local';

const SideBar = () => {
  const dispatch = useDispatch();

  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const menuShowIcons = useSelector(({ sessionModel }) => sessionModel.menuShowIcons);
  const menuShowSearch = useSelector(({ sessionModel }) => sessionModel.menuShowSearch);
  const menuShowAllPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowAllPlaylists);
  const menuShowSeparateBrowseSection = useSelector(({ sessionModel }) => sessionModel.menuShowSeparateBrowseSection);

  const menuOpenLibrary = useSelector(({ sessionModel }) => sessionModel.menuOpenLibrary);
  const menuOpenBrowse = useSelector(({ sessionModel }) => sessionModel.menuOpenBrowse);
  const menuOpenPlaylists = useSelector(({ sessionModel }) => sessionModel.menuOpenPlaylists);

  const menuShowArtists = useSelector(({ sessionModel }) => sessionModel.menuShowArtists);
  const menuShowAlbums = useSelector(({ sessionModel }) => sessionModel.menuShowAlbums);
  const menuShowFolders = useSelector(({ sessionModel }) => sessionModel.menuShowFolders);
  const menuShowPlaylists = useSelector(({ sessionModel }) => sessionModel.menuShowPlaylists);
  const menuShowArtistCollections = useSelector(({ sessionModel }) => sessionModel.menuShowArtistCollections);
  const menuShowAlbumCollections = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumCollections);
  const menuShowArtistGenres = useSelector(({ sessionModel }) => sessionModel.menuShowArtistGenres);
  const menuShowAlbumGenres = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumGenres);
  const menuShowArtistStyles = useSelector(({ sessionModel }) => sessionModel.menuShowArtistStyles);
  const menuShowAlbumStyles = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumStyles);
  const menuShowArtistMoods = useSelector(({ sessionModel }) => sessionModel.menuShowArtistMoods);
  const menuShowAlbumMoods = useSelector(({ sessionModel }) => sessionModel.menuShowAlbumMoods);

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

  // Get playlists on load
  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <>
      <div className={style.nav}>
        <button className={style.prev} disabled={!canGoBack} onClick={goBack}>
          <Icon icon="PreviousIcon" cover stroke />
        </button>
        <button className={style.next} disabled={!canGoForward} onClick={goForward}>
          <Icon icon="NextIcon" cover stroke />
        </button>
      </div>
      <div className={style.wrap}>
        {electronPlatform === 'win' && (
          <div className={style.userMenu}>
            <UserMenu variant="Inline" />
          </div>
        )}

        {menuShowSearch && <SearchField />}

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
                  <NavLink className={style.link} activeClassName={style.linkActive} to="/artists" draggable="false">
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="PeopleIcon" cover stroke />
                      </span>
                    )}
                    Artists
                  </NavLink>
                )}
                {menuShowAlbums && (
                  <NavLink className={style.link} activeClassName={style.linkActive} to="/albums" draggable="false">
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="PlayCircleIcon" cover stroke />
                      </span>
                    )}
                    Albums
                  </NavLink>
                )}
                {menuShowFolders && (
                  <NavLink className={style.link} activeClassName={style.linkActive} to="/folders" draggable="false">
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="FolderIcon" cover stroke />
                      </span>
                    )}
                    Folders
                  </NavLink>
                )}
                {menuShowPlaylists && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/playlists"
                    exact={playlistsIsVisible}
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="MusicNoteDoubleIcon" cover stroke />
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
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/artist-collections"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="ArtistCollectionsIcon" cover stroke />
                      </span>
                    )}
                    Artist Collections
                  </NavLink>
                )}
                {menuShowAlbumCollections && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/album-collections"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="AlbumCollectionsIcon" cover stroke />
                      </span>
                    )}
                    Album Collections
                  </NavLink>
                )}
                {menuShowArtistGenres && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/artist-genres"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="ArtistGenresIcon" cover stroke />
                      </span>
                    )}
                    Artist Genres
                  </NavLink>
                )}
                {menuShowAlbumGenres && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/album-genres"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="AlbumGenresIcon" cover stroke />
                      </span>
                    )}
                    Album Genres
                  </NavLink>
                )}
                {menuShowArtistMoods && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/artist-moods"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="ArtistMoodsIcon" cover stroke />
                      </span>
                    )}
                    Artist Moods
                  </NavLink>
                )}
                {menuShowAlbumMoods && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/album-moods"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="AlbumMoodsIcon" cover stroke />
                      </span>
                    )}
                    Album Moods
                  </NavLink>
                )}
                {menuShowArtistStyles && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/artist-styles"
                    draggable="false"
                  >
                    {menuShowIcons && (
                      <span className={style.icon}>
                        <Icon icon="ArtistStylesIcon" cover stroke />
                      </span>
                    )}
                    Artist Styles
                  </NavLink>
                )}
                {menuShowAlbumStyles && (
                  <NavLink
                    className={style.link}
                    activeClassName={style.linkActive}
                    to="/album-styles"
                    draggable="false"
                  >
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
                    draggable="false"
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
    </>
  );
};

const SearchField = () => {
  const dispatch = useDispatch();

  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const clearButtonRef = useRef(null);

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);

  const searchResults = useSelector(({ appModel }) => appModel.searchResults);
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const { libraryId } = currentLibrary;

  const focusOnInput = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.setSelectionRange(searchInputRef.current.value.length, searchInputRef.current.value.length);
  };

  // Focus first search result on enter
  useKeyControl('Enter', () => {
    if (document.activeElement === searchInputRef.current) {
      setSearchResultsVisible(true);
      setTimeout(function () {
        const firstLink = searchResultsRef.current?.querySelector('a');
        if (firstLink) {
          firstLink.focus();
        }
      }, 10);
    }
  });

  // Focus search input with keyboard shortcut
  useKeyControl('Command+F', focusOnInput, true);
  useKeyControl('Command+K', focusOnInput, true);

  // Blur search input on escape
  useKeyControl('Escape', () => {
    setSearchResultsVisible(false);
    searchInputRef.current?.blur();
  });

  // Clear search value when library changes
  useEffect(() => {
    setSearchValue('');
  }, [libraryId]);

  // Handle search value changes, with a debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Submit search value when the debounced value changes
  useEffect(() => {
    if (debouncedSearchValue && debouncedSearchValue.length > 1) {
      plex.searchLibrary(debouncedSearchValue);
      if (!searchResultsVisible) {
        setSearchResultsVisible(true);
      }
    } else {
      if (searchResultsVisible) {
        setSearchResultsVisible(false);
      }
      if (searchResults) {
        dispatch.appModel.setAppState({ searchResults: null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue]);

  return (
    <div className={style.search}>
      <RadixPopover.Root open={searchResultsVisible}>
        <RadixPopover.Anchor>
          <div className={style.searchInput}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onFocus={() => {
                if (searchValue && debouncedSearchValue && debouncedSearchValue.length > 1 && !searchResultsVisible) {
                  setSearchResultsVisible(true);
                }
              }}
            />
            <div className={style.searchIcon}>
              <Icon icon="SearchIcon" cover stroke />
            </div>
            {searchValue && (
              <button
                ref={clearButtonRef}
                className={style.crossIcon}
                // onFocus={() => {
                //   if (debouncedSearchValue && debouncedSearchValue.length > 1 && !searchResultsVisible) {
                //     setSearchResultsVisible(true);
                //   }
                // }}
                onClick={() => {
                  setSearchValue('');
                  setTimeout(function () {
                    focusOnInput();
                  }, 20);
                }}
              >
                <span>
                  <Icon icon="CrossSmallIcon" cover stroke />
                </span>
              </button>
            )}
          </div>
        </RadixPopover.Anchor>
        <RadixPopover.Portal>
          <RadixPopover.Content
            ref={searchResultsRef}
            className={style.searchPopover}
            side="right"
            sideOffset={26}
            collisionPadding={{
              top: 42,
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
            onEscapeKeyDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setSearchResultsVisible(false);
              focusOnInput();
            }}
            onFocusOutside={(event) => {
              if (
                (searchInputRef.current && searchInputRef.current?.contains(event.target)) ||
                (clearButtonRef.current && clearButtonRef.current?.contains(event.target))
              ) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              setSearchResultsVisible(false);
            }}
            onInteractOutside={(event) => {
              if (
                (searchInputRef.current && searchInputRef.current?.contains(event.target)) ||
                (clearButtonRef.current && clearButtonRef.current?.contains(event.target))
              ) {
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              setSearchResultsVisible(false);
            }}
          >
            <SearchResults setSearchResultsVisible={setSearchResultsVisible} />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
};

const SearchResults = ({ setSearchResultsVisible }) => {
  const dispatch = useDispatch();

  const searchResults = useSelector(({ appModel }) => appModel.searchResults);

  if (!searchResults) {
    return <div className={style.searchLoading}>Loading...</div>;
  }

  if (searchResults.length === 0) {
    return <div className={style.searchNoResults}>No results found</div>;
  }

  return (
    <div className={style.searchResults}>
      {searchResults.map((result, index) => {
        return (
          <NavLink
            key={index}
            className={style.searchEntry}
            to={result.link}
            onClick={() => {
              setSearchResultsVisible(false);
              if (result.type === 'track') {
                dispatch.appModel.setAppState({ scrollToTrack: result.trackId });
              }
            }}
            draggable="false"
          >
            <div className={style.searchTypeIcon}>
              <Icon icon={result.icon} cover stroke />
            </div>
            <div className={style.searchThumb}>
              <img src={result.thumb} alt={result.title} draggable="false" loading="lazy" />
            </div>
            <div>
              <div className={style.searchTitle}>{result.title}</div>
              <div className={style.searchType}>{result.type}</div>
            </div>
          </NavLink>
        );
      })}
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SideBar;
