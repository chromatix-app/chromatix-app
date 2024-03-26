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

const Artists = () => {
  const allArtists = useSelector(({ appModel }) => appModel.allArtists);

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return (
    <>
      <Title title="Artists" subtitle={allArtists?.length ? allArtists?.length + ' Artists' : null} />
      {!allArtists && <Loading forceVisible inline />}
      {allArtists && <CardSet entries={allArtists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Artists;
