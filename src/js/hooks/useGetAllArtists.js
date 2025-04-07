import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

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

  const haveGotAllArtists = useSelector(({ appModel }) => appModel.haveGotAllArtists);
  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );
  const sortedArtists = haveGotAllArtists && allArtists ? sortList(allArtists, sortArtists, orderArtists) : null;

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
      sortArtists,
      orderArtists,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return {
    viewArtists,
    sortArtists,
    orderArtists,

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
