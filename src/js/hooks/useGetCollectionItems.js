import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetCollectionItems = ({ collectionId, libraryId, collectionKey, itemsKey }) => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewCollectionItems = useSelector(({ sessionModel }) => sessionModel[`view${itemsKey}`]);
  const sortCollectionItems = useSelector(({ sessionModel }) => sessionModel[`sort${itemsKey}`]);
  const orderCollectionItems = useSelector(({ sessionModel }) => sessionModel[`order${itemsKey}`]);

  const actualSortCollectionItems =
    // only allow sorting by rating if the option is enabled
    !optionShowStarRatings && sortCollectionItems === 'userRating'
      ? 'title'
      : // default
        sortCollectionItems;

  console.log(sortCollectionItems);

  const actualOrderCollectionItems =
    !optionShowStarRatings && sortCollectionItems === 'userRating' ? 'asc' : orderCollectionItems;

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const currentCollection = allCollections?.filter((collection) => collection.collectionId === collectionId)[0];

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const currentCollectionItems = allCollectionItems[libraryId + '-' + collectionId];

  const sortedCollectionItems = currentCollectionItems
    ? sortList(currentCollectionItems, actualSortCollectionItems, actualOrderCollectionItems)
    : null;

  const collectionThumb = currentCollection?.thumb;
  const collectionTitle = currentCollection?.title;
  const collectionRating = currentCollection?.userRating;

  useEffect(() => {
    plex.getAllCollections();
    plex[`get${itemsKey}`](libraryId, collectionId);
  }, [itemsKey, collectionId, libraryId]);

  return {
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems: actualSortCollectionItems,
    orderCollectionItems: actualOrderCollectionItems,

    collectionThumb,
    collectionTitle,
    collectionRating,
  };
};

export default useGetCollectionItems;
