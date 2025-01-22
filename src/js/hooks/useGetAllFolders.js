import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllFolders = (setKey) => {
  const viewFolders = useSelector(({ sessionModel }) => sessionModel.viewFolders);
  const sortFolders = useSelector(({ sessionModel }) => sessionModel.sortFolders);
  const orderFolders = useSelector(({ sessionModel }) => sessionModel.orderFolders);

  const allFolders = useSelector(({ appModel }) => appModel.allFolders);
  const sortedFolders = allFolders ? sortList(allFolders, sortFolders, orderFolders) : null;

  useEffect(() => {
    plex.getAllFolders();
  }, [setKey]);

  return {
    viewFolders,
    sortFolders,
    orderFolders,
    sortedFolders,
  };
};

export default useGetAllFolders;
