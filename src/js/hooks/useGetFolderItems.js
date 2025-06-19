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

  const colFoldersKind = useSelector(({ sessionModel }) => sessionModel.colFoldersKind);

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  // prevent sorting by a hidden field
  const allowedSort = {
    sortOrder: true,
    title: true,
    kind: viewFolders === 'grid' || (viewFolders === 'list' && colFoldersKind),
  };
  const actualSortFolders = allowedSort[sortFolders] ? sortFolders : 'title';
  const actualOrderFolders = allowedSort[sortFolders] ? orderFolders : 'asc';

  const libraryId = currentLibrary?.libraryId;
  const allFolderItems = useSelector(({ appModel }) => appModel.allFolderItems);
  const folderItems = allFolderItems ? allFolderItems[libraryId + '-' + folderId] : null;
  const sortedFolders = folderItems
    ? sortList({
        entries: folderItems,
        options: actualSortFolders,
        direction: actualOrderFolders,
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : null;

  const sortedWithFoldersOnTop =
    actualSortFolders === 'kind'
      ? sortedFolders
      : sortedFolders?.sort((a, b) => {
          if (a.kind === 'aaafolder' && b.kind !== 'aaafolder') return -1;
          if (a.kind !== 'aaafolder' && b.kind === 'aaafolder') return 1;
          return 0;
        });

  let sortedTrackNumber = 0;
  sortedWithFoldersOnTop?.forEach((item) => {
    if (item.kind === 'track') {
      sortedTrackNumber++;
      item.sortedTrackNumber = sortedTrackNumber;
    }
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
      sortFolders: actualSortFolders,
      orderFolders,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    plex.getFolderItems(folderId).catch(() => {});
  }, [folderId]);

  return {
    viewFolders,
    sortFolders: actualSortFolders,
    orderFolders: actualOrderFolders,
    colOptions: {
      kind: colFoldersKind,
    },

    setViewFolders,
    setSortFolders,
    setOrderFolders,
    setColumnVisibility,

    sortedFolders: sortedWithFoldersOnTop,
    folderOrder,
  };
};

export default useGetFolderItems;
