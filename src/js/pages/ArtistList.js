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

const ArtistList = () => {
  const allArtists = useSelector(({ appModel }) => appModel.allArtists);

  useEffect(() => {
    plex.getAllArtists();
  }, []);

  return (
    <>
      <TitleHeading title="Artists" subtitle={allArtists ? allArtists?.length + ' Artists' : null} />
      {!allArtists && <Loading forceVisible inline />}
      {allArtists && <CardSet entries={allArtists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
