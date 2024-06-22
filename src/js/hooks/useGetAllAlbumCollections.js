import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllAlbumCollections = () => {
  const viewAlbumCollections = useSelector(({ sessionModel }) => sessionModel.viewAlbumCollections);
  const sortAlbumCollections = useSelector(({ sessionModel }) => sessionModel.sortAlbumCollections);
  const orderAlbumCollections = useSelector(({ sessionModel }) => sessionModel.orderAlbumCollections);

  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);
  const sortedAlbumCollections = allAlbumCollections
    ? sortList(allAlbumCollections, sortAlbumCollections, orderAlbumCollections)
    : null;

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return {
    viewAlbumCollections,
    sortAlbumCollections,
    orderAlbumCollections,
    sortedAlbumCollections,
  };
};

export default useGetAllAlbumCollections;
