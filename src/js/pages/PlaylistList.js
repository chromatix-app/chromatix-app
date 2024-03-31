// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CardSet, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <>
      <TitleHeading title="Playlists" subtitle={allPlaylists ? allPlaylists?.length + ' Playlists' : null} />
      {!allPlaylists && <Loading forceVisible inline />}
      {allPlaylists && <CardSet entries={allPlaylists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
