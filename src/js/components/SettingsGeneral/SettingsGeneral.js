// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';

import { Button } from 'js/components';

import style from './SettingsGeneral.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsGeneral = () => {
  return (
    <div className={style.wrap}>
      <div className={style.group}>
        <div className={style.title}>View Modes</div>
        <ViewModeSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Star Ratings</div>
        <StarRatingSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>User Interface</div>
        <UserInterfaceSettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Accessibility</div>
        <AccessibilitySettings />
      </div>
      <div className={style.group}>
        <div className={style.title}>Plex</div>
        <PlexSettings />
      </div>
    </div>
  );
};

//
// VIEW MODES
//

const ViewModeSettings = () => {
  const dispatch = useDispatch();

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const viewArtistAlbums = useSelector(({ sessionModel }) => sessionModel.viewArtistAlbums);
  const viewAlbums = useSelector(({ sessionModel }) => sessionModel.viewAlbums);
  const viewFolders = useSelector(({ sessionModel }) => sessionModel.viewFolders);
  const viewPlaylists = useSelector(({ sessionModel }) => sessionModel.viewPlaylists);
  const viewArtistCollections = useSelector(({ sessionModel }) => sessionModel.viewArtistCollections);
  const viewArtistCollectionItems = useSelector(({ sessionModel }) => sessionModel.viewArtistCollectionItems);
  const viewAlbumCollections = useSelector(({ sessionModel }) => sessionModel.viewAlbumCollections);
  const viewAlbumCollectionItems = useSelector(({ sessionModel }) => sessionModel.viewAlbumCollectionItems);
  const viewArtistGenres = useSelector(({ sessionModel }) => sessionModel.viewArtistGenres);
  const viewArtistGenreItems = useSelector(({ sessionModel }) => sessionModel.viewArtistGenreItems);
  const viewAlbumGenres = useSelector(({ sessionModel }) => sessionModel.viewAlbumGenres);
  const viewAlbumGenreItems = useSelector(({ sessionModel }) => sessionModel.viewAlbumGenreItems);
  const viewArtistMoods = useSelector(({ sessionModel }) => sessionModel.viewArtistMoods);
  const viewArtistMoodItems = useSelector(({ sessionModel }) => sessionModel.viewArtistMoodItems);
  const viewAlbumMoods = useSelector(({ sessionModel }) => sessionModel.viewAlbumMoods);
  const viewAlbumMoodItems = useSelector(({ sessionModel }) => sessionModel.viewAlbumMoodItems);
  const viewArtistStyles = useSelector(({ sessionModel }) => sessionModel.viewArtistStyles);
  const viewArtistStyleItems = useSelector(({ sessionModel }) => sessionModel.viewArtistStyleItems);
  const viewAlbumStyles = useSelector(({ sessionModel }) => sessionModel.viewAlbumStyles);
  const viewAlbumStyleItems = useSelector(({ sessionModel }) => sessionModel.viewAlbumStyleItems);

  const allValues = [
    viewArtists,
    viewArtistAlbums,
    viewAlbums,
    viewFolders,
    viewPlaylists,
    viewArtistCollections,
    viewArtistCollectionItems,
    viewAlbumCollections,
    viewAlbumCollectionItems,
    viewArtistGenres,
    viewArtistGenreItems,
    viewAlbumGenres,
    viewAlbumGenreItems,
    viewArtistMoods,
    viewArtistMoodItems,
    viewAlbumMoods,
    viewAlbumMoodItems,
    viewArtistStyles,
    viewArtistStyleItems,
    viewAlbumStyles,
    viewAlbumStyleItems,
  ];

  const firstValue = allValues[0];
  const allSame = allValues.every((value) => value === firstValue);

  const toggleGridView = () => {
    dispatch.sessionModel.setSessionState({
      viewArtists: 'grid',
      viewArtistAlbums: 'grid',
      viewAlbums: 'grid',
      viewFolders: 'grid',
      viewPlaylists: 'grid',
      viewArtistCollections: 'grid',
      viewArtistCollectionItems: 'grid',
      viewAlbumCollections: 'grid',
      viewAlbumCollectionItems: 'grid',
      viewArtistGenres: 'grid',
      viewArtistGenreItems: 'grid',
      viewAlbumGenres: 'grid',
      viewAlbumGenreItems: 'grid',
      viewArtistMoods: 'grid',
      viewArtistMoodItems: 'grid',
      viewAlbumMoods: 'grid',
      viewAlbumMoodItems: 'grid',
      viewArtistStyles: 'grid',
      viewArtistStyleItems: 'grid',
      viewAlbumStyles: 'grid',
      viewAlbumStyleItems: 'grid',
    });
  };

  const toggleListView = () => {
    dispatch.sessionModel.setSessionState({
      viewArtists: 'list',
      viewArtistAlbums: 'list',
      viewAlbums: 'list',
      viewFolders: 'list',
      viewPlaylists: 'list',
      viewArtistCollections: 'list',
      viewArtistCollectionItems: 'list',
      viewAlbumCollections: 'list',
      viewAlbumCollectionItems: 'list',
      viewArtistGenres: 'list',
      viewArtistGenreItems: 'list',
      viewAlbumGenres: 'list',
      viewAlbumGenreItems: 'list',
      viewArtistMoods: 'list',
      viewArtistMoodItems: 'list',
      viewAlbumMoods: 'list',
      viewAlbumMoodItems: 'list',
      viewArtistStyles: 'list',
      viewArtistStyleItems: 'list',
      viewAlbumStyles: 'list',
      viewAlbumStyleItems: 'list',
    });
  };

  return (
    <div className={style.menu}>
      <div className={style.menuEntry}>
        <div>
          <div className={style.label}>
            Quickly toggle between grid view and list view for all sections of your library.
            <br />
            Note that you can independently toggle the view mode within each individual section of your library.
          </div>
          <div className={style.buttons}>
            <Button
              variant="smallBtn"
              inline
              wrap={false}
              onClick={toggleGridView}
              disabled={allSame && firstValue === 'grid'}
            >
              Use grid view everywhere
            </Button>
            <Button
              variant="smallBtn"
              inline
              wrap={false}
              onClick={toggleListView}
              disabled={allSame && firstValue === 'list'}
            >
              Use list view everywhere
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

//
// VIEW MODES
//

const StarRatingSettings = () => {
  const dispatch = useDispatch();

  const gridArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistsUserRating);
  const gridArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistAlbumsUserRating);
  const gridArtistCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsUserRating
  );
  const gridAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumsUserRating);
  const gridAlbumCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsUserRating
  );
  const gridPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridPlaylistsUserRating);
  const gridCollectionsUserRating = useSelector(({ sessionModel }) => sessionModel.gridCollectionsUserRating);

  const colArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistsUserRating);
  const colArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsUserRating);
  const colAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsUserRating);
  const colAlbumUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumUserRating);
  const colPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistsUserRating);
  const colPlaylistUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistUserRating);
  const colCollectionUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionUserRating);
  const colCollectionArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsUserRating);
  const colCollectionAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsUserRating);

  const allValues = [
    gridArtistsUserRating,
    gridArtistAlbumsUserRating,
    gridArtistCollectionItemsUserRating,
    gridAlbumsUserRating,
    gridAlbumCollectionItemsUserRating,
    gridPlaylistsUserRating,
    gridCollectionsUserRating,

    colArtistsUserRating,
    colArtistAlbumsUserRating,
    colAlbumsUserRating,
    colAlbumUserRating,
    colPlaylistsUserRating,
    colPlaylistUserRating,
    colCollectionUserRating,
    colCollectionArtistsUserRating,
    colCollectionAlbumsUserRating,
  ];

  const firstValue = allValues[0];
  const allSame = allValues.every((value) => value === firstValue);

  const toggleShowUserRating = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsUserRating: true,
      gridArtistAlbumsUserRating: true,
      gridArtistCollectionItemsUserRating: true,
      gridAlbumsUserRating: true,
      gridAlbumCollectionItemsUserRating: true,
      gridPlaylistsUserRating: true,
      gridCollectionsUserRating: true,

      colArtistsUserRating: true,
      colArtistAlbumsUserRating: true,
      colAlbumsUserRating: true,
      colAlbumUserRating: true,
      colPlaylistsUserRating: true,
      colPlaylistUserRating: true,
      colCollectionUserRating: true,
      colCollectionArtistsUserRating: true,
      colCollectionAlbumsUserRating: true,
    });
  };

  const toggleHideUserRating = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsUserRating: false,
      gridArtistAlbumsUserRating: false,
      gridArtistCollectionItemsUserRating: false,
      gridAlbumsUserRating: false,
      gridAlbumCollectionItemsUserRating: false,
      gridPlaylistsUserRating: false,
      gridCollectionsUserRating: false,

      colArtistsUserRating: false,
      colArtistAlbumsUserRating: false,
      colAlbumsUserRating: false,
      colAlbumUserRating: false,
      colPlaylistsUserRating: false,
      colPlaylistUserRating: false,
      colCollectionUserRating: false,
      colCollectionArtistsUserRating: false,
      colCollectionAlbumsUserRating: false,
    });
  };

  return (
    <div className={style.menu}>
      <div className={style.menuEntry}>
        <div>
          <div className={style.label}>
            Quickly toggle the visibility of star ratings for all sections of your library.
            <br />
            Note that you can independently toggle the visibility of star ratings within each individual section of your
            library.
          </div>
          <div className={style.buttons}>
            <Button
              variant="smallBtn"
              inline
              wrap={false}
              onClick={toggleShowUserRating}
              disabled={allSame && firstValue === true}
            >
              Show star ratings everywhere
            </Button>
            <Button
              variant="smallBtn"
              inline
              wrap={false}
              onClick={toggleHideUserRating}
              disabled={allSame && firstValue === false}
            >
              Hide star ratings everywhere
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

//
// USER INTERFACE
//

const UserInterfaceSettings = () => {
  const dispatch = useDispatch();

  // const optionShowFullTitles_Deprecated = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles_Deprecated);
  // const optionShowStarRatings_Deprecated = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings_Deprecated);

  const menuItems = [
    {
      key: 'optionShowStarRatings_Deprecated',
      label: 'Show star ratings',
      description:
        'This option has now been moved into each individual section of your library for more granular control.',
      state: false,
      disabled: true,
    },
    {
      key: 'optionShowFullTitles_Deprecated',
      label: 'Always show full track, artist and album titles',
      description: 'Sorry, this option has now been removed for performance reasons.',
      state: false,
      disabled: true,
    },
  ];

  return (
    <div className={style.menu}>
      {menuItems.map(({ key, label, description, state, disabled }) => (
        <div key={key} className={style.menuEntry}>
          <label>
            <input
              type="checkbox"
              checked={state}
              onChange={() => dispatch.sessionModel.setSessionState({ [key]: !state })}
              disabled={disabled}
            />
            <div>
              {label && <div className={clsx(style.label, disabled && style.disabled)}>{label}</div>}
              {description && <div className={style.description}>{description}</div>}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

//
// ACCESSIBILITY
//

const AccessibilitySettings = () => {
  const dispatch = useDispatch();

  const accessibilityFocus = useSelector(({ sessionModel }) => sessionModel.accessibilityFocus);

  const menuItems = [
    {
      key: 'accessibilityFocus',
      label: 'Highlight focused elements',
      description:
        'When enabled, elements such as buttons, links, and form controls are highlighted when focused. For example, when using the keyboard to navigate the interface.',
      state: accessibilityFocus,
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
// PLEX
//

const PlexSettings = () => {
  const dispatch = useDispatch();

  const optionLogPlexPlayback = useSelector(({ sessionModel }) => sessionModel.optionLogPlexPlayback);

  const menuItems = [
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

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsGeneral;
