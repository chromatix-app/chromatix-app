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

const Albums = () => {
  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums);

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return (
    <>
      <TitleBlock title="Albums" subtitle={allAlbums?.length ? allAlbums?.length + ' Albums' : null} />
      {!allAlbums && <Loading forceVisible inline />}
      {allAlbums && <CardSet entries={allAlbums} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default Albums;
