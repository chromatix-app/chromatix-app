import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllPlaylists = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewPlaylists = useSelector(({ sessionModel }) => sessionModel.viewPlaylists);
  const sortPlaylists = useSelector(({ sessionModel }) => sessionModel.sortPlaylists);
  const orderPlaylists = useSelector(({ sessionModel }) => sessionModel.orderPlaylists);

  const gridPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.gridPlaylistsUserRating);

  const colPlaylistsTotalTracks = useSelector(({ sessionModel }) => sessionModel.colPlaylistsTotalTracks);
  const colPlaylistsDuration = useSelector(({ sessionModel }) => sessionModel.colPlaylistsDuration);
  const colPlaylistsAddedAt = useSelector(({ sessionModel }) => sessionModel.colPlaylistsAddedAt);
  const colPlaylistsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colPlaylistsLastPlayed);
  const colPlaylistsUserRating = useSelector(({ sessionModel }) => sessionModel.colPlaylistsUserRating);

  // prevent sorting by a hidden field
  const allowedSort = {
    title: true,
    totalTracks: viewPlaylists === 'grid' || (viewPlaylists === 'list' && colPlaylistsTotalTracks),
    duration: viewPlaylists === 'grid' || (viewPlaylists === 'list' && colPlaylistsDuration),
    addedAt: viewPlaylists === 'grid' || (viewPlaylists === 'list' && colPlaylistsAddedAt),
    lastPlayed: viewPlaylists === 'grid' || (viewPlaylists === 'list' && colPlaylistsLastPlayed),
    userRating: viewPlaylists === 'grid' || (viewPlaylists === 'list' && colPlaylistsUserRating),
  };
  const actualSortPlaylists = allowedSort[sortPlaylists] ? sortPlaylists : 'title';
  const actualOrderPlaylists = allowedSort[sortPlaylists] ? orderPlaylists : 'asc';

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );
  const sortedPlaylists = allPlaylists ? sortList(allPlaylists, actualSortPlaylists, actualOrderPlaylists) : null;

  const setViewPlaylists = (viewPlaylists) => {
    dispatch.sessionModel.setSessionState({
      viewPlaylists,
    });
  };

  const setSortPlaylists = (sortPlaylists) => {
    dispatch.sessionModel.setSessionState({
      sortPlaylists,
    });
  };

  const setOrderPlaylists = (orderPlaylists) => {
    dispatch.sessionModel.setSessionState({
      sortPlaylists: actualSortPlaylists,
      orderPlaylists,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return {
    viewPlaylists,
    sortPlaylists: actualSortPlaylists,
    orderPlaylists: actualOrderPlaylists,

    gridOptions: {
      userRating: gridPlaylistsUserRating,
    },

    colOptions: {
      totalTracks: colPlaylistsTotalTracks,
      duration: colPlaylistsDuration,
      addedAt: colPlaylistsAddedAt,
      lastPlayed: colPlaylistsLastPlayed,
      userRating: colPlaylistsUserRating,
    },

    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,
    setColumnVisibility,

    sortedPlaylists,
  };
};

export default useGetAllPlaylists;
