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
            You can already toggle between grid view and list view when browsing any section of your library, but if you
            want to quickly toggle ALL sections at once you can use the buttons below.
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
// USER INTERFACE
//

const UserInterfaceSettings = () => {
  const dispatch = useDispatch();

  // const optionShowFullTitles_Deprecated = useSelector(({ sessionModel }) => sessionModel.optionShowFullTitles_Deprecated);
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const menuItems = [
    { key: 'optionShowStarRatings', label: 'Show star ratings', state: optionShowStarRatings },
    {
      key: 'optionShowFullTitles_Deprecated',
      label: 'Always show full track, artist and album titles',
      description: 'Sorry, this option has been removed for performance reasons.',
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
