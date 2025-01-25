import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllSetEntries = (setKey) => {
  const dispatch = useDispatch();

  const viewSetEntries = useSelector(({ sessionModel }) => sessionModel[`view${setKey}`]);
  const sortSetEntries = useSelector(({ sessionModel }) => sessionModel[`sort${setKey}`]);
  const orderSetEntries = useSelector(({ sessionModel }) => sessionModel[`order${setKey}`]);

  const allSetEntries = useSelector(({ appModel }) => appModel[`all${setKey}`]);
  const sortedSetEntries = allSetEntries ? sortList(allSetEntries, sortSetEntries, orderSetEntries) : null;

  const setViewSetEntries = (viewSetEntries) => {
    dispatch.sessionModel.setSessionState({
      [`view${setKey}`]: viewSetEntries,
    });
  };

  const setSortSetEntries = (sortSetEntries) => {
    dispatch.sessionModel.setSessionState({
      [`sort${setKey}`]: sortSetEntries,
    });
  };

  const setOrderSetEntries = (orderSetEntries) => {
    dispatch.sessionModel.setSessionState({
      [`order${setKey}`]: orderSetEntries,
    });
  };

  useEffect(() => {
    plex[`getAll${setKey}`]();
  }, [setKey]);

  return {
    viewSetEntries,
    sortSetEntries,
    orderSetEntries,

    setViewSetEntries,
    setSortSetEntries,
    setOrderSetEntries,

    sortedSetEntries,
  };
};

export default useGetAllSetEntries;
