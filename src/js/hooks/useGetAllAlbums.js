import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllAlbums = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewAlbums = useSelector(({ sessionModel }) => sessionModel.viewAlbums);
  const sortAlbums = useSelector(({ sessionModel }) => sessionModel.sortAlbums);
  const orderAlbums = useSelector(({ sessionModel }) => sessionModel.orderAlbums);

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && sortAlbums === 'userRating';

  // prevent sub-sorting in list view
  const isSubSortList = viewAlbums === 'list' && sortAlbums.split('-').length > 2;

  const actualSortAlbums = isRatingSortHidden ? 'title' : isSubSortList ? 'artist' : sortAlbums;
  const actualOrderAlbums = isRatingSortHidden ? 'asc' : orderAlbums;

  const haveGotAllAlbums = useSelector(({ appModel }) => appModel.haveGotAllAlbums);
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums = haveGotAllAlbums && allAlbums ? sortList(allAlbums, actualSortAlbums, actualOrderAlbums) : null;

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

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return {
    viewAlbums,
    sortAlbums: actualSortAlbums,
    orderAlbums: actualOrderAlbums,

    setViewAlbums,
    setSortAlbums,
    setOrderAlbums,

    sortedAlbums,
  };
};

export default useGetAllAlbums;
