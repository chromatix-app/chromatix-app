import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetFolderItems = (folderId = 'root') => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const viewFolders = useSelector(({ sessionModel }) => sessionModel.viewFolders);
  const sortFolders = useSelector(({ sessionModel }) => sessionModel.sortFolders);
  const orderFolders = useSelector(({ sessionModel }) => sessionModel.orderFolders);

  const libraryId = currentLibrary?.libraryId;
  const allFolderItems = useSelector(({ appModel }) => appModel.allFolderItems);
  const folderItems = allFolderItems ? allFolderItems[libraryId + '-' + folderId] : null;
  const sortedFolders = folderItems ? sortList(folderItems, sortFolders, orderFolders) : null;

  useEffect(() => {
    plex.getFolderItems(folderId);
  }, [folderId]);

  return {
    viewFolders,
    sortFolders,
    orderFolders,
    sortedFolders,
  };
};

export default useGetFolderItems;
