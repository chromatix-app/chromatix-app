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

const AlbumList = () => {
  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return (
    <>
      <TitleHeading
        title="Albums"
        subtitle={allAlbums ? allAlbums?.length + ' Album' + (allAlbums?.length !== 1 && 's') : null}
      />
      {!allAlbums && <Loading forceVisible inline />}
      {allAlbums && <ListCards entries={allAlbums} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
