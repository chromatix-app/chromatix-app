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

const AlbumCollectionList = () => {
  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);

  useEffect(() => {
    plex.getAllCollections();
  }, []);

  return (
    <>
      <TitleHeading
        title="Album Collections"
        subtitle={
          allAlbumCollections ? (
            allAlbumCollections?.length + ' Album Collection' + (allAlbumCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allAlbumCollections && <Loading forceVisible inline />}
      {allAlbumCollections && <ListCards variant="collections" entries={allAlbumCollections} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
