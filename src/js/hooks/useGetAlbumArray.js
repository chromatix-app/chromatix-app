import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetAlbumArray = () => {
  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewAlbums = useSelector(({ sessionModel }) => sessionModel.viewAlbums);
  const sortAlbums = useSelector(({ sessionModel }) => sessionModel.sortAlbums);
  const orderAlbums = useSelector(({ sessionModel }) => sessionModel.orderAlbums);

  const gridAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.gridAlbumsUserRating);
  const gridAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.gridAlbumsIsFavourite);

  const colAlbumsArtist = useSelector(({ sessionModel }) => sessionModel.colAlbumsArtist);
  const colAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colAlbumsGenre);
  const colAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colAlbumsReleaseDate);
  const colAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colAlbumsAddedAt);
  const colAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colAlbumsLastPlayed);
  const colAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsUserRating);
  const colAlbumsIsFavourite = useSelector(({ sessionModel }) => sessionModel.colAlbumsIsFavourite);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    artist: viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsArtist),
    'artist-asc-releaseDate-asc': viewAlbums === 'grid',
    'artist-asc-releaseDate-desc': viewAlbums === 'grid',
    addedAt: viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsAddedAt),
    lastPlayed: viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsLastPlayed),
    genre: viewAlbums === 'list' && colAlbumsGenre,
    releaseDate: viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsReleaseDate),
    userRating:
      platformOpts.enableUserRating && (viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsUserRating)),
    isFavourite:
      platformOpts.enableIsFavourite && (viewAlbums === 'grid' || (viewAlbums === 'list' && colAlbumsIsFavourite)),
  };
  const actualSortAlbums = allowedSort[sortAlbums] ? sortAlbums : 'title';
  const actualOrderAlbums = allowedSort[sortAlbums] ? orderAlbums : 'asc';

  const haveGotAllAlbums = useSelector(({ appModel }) => appModel.haveGotAllAlbums);
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums =
    haveGotAllAlbums && allAlbums
      ? sortList({
          entries: allAlbums,
          options: actualSortAlbums,
          direction: actualOrderAlbums,
          sortNumbersFirst: optionSortNumbersFirst,
          ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
        })
      : null;

  const setViewAlbums = (viewAlbums) => {
    dispatch.sessionModel.setSessionState({
      viewAlbums,
    });
  };

  const setSortAlbums = (sortAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortAlbums,
    });
  };

  const setOrderAlbums = (orderAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortAlbums: actualSortAlbums,
      orderAlbums,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    bridge.getAllAlbums();
  }, []);

  return {
    viewAlbums,
    sortAlbums: actualSortAlbums,
    orderAlbums: actualOrderAlbums,

    gridOptions: {
      userRating: platformOpts.enableUserRating && gridAlbumsUserRating,
      isFavourite: platformOpts.enableIsFavourite && gridAlbumsIsFavourite,
    },

    colOptions: {
      artist: colAlbumsArtist,
      genre: colAlbumsGenre,
      releaseDate: colAlbumsReleaseDate,
      addedAt: colAlbumsAddedAt,
      lastPlayed: colAlbumsLastPlayed,
      userRating: platformOpts.enableUserRating && colAlbumsUserRating,
      isFavourite: platformOpts.enableIsFavourite && colAlbumsIsFavourite,
    },

    setViewAlbums,
    setSortAlbums,
    setOrderAlbums,
    setColumnVisibility,

    sortedAlbums,
  };
};

export default useGetAlbumArray;
