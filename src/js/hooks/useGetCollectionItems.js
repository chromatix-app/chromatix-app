import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetCollectionItems = ({ collectionId, libraryId, collectionKey, itemsKey }) => {
  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const currentCollection = allCollections?.filter((collection) => collection.collectionId === collectionId)[0];

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const currentCollectionItems = allCollectionItems[libraryId + '-' + collectionId];

  const collectionThumb = currentCollection?.thumb;
  const collectionTitle = currentCollection?.title;
  const collectionRating = currentCollection?.userRating;

  useEffect(() => {
    plex.getAllCollections();
    plex[`get${itemsKey}`](libraryId, collectionId);
  }, [itemsKey, collectionId, libraryId]);

  return {
    currentCollectionItems,
    collectionThumb,
    collectionTitle,
    collectionRating,
  };
};

export default useGetCollectionItems;
