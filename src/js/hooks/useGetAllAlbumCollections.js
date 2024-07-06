import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllAlbumCollections = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewAlbumCollections = useSelector(({ sessionModel }) => sessionModel.viewAlbumCollections);
  const sortAlbumCollections = useSelector(({ sessionModel }) => sessionModel.sortAlbumCollections);
  const orderAlbumCollections = useSelector(({ sessionModel }) => sessionModel.orderAlbumCollections);

  const actualSortAlbumCollections =
    !optionShowStarRatings && sortAlbumCollections === 'userRating' ? 'title' : sortAlbumCollections;
  const actualOrderAlbumCollections =
    !optionShowStarRatings && sortAlbumCollections === 'userRating' ? 'asc' : orderAlbumCollections;

  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);
  const sortedAlbumCollections = allAlbumCollections
    ? sortList(allAlbumCollections, actualSortAlbumCollections, actualOrderAlbumCollections)
    : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return {
    viewAlbumCollections,
    sortAlbumCollections: actualSortAlbumCollections,
    orderAlbumCollections: actualOrderAlbumCollections,
    sortedAlbumCollections,
  };
};

export default useGetAllAlbumCollections;
