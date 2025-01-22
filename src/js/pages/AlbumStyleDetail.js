// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumStyleDetail = () => {
  const { styleId, libraryId } = useParams();

  const allAlbumStyles = useSelector(({ appModel }) => appModel.allAlbumStyles);
  const currentAlbumStyle = allAlbumStyles?.filter((style) => style.styleId === styleId)[0];

  const allAlbumStyleItems = useSelector(({ appModel }) => appModel.allAlbumStyleItems);
  const currentAlbumStyleItems = allAlbumStyleItems[libraryId + '-' + styleId];

  const styleThumb = currentAlbumStyle?.thumb;
  const styleTitle = currentAlbumStyle?.title;

  useEffect(() => {
    plex.getAllAlbumStyles();
    plex.getAlbumStyleItems(libraryId, styleId);
  }, [styleId, libraryId]);

  return (
    <>
      {currentAlbumStyle && (
        <TitleHeading
          thumb={styleThumb}
          title={styleTitle}
          subtitle={
            currentAlbumStyleItems ? (
              currentAlbumStyleItems?.length + ' Album' + (currentAlbumStyleItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
          icon={'AlbumStylesIcon'}
        />
      )}
      {!(currentAlbumStyle && currentAlbumStyleItems) && <Loading forceVisible inline />}
      {currentAlbumStyle && currentAlbumStyleItems && <ListCards variant="albums" entries={currentAlbumStyleItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumStyleDetail;
