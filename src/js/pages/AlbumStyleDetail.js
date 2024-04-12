// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, StarRating, TitleHeading } from 'js/components';
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
  const styleRating = currentAlbumStyle?.userRating;

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
          detail={styleRating && <StarRating rating={styleRating} size={13} inline />}
          subtitle={
            currentAlbumStyleItems ? (
              currentAlbumStyleItems?.length + ' Album' + (currentAlbumStyleItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
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
