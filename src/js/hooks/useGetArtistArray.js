import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetArtistArray = ({ variant }) => {
  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel.orderArtists);

  const gridArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistsUserRating);
  const gridArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridArtistsIsFavourite);

  const colArtistsCountry = useSelector(({ sessionModel }) => sessionModel.colArtistsCountry);
  const colArtistsGenre = useSelector(({ sessionModel }) => sessionModel.colArtistsGenre);
  const colArtistsAddedAt = useSelector(({ sessionModel }) => sessionModel.colArtistsAddedAt);
  const colArtistsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colArtistsLastPlayed);
  const colArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistsUserRating);
  const colArtistsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colArtistsIsFavourite);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    addedAt: viewArtists === 'grid' || (viewArtists === 'list' && colArtistsAddedAt),
    country: platformOpts.enableCountry && viewArtists === 'list' && colArtistsCountry,
    lastPlayed: viewArtists === 'grid' || (viewArtists === 'list' && colArtistsLastPlayed),
    genre: viewArtists === 'list' && colArtistsGenre,
    userRating:
      platformOpts.enableUserRating && (viewArtists === 'grid' || (viewArtists === 'list' && colArtistsUserRating)),
    isFavourite:
      platformOpts.enableIsFavourite && (viewArtists === 'grid' || (viewArtists === 'list' && colArtistsIsFavourite)),
  };
  const actualSortArtists = allowedSort[sortArtists] ? sortArtists : 'title';
  const actualOrderArtists = allowedSort[sortArtists] ? orderArtists : 'asc';

  const haveGotAllArtists = useSelector(({ appModel }) => appModel[`haveGotAll${variant}`]);
  const allArtists = useSelector(({ appModel }) => appModel[`all${variant}`])?.filter(
    (artist) => artist.libraryId === currentLibraryId && !artist.error404 && !artist.isExtra
  );
  const sortedArtists =
    haveGotAllArtists && allArtists
      ? sortList({
          entries: allArtists,
          options: actualSortArtists,
          direction: actualOrderArtists,
          sortNumbersFirst: optionSortNumbersFirst,
          ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
        })
      : null;

  const setViewArtists = (viewArtists) => {
    dispatch.sessionModel.setSessionState({
      viewArtists,
    });
  };

  const setSortArtists = (sortArtists) => {
    dispatch.sessionModel.setSessionState({
      sortArtists,
    });
  };

  const setOrderArtists = (orderArtists) => {
    dispatch.sessionModel.setSessionState({
      sortArtists: actualSortArtists,
      orderArtists,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    if (variant === 'Artists') {
      bridge.getAllArtists();
    } else if (variant === 'AlbumArtists') {
      bridge.getAllAlbumArtists();
    }
  }, [variant]);

  return {
    viewArtists,
    sortArtists: actualSortArtists,
    orderArtists: actualOrderArtists,

    gridOptions: {
      userRating: platformOpts.enableUserRating && gridArtistsUserRating,
      isFavourite: platformOpts.enableIsFavourite && gridArtistsIsFavourite,
    },

    colOptions: {
      country: platformOpts.enableCountry && colArtistsCountry,
      genre: colArtistsGenre,
      addedAt: colArtistsAddedAt,
      lastPlayed: colArtistsLastPlayed,
      userRating: platformOpts.enableUserRating && colArtistsUserRating,
      isFavourite: platformOpts.enableIsFavourite && colArtistsIsFavourite,
    },

    setViewArtists,
    setSortArtists,
    setOrderArtists,
    setColumnVisibility,

    sortedArtists,
  };
};

export default useGetArtistArray;
