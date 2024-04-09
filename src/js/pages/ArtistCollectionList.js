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
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const allCollections = useSelector(({ appModel }) => appModel.allCollections)?.filter(
    (collection) => collection.libraryId === currentLibraryId && collection.type === 'artist'
  );

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return (
    <>
      <TitleHeading
        title="Artist Collections"
        subtitle={
          allCollections
            ? allCollections?.length + ' Artist Collection' + (allCollections?.length !== 1 ? 's' : '')
            : null
        }
      />
      {!allCollections && <Loading forceVisible inline />}
      {allCollections && <ListCards entries={allCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionList;
