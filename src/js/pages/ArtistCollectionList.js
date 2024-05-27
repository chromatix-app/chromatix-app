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

const ArtistCollectionList = () => {
  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Collections"
        subtitle={
          allArtistCollections ? (
            allArtistCollections?.length + ' Artist Collection' + (allArtistCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allArtistCollections && <Loading forceVisible inline />}
      {allArtistCollections && <ListCards variant="collections" entries={allArtistCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionList;
