import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllPlaylists = () => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewPlaylists = useSelector(({ sessionModel }) => sessionModel.viewPlaylists);
  const sortPlaylists = useSelector(({ sessionModel }) => sessionModel.sortPlaylists);
  const orderPlaylists = useSelector(({ sessionModel }) => sessionModel.orderPlaylists);

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );
  const sortedPlaylists = allPlaylists ? sortList(allPlaylists, sortPlaylists, orderPlaylists) : null;

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,
    sortedPlaylists,
  };
};

export default useGetAllPlaylists;
