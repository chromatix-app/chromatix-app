import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import platformFeatures from 'js/_config/platformFeatures';
import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetCollectionArray = (collectionKey) => {
  const dispatch = useDispatch();

  const currentService = useSelector(({ appModel }) => appModel.currentService);
  const platformOpts = platformFeatures[currentService] || {};

  // const mediaType = collectionKey.includes('Artist') ? 'Artist' : 'Album';

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewCollections = useSelector(({ sessionModel }) => sessionModel[`view${collectionKey}`]);
  const sortCollections = useSelector(({ sessionModel }) => sessionModel[`sort${collectionKey}`]);
  const orderCollections = useSelector(({ sessionModel }) => sessionModel[`order${collectionKey}`]);

  const gridCollectionsUserRating = useSelector(({ sessionModel }) => sessionModel.gridCollectionsUserRating);

  const colCollectionAddedAt = useSelector(({ sessionModel }) => sessionModel.colCollectionAddedAt);
  const colCollectionUserRating = useSelector(({ sessionModel }) => sessionModel.colCollectionUserRating);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    addedAt:
      platformOpts.enableAddedAt &&
      (viewCollections === 'grid' || (viewCollections === 'list' && colCollectionAddedAt)),
    userRating: viewCollections === 'grid' || (viewCollections === 'list' && colCollectionUserRating),
  };
  const actualSortCollections = allowedSort[sortCollections] ? sortCollections : 'title';
  const actualOrderCollections = allowedSort[sortCollections] ? orderCollections : 'asc';

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`])?.filter(
    (collection) => collection.libraryId === currentLibraryId && !collection.error404 && !collection.isExtra
  );
  const sortedCollections = allCollections
    ? sortList({
        entries: allCollections,
        options: actualSortCollections,
        direction: actualOrderCollections,
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : null;

  const setViewCollections = (viewCollections) => {
    dispatch.sessionModel.setSessionState({
      [`view${collectionKey}`]: viewCollections,
    });
  };

  const setSortCollections = (sortCollections) => {
    dispatch.sessionModel.setSessionState({
      [`sort${collectionKey}`]: sortCollections,
    });
  };

  const setOrderCollections = (orderCollections) => {
    dispatch.sessionModel.setSessionState({
      [`sort${collectionKey}`]: actualSortCollections,
      [`order${collectionKey}`]: orderCollections,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    if (collectionKey.includes('Collections')) {
      bridge.getAllCollections();
    } else {
      bridge.getAllTags(collectionKey);
    }
  }, [collectionKey]);

  return {
    viewCollections,
    sortCollections: actualSortCollections,
    orderCollections: actualOrderCollections,

    gridOptions: {
      userRating: gridCollectionsUserRating,
    },

    colOptions: {
      addedAt: platformOpts.enableAddedAt && colCollectionAddedAt,
      userRating: colCollectionUserRating,
    },

    setViewCollections,
    setSortCollections,
    setOrderCollections,
    setColumnVisibility,

    sortedCollections,
  };
};

export default useGetCollectionArray;
