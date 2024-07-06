import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

const useGetAllArtists = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const viewArtists = useSelector(({ sessionModel }) => sessionModel.viewArtists);
  const sortArtists = useSelector(({ sessionModel }) => sessionModel.sortArtists);
  const orderArtists = useSelector(({ sessionModel }) => sessionModel.orderArtists);

  const actualSortArtists = !optionShowStarRatings && sortArtists === 'userRating' ? 'title' : sortArtists;
  const actualOrderArtists = !optionShowStarRatings && sortArtists === 'userRating' ? 'asc' : orderArtists;

  const allArtists = useSelector(({ appModel }) => appModel.allArtists)?.filter(
    (artist) => artist.libraryId === currentLibraryId
  );
  const sortedArtists = allArtists ? sortList(allArtists, actualSortArtists, actualOrderArtists) : null;

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return {
    viewArtists,
    sortArtists: actualSortArtists,
    orderArtists: actualOrderArtists,
    sortedArtists,
  };
};

export default useGetAllArtists;
