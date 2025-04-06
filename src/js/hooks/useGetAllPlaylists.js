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

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );
  const sortedPlaylists = allPlaylists ? sortList(allPlaylists, sortPlaylists, orderPlaylists) : null;

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
      sortPlaylists,
      orderPlaylists,
    });
  };

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,

    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,

    sortedPlaylists,
  };
};

export default useGetAllPlaylists;
