import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllArtistCollections = () => {
  const viewArtistCollections = useSelector(({ sessionModel }) => sessionModel.viewArtistCollections);
  const sortArtistCollections = useSelector(({ sessionModel }) => sessionModel.sortArtistCollections);
  const orderArtistCollections = useSelector(({ sessionModel }) => sessionModel.orderArtistCollections);

  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);
  const sortedArtistCollections = allArtistCollections
    ? sortList(allArtistCollections, sortArtistCollections, orderArtistCollections)
    : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return {
    viewArtistCollections,
    sortArtistCollections,
    orderArtistCollections,
    sortedArtistCollections,
  };
};

export default useGetAllArtistCollections;
