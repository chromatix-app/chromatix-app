import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllCollections = (collectionKey) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewCollections = useSelector(({ sessionModel }) => sessionModel[`view${collectionKey}`]);
  const sortCollections = useSelector(({ sessionModel }) => sessionModel[`sort${collectionKey}`]);
  const orderCollections = useSelector(({ sessionModel }) => sessionModel[`order${collectionKey}`]);

  const actualSortCollections = !optionShowStarRatings && sortCollections === 'userRating' ? 'title' : sortCollections;
  const actualOrderCollections = !optionShowStarRatings && sortCollections === 'userRating' ? 'asc' : orderCollections;

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const sortedCollections = allCollections
    ? sortList(allCollections, actualSortCollections, actualOrderCollections)
    : null;

  useEffect(() => {
    plex.getAllCollections();
  }, [collectionKey]);

  return {
    viewCollections,
    sortCollections: actualSortCollections,
    orderCollections: actualOrderCollections,
    sortedCollections,
  };
};

export default useGetAllCollections;
