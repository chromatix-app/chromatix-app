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
  const currentCollection = allCollections?.filter((collection) => collection[collectionFilter] === collectionId)[0];

  const allCollectionItems = useSelector(({ appModel }) => appModel[`all${itemsKey}`]);
  const currentCollectionItems = allCollectionItems[libraryId + '-' + collectionId];

  const sortedCollectionItems = currentCollectionItems
    ? sortList(currentCollectionItems, actualSortCollectionItems, actualOrderCollectionItems)
    : null;

  const collectionThumb = currentCollection?.thumb;
  const collectionTitle = currentCollection?.title;
  const collectionRating = currentCollection?.userRating;

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
      plex.getAllCollections();
    } else {
      plex[`getAll${collectionKey}`]();
    }
    plex[`get${itemsKey}`](libraryId, collectionId);
  }, [itemsKey, collectionId, collectionKey, libraryId]);

  return {
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
