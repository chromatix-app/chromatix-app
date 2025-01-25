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

  const actualSortAlbums =
    // only allow sorting by rating if the option is enabled
    !optionShowStarRatings && sortAlbums === 'userRating'
      ? 'title'
      : // prevent sub-sorting in list view
      viewAlbums === 'list' && sortAlbums.startsWith('artist-asc-releaseDate-')
      ? 'artist'
      : // default
        sortAlbums;

  const actualOrderAlbums = !optionShowStarRatings && sortAlbums === 'userRating' ? 'asc' : orderAlbums;

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums = allAlbums ? sortList(allAlbums, actualSortAlbums, actualOrderAlbums) : null;

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
