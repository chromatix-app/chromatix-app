// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FormTabButtons, Icon } from 'js/components';
import platformFeatures from 'js/_config/platformFeatures';

import style from './SettingsBrowse.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

export const SettingsBrowse = ({ debug }) => {
  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  return (
    <>
      <div className="settingsGroup">
        <div className={style.title}>View Modes</div>
        <ViewModeSettings />
      </div>
      {(platformOpts.enableIsFavourite || debug) && (
        <div className="settingsGroup">
          <div className={style.title}>Favourites</div>
          <FavouriteSettings />
        </div>
      )}
      {(platformOpts.enableUserRating || debug) && (
        <div className="settingsGroup">
          <div className={style.title}>Star Ratings</div>
          <StarRatingSettings />
        </div>
      )}
    </>
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
  const viewArtistTags = useSelector(({ sessionModel }) => sessionModel.viewArtistTags);
  const viewArtistTagItems = useSelector(({ sessionModel }) => sessionModel.viewArtistTagItems);
  const viewAlbumTags = useSelector(({ sessionModel }) => sessionModel.viewAlbumTags);
  const viewAlbumTagItems = useSelector(({ sessionModel }) => sessionModel.viewAlbumTagItems);

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
    viewArtistTags,
    viewArtistTagItems,
    viewAlbumTags,
    viewAlbumTagItems,
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
      viewArtistTags: 'grid',
      viewArtistTagItems: 'grid',
      viewAlbumTags: 'grid',
      viewAlbumTagItems: 'grid',
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
      viewArtistTags: 'list',
      viewArtistTagItems: 'list',
      viewAlbumTags: 'list',
      viewAlbumTagItems: 'list',
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
          <div className="mt-15"></div>
          <FormTabButtons
            tabs={[
              {
                label: 'Grid view',
                icon: <Icon icon="GridIcon" cover strokeAndFill />,
                onClick: toggleGridView,
                active: allSame && firstValue === 'grid',
              },
              {
                label: 'List view',
                icon: <Icon icon="ListIcon" cover stroke />,
                onClick: toggleListView,
                active: allSame && firstValue === 'list',
              },
              {
                label: 'Mixed',
                icon: <Icon icon="VanishedCircleIcon" cover stroke />,
                active: !allSame,
                disabled: true,
                renderDisabled: false,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

//
// FAVOURITES
//

const FavouriteSettings = () => {
  const dispatch = useDispatch();

  const gridArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridArtistsIsFavourite);
  const gridArtistAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridArtistAlbumsIsFavourite);
  const gridArtistCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsIsFavourite
  );
  const gridAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridAlbumsIsFavourite);
  const gridAlbumCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsIsFavourite
  );
  const gridPlaylistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridPlaylistsIsFavourite);

  const colArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistsIsFavourite);
  const colArtistAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsIsFavourite);
  const colArtistTracksIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistTracksIsFavourite);
  const colAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumsIsFavourite);
  const colAlbumIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumIsFavourite);
  const colPlaylistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colPlaylistsIsFavourite);
  const colPlaylistIsFavourite = useSelector(({ sessionModel }) => sessionModel.colPlaylistIsFavourite);
  const colCollectionArtistsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.colCollectionArtistsIsFavourite
  );
  const colCollectionAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsIsFavourite);

  const controlBarIsFavourite = useSelector(({ sessionModel }) => sessionModel.controlBarIsFavourite);
  const queueIsFavourite = useSelector(({ sessionModel }) => sessionModel.queueIsFavourite);
  const fullPageIsFavourite = useSelector(({ sessionModel }) => sessionModel.fullPageIsFavourite);

  const allValues = [
    gridArtistsIsFavourite,
    gridArtistAlbumsIsFavourite,
    gridArtistCollectionItemsIsFavourite,
    gridAlbumsIsFavourite,
    gridAlbumCollectionItemsIsFavourite,
    gridPlaylistsIsFavourite,

    colArtistsIsFavourite,
    colArtistAlbumsIsFavourite,
    colArtistTracksIsFavourite,
    colAlbumsIsFavourite,
    colAlbumIsFavourite,
    colPlaylistsIsFavourite,
    colPlaylistIsFavourite,
    colCollectionArtistsIsFavourite,
    colCollectionAlbumsIsFavourite,

    controlBarIsFavourite,
    queueIsFavourite,
    fullPageIsFavourite,
  ];

  const firstValue = allValues[0];
  const allSame = allValues.every((value) => value === firstValue);

  const toggleShowFavourites = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsIsFavourite: true,
      gridArtistAlbumsIsFavourite: true,
      gridArtistCollectionItemsIsFavourite: true,
      gridAlbumsIsFavourite: true,
      gridAlbumCollectionItemsIsFavourite: true,
      gridPlaylistsIsFavourite: true,

      colArtistsIsFavourite: true,
      colArtistAlbumsIsFavourite: true,
      colArtistTracksIsFavourite: true,
      colAlbumsIsFavourite: true,
      colAlbumIsFavourite: true,
      colPlaylistsIsFavourite: true,
      colPlaylistIsFavourite: true,
      colCollectionArtistsIsFavourite: true,
      colCollectionAlbumsIsFavourite: true,

      controlBarIsFavourite: true,
      queueIsFavourite: true,
      fullPageIsFavourite: true,
    });
  };

  const toggleHideFavourites = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsIsFavourite: false,
      gridArtistAlbumsIsFavourite: false,
      gridArtistCollectionItemsIsFavourite: false,
      gridAlbumsIsFavourite: false,
      gridAlbumCollectionItemsIsFavourite: false,
      gridPlaylistsIsFavourite: false,

      colArtistsIsFavourite: false,
      colArtistAlbumsIsFavourite: false,
      colArtistTracksIsFavourite: false,
      colAlbumsIsFavourite: false,
      colAlbumIsFavourite: false,
      colPlaylistsIsFavourite: false,
      colPlaylistIsFavourite: false,
      colCollectionArtistsIsFavourite: false,
      colCollectionAlbumsIsFavourite: false,

      controlBarIsFavourite: false,
      queueIsFavourite: false,
      fullPageIsFavourite: false,
    });
  };

  return (
    <div className={style.menu}>
      <div className={style.menuEntry}>
        <div>
          <div className={style.label}>
            Quickly toggle the visibility of favourites for all sections of your library.
            <br />
            Note that you can independently toggle the visibility of favourites within each individual section of your
            library.
          </div>
          <div className="mt-15"></div>
          <FormTabButtons
            tabs={[
              {
                label: 'Visible',
                icon: <Icon icon="HeartIcon" cover strokeAndFill />,
                onClick: toggleShowFavourites,
                active: allSame && firstValue === true,
              },
              {
                label: 'Hidden',
                icon: <Icon icon="HeartIcon" cover stroke />,
                onClick: toggleHideFavourites,
                active: allSame && firstValue === false,
              },
              {
                label: 'Mixed',
                icon: <Icon icon="VanishedCircleIcon" cover stroke />,
                active: !allSame,
                disabled: true,
                renderDisabled: false,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

//
// STAR RATINGS
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
  const colArtistTracksUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistTracksUserRating);
  const colAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsUserRating);
  const colAlbumUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumUserRating);
  const colPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistsUserRating);
  const colPlaylistUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistUserRating);
  const colCollectionUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionUserRating);
  const colCollectionArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionArtistsUserRating);
  const colCollectionAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionAlbumsUserRating);

  const controlBarUserRating = useSelector(({ sessionModel }) => sessionModel.controlBarUserRating);
  const queueUserRating = useSelector(({ sessionModel }) => sessionModel.queueUserRating);
  const fullPageUserRating = useSelector(({ sessionModel }) => sessionModel.fullPageUserRating);

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
    colArtistTracksUserRating,
    colAlbumsUserRating,
    colAlbumUserRating,
    colPlaylistsUserRating,
    colPlaylistUserRating,
    colCollectionUserRating,
    colCollectionArtistsUserRating,
    colCollectionAlbumsUserRating,

    controlBarUserRating,
    queueUserRating,
    fullPageUserRating,
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
      colArtistTracksUserRating: true,
      colAlbumsUserRating: true,
      colAlbumUserRating: true,
      colPlaylistsUserRating: true,
      colPlaylistUserRating: true,
      colCollectionUserRating: true,
      colCollectionArtistsUserRating: true,
      colCollectionAlbumsUserRating: true,

      controlBarUserRating: true,
      queueUserRating: true,
      fullPageUserRating: true,
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
      colArtistTracksUserRating: false,
      colAlbumsUserRating: false,
      colAlbumUserRating: false,
      colPlaylistsUserRating: false,
      colPlaylistUserRating: false,
      colCollectionUserRating: false,
      colCollectionArtistsUserRating: false,
      colCollectionAlbumsUserRating: false,

      controlBarUserRating: false,
      queueUserRating: false,
      fullPageUserRating: false,
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
          <div className="mt-15"></div>
          <FormTabButtons
            tabs={[
              {
                label: 'Visible',
                icon: <Icon icon="StarFullIcon" cover strokeAndFill />,
                onClick: toggleShowUserRating,
                active: allSame && firstValue === true,
              },
              {
                label: 'Hidden',
                icon: <Icon icon="StarFullIcon" cover stroke />,
                onClick: toggleHideUserRating,
                active: allSame && firstValue === false,
              },
              {
                label: 'Mixed',
                icon: <Icon icon="VanishedCircleIcon" cover stroke />,
                active: !allSame,
                disabled: true,
                renderDisabled: false,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsBrowse;
