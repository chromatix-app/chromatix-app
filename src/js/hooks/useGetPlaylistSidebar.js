import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

const useGetPlaylistSidebar = () => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const optionSortNumbersFirst = useSelector(({ sessionModel }) => sessionModel.optionSortNumbersFirst);
  const optionSortIgnoreLeadingArticles = useSelector(
    ({ sessionModel }) => sessionModel.optionSortIgnoreLeadingArticles
  );

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId && !playlist.error404 && !playlist.isExtra
  );

  const hasPlaylists = allPlaylists && allPlaylists.length > 0;

  const sortedPlaylists = hasPlaylists
    ? sortList({
        entries: allPlaylists,
        options: 'title',
        direction: 'asc',
        sortNumbersFirst: optionSortNumbersFirst,
        ignoreLeadingArticles: optionSortIgnoreLeadingArticles,
      })
    : [];

  useEffect(() => {
    bridge.getAllPlaylists();
  }, []);

  return {
    hasPlaylists,
    sortedPlaylists,
  };
};

export default useGetPlaylistSidebar;
