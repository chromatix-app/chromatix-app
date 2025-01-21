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

const AlbumStyleList = () => {
  const allAlbumStyles = useSelector(({ appModel }) => appModel.allAlbumStyles);

  useEffect(() => {
    plex.getAllAlbumStyles();
  }, []);

  return (
    <>
      <TitleHeading
        title="Album Styles"
        subtitle={
          allAlbumStyles ? (
            allAlbumStyles?.length + ' Album Style' + (allAlbumStyles?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      {!allAlbumStyles && <Loading forceVisible inline />}
      {allAlbumStyles && <ListCards variant="albumStyles" entries={allAlbumStyles} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumStyleList;
