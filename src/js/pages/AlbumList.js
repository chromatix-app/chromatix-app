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

const AlbumList = () => {
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return (
    <>
      <TitleHeading title="Albums" subtitle={allAlbums ? allAlbums?.length + ' Albums' : null} />
      {!allAlbums && <Loading forceVisible inline />}
      {allAlbums && <CardSet entries={allAlbums} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
