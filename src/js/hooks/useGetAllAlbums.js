import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllAlbums = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewAlbums = useSelector(({ sessionModel }) => sessionModel.viewAlbums);
  const sortAlbums = useSelector(({ sessionModel }) => sessionModel.sortAlbums);
  const orderAlbums = useSelector(({ sessionModel }) => sessionModel.orderAlbums);

  const colAlbumsArtist = useSelector(({ sessionModel }) => sessionModel.colAlbumsArtist);
  const colAlbumsGenre = useSelector(({ sessionModel }) => sessionModel.colAlbumsGenre);
  const colAlbumsReleaseDate = useSelector(({ sessionModel }) => sessionModel.colAlbumsReleaseDate);
  const colAlbumsAddedAt = useSelector(({ sessionModel }) => sessionModel.colAlbumsAddedAt);
  const colAlbumsLastPlayed = useSelector(({ sessionModel }) => sessionModel.colAlbumsLastPlayed);
  const colAlbumsUserRating = useSelector(({ sessionModel }) => sessionModel.colAlbumsUserRating);

  // prevent sub-sorting in list view
  const isSubSortList = viewAlbums === 'list' && sortAlbums.split('-').length > 2;

  const actualSortAlbums = isSubSortList ? 'artist' : sortAlbums;

  const haveGotAllAlbums = useSelector(({ appModel }) => appModel.haveGotAllAlbums);
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums = haveGotAllAlbums && allAlbums ? sortList(allAlbums, actualSortAlbums, orderAlbums) : null;

  const setViewAlbums = (viewAlbums) => {
    dispatch.sessionModel.setSessionState({
      viewAlbums,
    });
  };

  const setSortAlbums = (sortAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortAlbums,
    });
  };

  const setOrderAlbums = (orderAlbums) => {
    dispatch.sessionModel.setSessionState({
      sortAlbums: actualSortAlbums,
      orderAlbums,
    });
  };

  const setColumnVisibility = (columnKey, columnValue) => {
    dispatch.sessionModel.setSessionState({
      [columnKey]: columnValue,
    });
  };

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return {
    viewAlbums,
    sortAlbums: actualSortAlbums,
    orderAlbums,

    colOptions: {
      artist: colAlbumsArtist,
      genre: colAlbumsGenre,
      releaseDate: colAlbumsReleaseDate,
      addedAt: colAlbumsAddedAt,
      lastPlayed: colAlbumsLastPlayed,
      userRating: colAlbumsUserRating,
    },

    setViewAlbums,
    setSortAlbums,
    setOrderAlbums,
    setColumnVisibility,

    sortedAlbums,
  };
};

export default useGetAllAlbums;
