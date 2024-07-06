import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllArtistCollections = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewArtistCollections = useSelector(({ sessionModel }) => sessionModel.viewArtistCollections);
  const sortArtistCollections = useSelector(({ sessionModel }) => sessionModel.sortArtistCollections);
  const orderArtistCollections = useSelector(({ sessionModel }) => sessionModel.orderArtistCollections);

  const actualSortArtistCollections =
    !optionShowStarRatings && sortArtistCollections === 'userRating' ? 'title' : sortArtistCollections;
  const actualOrderArtistCollections =
    !optionShowStarRatings && sortArtistCollections === 'userRating' ? 'asc' : orderArtistCollections;

  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);
  const sortedArtistCollections = allArtistCollections
    ? sortList(allArtistCollections, actualSortArtistCollections, actualOrderArtistCollections)
    : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return {
    viewArtistCollections,
    sortArtistCollections: actualSortArtistCollections,
    orderArtistCollections: actualOrderArtistCollections,
    sortedArtistCollections,
  };
};

export default useGetAllArtistCollections;
