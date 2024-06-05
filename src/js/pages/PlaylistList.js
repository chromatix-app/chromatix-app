// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ListCards, Loading, Select, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;
  const sortPlaylists = useSelector(({ sessionModel }) => sessionModel.sortPlaylists);

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );
  const sortedPlaylists = allPlaylists ? sortList(allPlaylists, sortPlaylists) : null;

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <>
      <TitleHeading title="Playlists" subtitle={sortedPlaylists ? sortedPlaylists?.length + ' Playlists' : null} />
      <Select
        value={sortPlaylists}
        options={[
          { value: 'title', label: 'Alphabetical' },
          { value: 'userRating', label: 'Rating' },
          { value: 'addedAt', label: 'Recently Added' },
          { value: 'lastPlayed', label: 'Recently Played' },
        ]}
        setter={(sortPlaylists) => {
          dispatch.sessionModel.setSessionState({
            sortPlaylists,
          });
        }}
      />
      {!sortedPlaylists && <Loading forceVisible inline />}
      {sortedPlaylists && <ListCards variant="playlists" entries={sortedPlaylists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
