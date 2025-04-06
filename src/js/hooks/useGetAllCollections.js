import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllCollections = (collectionKey) => {
  const dispatch = useDispatch();

  const viewCollections = useSelector(({ sessionModel }) => sessionModel[`view${collectionKey}`]);
  const sortCollections = useSelector(({ sessionModel }) => sessionModel[`sort${collectionKey}`]);
  const orderCollections = useSelector(({ sessionModel }) => sessionModel[`order${collectionKey}`]);

  const allCollections = useSelector(({ appModel }) => appModel[`all${collectionKey}`]);
  const sortedCollections = allCollections ? sortList(allCollections, sortCollections, orderCollections) : null;

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
      [`sort${collectionKey}`]: sortCollections,
      [`order${collectionKey}`]: orderCollections,
    });
  };

  useEffect(() => {
    if (collectionKey.includes('Collections')) {
      plex.getAllCollections();
    } else {
      plex.getAllTags(collectionKey);
    }
  }, [collectionKey]);

  return {
    viewCollections,
    sortCollections,
    orderCollections,

    setViewCollections,
    setSortCollections,
    setOrderCollections,

    sortedCollections,
  };
};

export default useGetAllCollections;
