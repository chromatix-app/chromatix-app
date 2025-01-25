import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllArtists = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel.orderArtists);

  const actualSortArtists = !optionShowStarRatings && sortArtists === 'userRating' ? 'title' : sortArtists;
  const actualOrderArtists = !optionShowStarRatings && sortArtists === 'userRating' ? 'asc' : orderArtists;

  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );
  const sortedArtists = allArtists ? sortList(allArtists, actualSortArtists, actualOrderArtists) : null;

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
      orderArtists,
    });
  };

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return {
    viewArtists,
    sortArtists: actualSortArtists,
    orderArtists: actualOrderArtists,

    setViewArtists,
    setSortArtists,
    setOrderArtists,

    sortedArtists,
  };
};

export default useGetAllArtists;
