// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CardSet, Loading, Title } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const Playlists = () => {
  const allPlaylists = useSelector(({ appModel }) => appModel.allPlaylists);

  useEffect(() => {
    plex.getAllPlaylists();
  }, []);

  return (
    <>
      <Title title="Playlists" subtitle={allPlaylists?.length ? allPlaylists?.length + ' Playlists' : null} />
      {!allPlaylists && <Loading forceVisible inline />}
      {allPlaylists && <CardSet entries={allPlaylists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Playlists;
