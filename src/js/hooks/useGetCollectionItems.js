import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetCollectionItems = ({
  libraryId,
  collectionId,
  collectionFilter = 'collectionId',
  collectionKey,
  itemsKey,
}) => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewCollectionItems = useSelector(({ sessionModel }) => sessionModel[`view${itemsKey}`]);
  const sortCollectionItems = useSelector(({ sessionModel }) => sessionModel[`sort${itemsKey}`]);
  const orderCollectionItems = useSelector(({ sessionModel }) => sessionModel[`order${itemsKey}`]);

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && sortCollectionItems === 'userRating';

  // prevent sub-sorting in list view
  const isSubSortList = viewCollectionItems === 'list' && sortCollectionItems.split('-').length > 2;

  const actualSortCollectionItems = isRatingSortHidden ? 'title' : isSubSortList ? 'artist' : sortCollectionItems;
  const actualOrderCollectionItems = isRatingSortHidden ? 'asc' : orderCollectionItems;

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const collectionInfo = allCollections?.find((collection) => collection[collectionFilter] === collectionId);

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const collectionInfoItems = allCollectionItems[libraryId + '-' + collectionId];

  const sortedCollectionItems = collectionInfoItems
    ? sortList(collectionInfoItems, actualSortCollectionItems, actualOrderCollectionItems)
    : null;

  const collectionThumb = collectionInfo?.thumb;
  const collectionTitle = collectionInfo?.title;
  const collectionRating = collectionInfo?.userRating;

  const setViewCollectionItems = (viewCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`view${itemsKey}`]: viewCollectionItems,
    });
  };

  const setSortCollectionItems = (sortCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`sort${itemsKey}`]: sortCollectionItems,
    });
  };

  const setOrderCollectionItems = (orderCollectionItems) => {
    dispatch.sessionModel.setSessionState({
      [`sort${itemsKey}`]: actualSortCollectionItems,
      [`order${itemsKey}`]: orderCollectionItems,
    });
  };

  useEffect(() => {
    if (collectionKey.includes('Collections')) {
      const collectionType = collectionKey.includes('Artist') ? 'Artist' : 'Album';
      plex.getAllCollections();
      plex.getCollectionItems(libraryId, collectionId, collectionType);
    } else {
      plex.getAllSets(collectionKey);
      plex[`get${itemsKey}`](libraryId, collectionId);
    }
  }, [itemsKey, collectionId, collectionKey, libraryId]);

  return {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems: actualSortCollectionItems,
    orderCollectionItems: actualOrderCollectionItems,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,

    collectionThumb,
    collectionTitle,
    collectionRating,
  };
};

export default useGetCollectionItems;
