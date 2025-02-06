import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetFolderItems = (folderId) => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);

  const viewFolders = useSelector(({ sessionModel }) => sessionModel.viewFolders);
  const sortFolders = useSelector(({ sessionModel }) => sessionModel.sortFolders);
  const orderFolders = useSelector(({ sessionModel }) => sessionModel.orderFolders);

  const libraryId = currentLibrary?.libraryId;
  const allFolderItems = useSelector(({ appModel }) => appModel.allFolderItems);
  const folderItems = allFolderItems ? allFolderItems[libraryId + '-' + folderId] : null;
  const sortedFolders = folderItems ? sortList(folderItems, sortFolders, orderFolders) : null;

  // console.log(sortFolders);

  const sortedWithFoldersOnTop =
    sortFolders === 'kind'
      ? sortedFolders
      : sortedFolders?.sort((a, b) => {
          if (a.kind === 'aaafolder' && b.kind !== 'aaafolder') return -1;
          if (a.kind !== 'aaafolder' && b.kind === 'aaafolder') return 1;
          return 0;
        });

  const tracksOnly = sortedFolders?.filter((entry) => entry.kind === 'track');
  const folderOrder = tracksOnly?.map((entry) => entry.trackSortOrder);

  const setViewFolders = (viewFolders) => {
    dispatch.sessionModel.setSessionState({
      viewFolders,
    });
  };

  const setSortFolders = (sortFolders) => {
    dispatch.sessionModel.setSessionState({
      sortFolders,
    });
  };

  const setOrderFolders = (orderFolders) => {
    dispatch.sessionModel.setSessionState({
      orderFolders,
    });
  };

  useEffect(() => {
    plex.getFolderItems(folderId);
  }, [folderId]);

  return {
    viewFolders,
    sortFolders,
    orderFolders,

    setViewFolders,
    setSortFolders,
    setOrderFolders,

    sortedFolders: sortedWithFoldersOnTop,
    folderOrder,
  };
};

export default useGetFolderItems;
