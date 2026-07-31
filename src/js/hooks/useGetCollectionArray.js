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
  const isCollection = collectionKey.includes('Collections');

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewCollections = useSelector(({ sessionModel }) => sessionModel[`view${collectionKey}`]);
  const sortCollections = useSelector(({ sessionModel }) => sessionModel[`sort${collectionKey}`]);
  const orderCollections = useSelector(({ sessionModel }) => sessionModel[`order${collectionKey}`]);

  // [NOTE] for collection listings, collectionKey is 'ArtistCollections' or 'AlbumCollections', which matches the
  // suffix used by this view's session state keys. Tag listings have no grid / column settings of their own.
  const gridTotalItems = useSelector(({ sessionModel }) => sessionModel[`grid${collectionKey}TotalItems`]);
  const gridUserRating = useSelector(({ sessionModel }) => sessionModel[`grid${collectionKey}UserRating`]);

  const colTotalItems = useSelector(({ sessionModel }) => sessionModel[`col${collectionKey}TotalItems`]);
  const colAddedAt = useSelector(({ sessionModel }) => sessionModel[`col${collectionKey}AddedAt`]);
  const colUserRating = useSelector(({ sessionModel }) => sessionModel[`col${collectionKey}UserRating`]);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    totalItems: isCollection && (viewCollections === 'grid' || (viewCollections === 'list' && colTotalItems)),
    addedAt: platformOpts.enableAddedAt && (viewCollections === 'grid' || (viewCollections === 'list' && colAddedAt)),
    userRating: viewCollections === 'grid' || (viewCollections === 'list' && colUserRating),
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

  const setSortCollections = (sortCollections, orderCollections) => {
    dispatch.sessionModel.setSessionState({
      [`sort${collectionKey}`]: sortCollections,
      ...(orderCollections !== undefined && { [`order${collectionKey}`]: orderCollections }),
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
    if (isCollection) {
      bridge.getAllCollections();
    } else {
      bridge.getAllTags(collectionKey);
    }
  }, [collectionKey, isCollection]);

  return {
    viewCollections,
    sortCollections: actualSortCollections,
    orderCollections: actualOrderCollections,

    gridOptions: {
      ...(isCollection && { totalItems: gridTotalItems }),
      userRating: gridUserRating,
    },

    colOptions: {
      ...(isCollection && { totalItems: colTotalItems }),
      addedAt: platformOpts.enableAddedAt && colAddedAt,
      userRating: colUserRating,
      isFavourite: false,
    },

    setViewCollections,
    setSortCollections,
    setOrderCollections,
    setColumnVisibility,

    sortedCollections,
  };
};

export default useGetCollectionArray;
