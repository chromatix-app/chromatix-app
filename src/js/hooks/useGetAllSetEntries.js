import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllSetEntries = (setKey) => {
  const viewSetEntries = useSelector(({ sessionModel }) => sessionModel[`view${setKey}`]);
  const sortSetEntries = useSelector(({ sessionModel }) => sessionModel[`sort${setKey}`]);
  const orderSetEntries = useSelector(({ sessionModel }) => sessionModel[`order${setKey}`]);

  const allSetEntries = useSelector(({ appModel }) => appModel[`all${setKey}`]);
  const sortedSetEntries = allSetEntries ? sortList(allSetEntries, sortSetEntries, orderSetEntries) : null;

  useEffect(() => {
    plex[`getAll${setKey}`]();
  }, [setKey]);

  return {
    viewSetEntries,
    sortSetEntries,
    orderSetEntries,
    sortedSetEntries,
  };
};

export default useGetAllSetEntries;
