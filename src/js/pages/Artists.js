// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CardSet, Loading, TitleBlock } from 'js/components';
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
      <TitleBlock title="Artists" subtitle={allArtists ? allArtists?.length + ' Artists' : null} />
      {!allArtists && <Loading forceVisible inline />}
      {allArtists && <CardSet entries={allArtists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Artists;
