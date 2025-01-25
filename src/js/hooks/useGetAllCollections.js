import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllCollections = (collectionKey) => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const viewCollections = useSelector(({ sessionModel }) => sessionModel[`view${collectionKey}`]);
  const sortCollections = useSelector(({ sessionModel }) => sessionModel[`sort${collectionKey}`]);
  const orderCollections = useSelector(({ sessionModel }) => sessionModel[`order${collectionKey}`]);

  // prevent sorting by rating if ratings are hidden
  const isRatingSortHidden = !optionShowStarRatings && sortCollections === 'userRating';

  const actualSortCollections = isRatingSortHidden ? 'title' : sortCollections;
  const actualOrderCollections = isRatingSortHidden ? 'asc' : orderCollections;

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const sortedCollections = allCollections
    ? sortList(allCollections, actualSortCollections, actualOrderCollections)
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
      [`order${collectionKey}`]: orderCollections,
    });
  };

  useEffect(() => {
    if (collectionKey.includes('Collections')) {
      plex.getAllCollections();
    } else {
      plex[`getAll${collectionKey}`]();
    }
  }, [collectionKey]);

  return {
    viewCollections,
    sortCollections: actualSortCollections,
    orderCollections: actualOrderCollections,

    setViewCollections,
    setSortCollections,
    setOrderCollections,

    sortedCollections,
  };
};

export default useGetAllCollections;
