import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllPlaylists = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewPlaylists = useSelector(({ sessionModel }) => sessionModel.viewPlaylists);
  const sortPlaylists = useSelector(({ sessionModel }) => sessionModel.sortPlaylists);
  const orderPlaylists = useSelector(({ sessionModel }) => sessionModel.orderPlaylists);

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && sortPlaylists === 'userRating';

  const actualSortPlaylists = isRatingSortHidden ? 'title' : sortPlaylists;
  const actualOrderPlaylists = isRatingSortHidden ? 'asc' : orderPlaylists;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );
  const sortedPlaylists = allPlaylists ? sortList(allPlaylists, actualSortPlaylists, actualOrderPlaylists) : null;

  const setViewPlaylists = (viewPlaylists) => {
    dispatch.sessionModel.setSessionState({
      viewPlaylists,
    });
  };

  const setSortPlaylists = (sortPlaylists) => {
    dispatch.sessionModel.setSessionState({
      sortPlaylists,
    });
  };

  const setOrderPlaylists = (orderPlaylists) => {
    dispatch.sessionModel.setSessionState({
      sortPlaylists: actualSortPlaylists,
      orderPlaylists,
    });
  };

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return {
    viewPlaylists,
    sortPlaylists: actualSortPlaylists,
    orderPlaylists: actualOrderPlaylists,

    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,

    sortedPlaylists,
  };
};

export default useGetAllPlaylists;
