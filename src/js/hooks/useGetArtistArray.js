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

  // [NOTE] variant is 'Artists' or 'AlbumArtists', which matches the suffix used by this view's session state keys
  const viewArtists = useSelector(({ sessionModel }) => sessionModel[`view${variant}`]);
  const sortArtists = useSelector(({ sessionModel }) => sessionModel[`sort${variant}`]);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel[`order${variant}`]);

  const gridUserRating = useSelector(({ sessionModel }) => sessionModel[`grid${variant}UserRating`]);
  const gridIsFavourite = useSelector(({ sessionModel }) => sessionModel[`grid${variant}IsFavourite`]);

  const colCountry = useSelector(({ sessionModel }) => sessionModel[`col${variant}Country`]);
  const colGenre = useSelector(({ sessionModel }) => sessionModel[`col${variant}Genre`]);
  const colAddedAt = useSelector(({ sessionModel }) => sessionModel[`col${variant}AddedAt`]);
  const colLastPlayed = useSelector(({ sessionModel }) => sessionModel[`col${variant}LastPlayed`]);
  const colUserRating = useSelector(({ sessionModel }) => sessionModel[`col${variant}UserRating`]);
  const colIsFavourite = useSelector(({ sessionModel }) => sessionModel[`col${variant}IsFavourite`]);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    addedAt: platformOpts.enableAddedAt && (viewArtists === 'grid' || (viewArtists === 'list' && colAddedAt)),
    country: platformOpts.enableCountry && viewArtists === 'list' && colCountry,
    lastPlayed: platformOpts.enableLastPlayed && (viewArtists === 'grid' || (viewArtists === 'list' && colLastPlayed)),
    genre: viewArtists === 'list' && colGenre,
    userRating: platformOpts.enableUserRating && (viewArtists === 'grid' || (viewArtists === 'list' && colUserRating)),
    isFavourite:
      platformOpts.enableIsFavourite && (viewArtists === 'grid' || (viewArtists === 'list' && colIsFavourite)),
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
      [`view${variant}`]: viewArtists,
    });
  };

  const setSortArtists = (sortArtists, orderArtists) => {
    dispatch.sessionModel.setSessionState({
      [`sort${variant}`]: sortArtists,
      ...(orderArtists !== undefined && { [`order${variant}`]: orderArtists }),
    });
  };

  const setOrderArtists = (orderArtists) => {
    dispatch.sessionModel.setSessionState({
      [`sort${variant}`]: actualSortArtists,
      [`order${variant}`]: orderArtists,
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
      userRating: platformOpts.enableUserRating && gridUserRating,
      isFavourite: platformOpts.enableIsFavourite && gridIsFavourite,
    },

    colOptions: {
      country: platformOpts.enableCountry && colCountry,
      genre: colGenre,
      addedAt: platformOpts.enableAddedAt && colAddedAt,
      lastPlayed: platformOpts.enableLastPlayed && colLastPlayed,
      userRating: platformOpts.enableUserRating && colUserRating,
      isFavourite: platformOpts.enableIsFavourite && colIsFavourite,
    },

    setViewArtists,
    setSortArtists,
    setOrderArtists,
    setColumnVisibility,

    sortedArtists,
  };
};

export default useGetArtistArray;
