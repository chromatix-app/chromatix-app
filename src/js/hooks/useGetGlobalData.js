import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as bridge from 'js/services/bridge';

/**
 * Fetches and prepares data that should be loaded once, app-wide, as soon as the sidebar mounts:
 * the playlist list (for the sidebar's own playlist section) and artist/album collections
 * (so "Add to collection" context menus don't need to fetch on a per-row basis).
 */

const useGetGlobalData = () => {
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
    bridge.getAllCollections();
  }, []);

  return {
    hasPlaylists,
    sortedPlaylists,
  };
};

export default useGetGlobalData;
