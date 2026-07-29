// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FormTabButtons, Icon, SettingsList } from 'js/components';
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
      <SortSettings />
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
      {(platformOpts.enableUserRating || debug) && <RatingSettings />}
    </>
  );
};

//
// SORTING
//

const SortSettings = () => {
  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  const menuItems = [
    {
      key: 'optionSortNumbersFirst',
      label: 'Sort with numbers on top.',
      description: 'When sorting alphabetically, put entries that start with a number at the top of the list.',
      state: optionSortNumbersFirst,
    },
    {
      key: 'optionSortIgnoreLeadingArticles',
      label: 'Ignore "a", "an" and "the" when sorting.',
      description:
        'When sorting alphabetically, ignore leading prefixes like "A", "An", and "The" at the start of titles.',
      state: optionSortIgnoreLeadingArticles,
    },
  ];

  return <SettingsList title="Sorting" menuItems={menuItems} />;
};

//
// VIEW MODES
//

const ViewModeSettings = () => {
  const dispatch = useDispatch();

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const viewAlbumArtists = useSelector(({ sessionModel }) => sessionModel.viewAlbumArtists);
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
    viewAlbumArtists,
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
      viewAlbumArtists: 'grid',
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
      viewAlbumArtists: 'list',
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
          </div>
          <div className={style.description}>
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
  const gridAlbumArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridAlbumArtistsIsFavourite);
  const gridArtistAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridArtistAlbumsIsFavourite);
  const gridArtistCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsIsFavourite
  );
  const gridArtistTagItemsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridArtistTagItemsIsFavourite);
  const gridAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridAlbumsIsFavourite);
  const gridAlbumCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsIsFavourite
  );
  const gridAlbumTagItemsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridAlbumTagItemsIsFavourite);
  const gridPlaylistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridPlaylistsIsFavourite);

  const colArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistsIsFavourite);
  const colAlbumArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumArtistsIsFavourite);
  const colArtistAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsIsFavourite);
  const colArtistTracksIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistTracksIsFavourite);
  const colAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumsIsFavourite);
  const colAlbumIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumIsFavourite);
  const colPlaylistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colPlaylistsIsFavourite);
  const colPlaylistIsFavourite = useSelector(({ sessionModel }) => sessionModel.colPlaylistIsFavourite);
  const colArtistCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.colArtistCollectionItemsIsFavourite
  );
  const colArtistTagItemsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistTagItemsIsFavourite);
  const colAlbumCollectionItemsIsFavourite = useSelector(
    ({ sessionModel }) => sessionModel.colAlbumCollectionItemsIsFavourite
  );
  const colAlbumTagItemsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumTagItemsIsFavourite);

  const controlBarIsFavourite = useSelector(({ sessionModel }) => sessionModel.controlBarIsFavourite);
  const queueIsFavourite = useSelector(({ sessionModel }) => sessionModel.queueIsFavourite);
  const fullPageIsFavourite = useSelector(({ sessionModel }) => sessionModel.fullPageIsFavourite);

  const allValues = [
    gridArtistsIsFavourite,
    gridAlbumArtistsIsFavourite,
    gridArtistAlbumsIsFavourite,
    gridArtistCollectionItemsIsFavourite,
    gridArtistTagItemsIsFavourite,
    gridAlbumsIsFavourite,
    gridAlbumCollectionItemsIsFavourite,
    gridAlbumTagItemsIsFavourite,
    gridPlaylistsIsFavourite,

    colArtistsIsFavourite,
    colAlbumArtistsIsFavourite,
    colArtistAlbumsIsFavourite,
    colArtistTracksIsFavourite,
    colAlbumsIsFavourite,
    colAlbumIsFavourite,
    colPlaylistsIsFavourite,
    colPlaylistIsFavourite,
    colArtistCollectionItemsIsFavourite,
    colArtistTagItemsIsFavourite,
    colAlbumCollectionItemsIsFavourite,
    colAlbumTagItemsIsFavourite,

    controlBarIsFavourite,
    queueIsFavourite,
    fullPageIsFavourite,
  ];

  const firstValue = allValues[0];
  const allSame = allValues.every((value) => value === firstValue);

  const toggleShowFavourites = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsIsFavourite: true,
      gridAlbumArtistsIsFavourite: true,
      gridArtistAlbumsIsFavourite: true,
      gridArtistCollectionItemsIsFavourite: true,
      gridArtistTagItemsIsFavourite: true,
      gridAlbumsIsFavourite: true,
      gridAlbumCollectionItemsIsFavourite: true,
      gridAlbumTagItemsIsFavourite: true,
      gridPlaylistsIsFavourite: true,

      colArtistsIsFavourite: true,
      colAlbumArtistsIsFavourite: true,
      colArtistAlbumsIsFavourite: true,
      colArtistTracksIsFavourite: true,
      colAlbumsIsFavourite: true,
      colAlbumIsFavourite: true,
      colPlaylistsIsFavourite: true,
      colPlaylistIsFavourite: true,
      colArtistCollectionItemsIsFavourite: true,
      colArtistTagItemsIsFavourite: true,
      colAlbumCollectionItemsIsFavourite: true,
      colAlbumTagItemsIsFavourite: true,

      controlBarIsFavourite: true,
      queueIsFavourite: true,
      fullPageIsFavourite: true,
    });
  };

  const toggleHideFavourites = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsIsFavourite: false,
      gridAlbumArtistsIsFavourite: false,
      gridArtistAlbumsIsFavourite: false,
      gridArtistCollectionItemsIsFavourite: false,
      gridArtistTagItemsIsFavourite: false,
      gridAlbumsIsFavourite: false,
      gridAlbumCollectionItemsIsFavourite: false,
      gridAlbumTagItemsIsFavourite: false,
      gridPlaylistsIsFavourite: false,

      colArtistsIsFavourite: false,
      colAlbumArtistsIsFavourite: false,
      colArtistAlbumsIsFavourite: false,
      colArtistTracksIsFavourite: false,
      colAlbumsIsFavourite: false,
      colAlbumIsFavourite: false,
      colPlaylistsIsFavourite: false,
      colPlaylistIsFavourite: false,
      colArtistCollectionItemsIsFavourite: false,
      colArtistTagItemsIsFavourite: false,
      colAlbumCollectionItemsIsFavourite: false,
      colAlbumTagItemsIsFavourite: false,

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
          </div>
          <div className={style.description}>
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
  const gridAlbumArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumArtistsUserRating);
  const gridArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistAlbumsUserRating);
  const gridArtistCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionItemsUserRating
  );
  const gridArtistTagItemsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistTagItemsUserRating);
  const gridAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumsUserRating);
  const gridAlbumCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridAlbumCollectionItemsUserRating
  );
  const gridAlbumTagItemsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumTagItemsUserRating);
  const gridPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridPlaylistsUserRating);
  const gridArtistCollectionsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.gridArtistCollectionsUserRating
  );
  const gridAlbumCollectionsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumCollectionsUserRating);

  const colArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistsUserRating);
  const colAlbumArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumArtistsUserRating);
  const colArtistAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistAlbumsUserRating);
  const colArtistTracksUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistTracksUserRating);
  const colAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsUserRating);
  const colAlbumUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumUserRating);
  const colPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistsUserRating);
  const colPlaylistUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistUserRating);
  const colArtistCollectionsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistCollectionsUserRating);
  const colAlbumCollectionsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumCollectionsUserRating);
  const colArtistCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.colArtistCollectionItemsUserRating
  );
  const colArtistTagItemsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistTagItemsUserRating);
  const colAlbumCollectionItemsUserRating = useSelector(
    ({ sessionModel }) => sessionModel.colAlbumCollectionItemsUserRating
  );
  const colAlbumTagItemsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumTagItemsUserRating);

  const controlBarUserRating = useSelector(({ sessionModel }) => sessionModel.controlBarUserRating);
  const queueUserRating = useSelector(({ sessionModel }) => sessionModel.queueUserRating);
  const fullPageUserRating = useSelector(({ sessionModel }) => sessionModel.fullPageUserRating);

  const allValues = [
    gridArtistsUserRating,
    gridAlbumArtistsUserRating,
    gridArtistAlbumsUserRating,
    gridArtistCollectionItemsUserRating,
    gridArtistTagItemsUserRating,
    gridAlbumsUserRating,
    gridAlbumCollectionItemsUserRating,
    gridAlbumTagItemsUserRating,
    gridPlaylistsUserRating,
    gridArtistCollectionsUserRating,
    gridAlbumCollectionsUserRating,

    colArtistsUserRating,
    colAlbumArtistsUserRating,
    colArtistAlbumsUserRating,
    colArtistTracksUserRating,
    colAlbumsUserRating,
    colAlbumUserRating,
    colPlaylistsUserRating,
    colPlaylistUserRating,
    colArtistCollectionsUserRating,
    colAlbumCollectionsUserRating,
    colArtistCollectionItemsUserRating,
    colArtistTagItemsUserRating,
    colAlbumCollectionItemsUserRating,
    colAlbumTagItemsUserRating,

    controlBarUserRating,
    queueUserRating,
    fullPageUserRating,
  ];

  const firstValue = allValues[0];
  const allSame = allValues.every((value) => value === firstValue);

  const toggleShowUserRating = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsUserRating: true,
      gridAlbumArtistsUserRating: true,
      gridArtistAlbumsUserRating: true,
      gridArtistCollectionItemsUserRating: true,
      gridArtistTagItemsUserRating: true,
      gridAlbumsUserRating: true,
      gridAlbumCollectionItemsUserRating: true,
      gridAlbumTagItemsUserRating: true,
      gridPlaylistsUserRating: true,
      gridArtistCollectionsUserRating: true,
      gridAlbumCollectionsUserRating: true,

      colArtistsUserRating: true,
      colAlbumArtistsUserRating: true,
      colArtistAlbumsUserRating: true,
      colArtistTracksUserRating: true,
      colAlbumsUserRating: true,
      colAlbumUserRating: true,
      colPlaylistsUserRating: true,
      colPlaylistUserRating: true,
      colArtistCollectionsUserRating: true,
      colAlbumCollectionsUserRating: true,
      colArtistCollectionItemsUserRating: true,
      colArtistTagItemsUserRating: true,
      colAlbumCollectionItemsUserRating: true,
      colAlbumTagItemsUserRating: true,

      controlBarUserRating: true,
      queueUserRating: true,
      fullPageUserRating: true,
    });
  };

  const toggleHideUserRating = () => {
    dispatch.sessionModel.setSessionState({
      gridArtistsUserRating: false,
      gridAlbumArtistsUserRating: false,
      gridArtistAlbumsUserRating: false,
      gridArtistCollectionItemsUserRating: false,
      gridArtistTagItemsUserRating: false,
      gridAlbumsUserRating: false,
      gridAlbumCollectionItemsUserRating: false,
      gridAlbumTagItemsUserRating: false,
      gridPlaylistsUserRating: false,
      gridArtistCollectionsUserRating: false,
      gridAlbumCollectionsUserRating: false,

      colArtistsUserRating: false,
      colAlbumArtistsUserRating: false,
      colArtistAlbumsUserRating: false,
      colArtistTracksUserRating: false,
      colAlbumsUserRating: false,
      colAlbumUserRating: false,
      colPlaylistsUserRating: false,
      colPlaylistUserRating: false,
      colArtistCollectionsUserRating: false,
      colAlbumCollectionsUserRating: false,
      colArtistCollectionItemsUserRating: false,
      colArtistTagItemsUserRating: false,
      colAlbumCollectionItemsUserRating: false,
      colAlbumTagItemsUserRating: false,

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
          </div>
          <div className={style.description}>
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

//
// RATINGS
//

const RatingSettings = () => {
  const optionUseHalfStars = useSelector(({ sessionModel }) => sessionModel.optionUseHalfStars);

  const menuItems = [
    {
      key: 'optionUseHalfStars',
      label: 'Use half stars in ratings.',
      description: 'Enable to allow setting half-star ratings. Disable to set whole stars only.',
      state: optionUseHalfStars,
    },
  ];

  return <SettingsList title="Rating System" menuItems={menuItems} />;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsBrowse;
