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

  const colAlbumsArtist = useSelector(({ sessionModel }) => sessionModel.colAlbumsArtist);
  const colAlbumsReleased = useSelector(({ sessionModel }) => sessionModel.colAlbumsReleased);
  const colAlbumsAdded = useSelector(({ sessionModel }) => sessionModel.colAlbumsAdded);
  const colAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colAlbumsLastPlayed);
  const colAlbumsRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsRating);

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

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return {
    viewAlbums,
    sortAlbums: actualSortAlbums,
    orderAlbums: actualOrderAlbums,

    colOptions: {
      colAlbumsArtist,
      colAlbumsReleased,
      colAlbumsAdded,
      colAlbumsLastPlayed,
      colAlbumsRating,
    },

    setViewAlbums,
    setSortAlbums,
    setOrderAlbums,
    setColumnVisibility,

    sortedAlbums,
  };
};

export default useGetAllAlbums;
