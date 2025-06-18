import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetAllArtists = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel.orderArtists);

  const gridArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridArtistsUserRating);

  const colArtistsCountry = useSelector(({ sessionModel }) => sessionModel.colArtistsCountry);
  const colArtistsGenre = useSelector(({ sessionModel }) => sessionModel.colArtistsGenre);
  const colArtistsAddedAt = useSelector(({ sessionModel }) => sessionModel.colArtistsAddedAt);
  const colArtistsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colArtistsLastPlayed);
  const colArtistsUserRating = useSelector(({ sessionModel }) => sessionModel.colArtistsUserRating);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    addedAt: viewArtists === 'grid' || (viewArtists === 'list' && colArtistsAddedAt),
    country: viewArtists === 'list' && colArtistsCountry,
    lastPlayed: viewArtists === 'grid' || (viewArtists === 'list' && colArtistsLastPlayed),
    genre: viewArtists === 'list' && colArtistsGenre,
    userRating: viewArtists === 'grid' || (viewArtists === 'list' && colArtistsUserRating),
  };
  const actualSortArtists = allowedSort[sortArtists] ? sortArtists : 'title';
  const actualOrderArtists = allowedSort[sortArtists] ? orderArtists : 'asc';

  const haveGotAllArtists = useSelector(({ appModel }) => appModel.haveGotAllArtists);
  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
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
    bridge.getAllArtists();
  }, []);

  return {
    viewArtists,
    sortArtists: actualSortArtists,
    orderArtists: actualOrderArtists,

    gridOptions: {
      userRating: gridArtistsUserRating,
    },

    colOptions: {
      country: colArtistsCountry,
      genre: colArtistsGenre,
      addedAt: colArtistsAddedAt,
      lastPlayed: colArtistsLastPlayed,
      userRating: colArtistsUserRating,
    },

    setViewArtists,
    setSortArtists,
    setOrderArtists,
    setColumnVisibility,

    sortedArtists,
  };
};

export default useGetAllArtists;
