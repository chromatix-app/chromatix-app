// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists)?.filter(
    (playlist) => playlist.libraryId === currentLibraryId
  );

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <>
      <TitleHeading title="Playlists" subtitle={allPlaylists ? allPlaylists?.length + ' Playlists' : null} />
      {!allPlaylists && <Loading forceVisible inline />}
      {allPlaylists && <ListCards entries={allPlaylists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
