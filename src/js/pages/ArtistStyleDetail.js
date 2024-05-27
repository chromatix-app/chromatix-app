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

const ArtistStyleDetail = () => {
  const { styleId, libraryId } = useParams();

  const allArtistStyles = useSelector(({ appModel }) => appModel.allArtistStyles);
  const currentArtistStyle = allArtistStyles?.filter((style) => style.styleId === styleId)[0];

  const allArtistStyleItems = useSelector(({ appModel }) => appModel.allArtistStyleItems);
  const currentArtistStyleItems = allArtistStyleItems[libraryId + '-' + styleId];

  const styleThumb = currentArtistStyle?.thumb;
  const styleTitle = currentArtistStyle?.title;

  useEffect(() => {
    plex.getAllArtistStyles();
    plex.getArtistStyleItems(libraryId, styleId);
  }, [styleId, libraryId]);

  return (
    <>
      {currentArtistStyle && (
        <TitleHeading
          thumb={styleThumb}
          title={styleTitle}
          subtitle={
            currentArtistStyleItems ? (
              currentArtistStyleItems?.length + ' Artist' + (currentArtistStyleItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentArtistStyle && currentArtistStyleItems) && <Loading forceVisible inline />}
      {currentArtistStyle && currentArtistStyleItems && (
        <ListCards variant="artists" entries={currentArtistStyleItems} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistStyleDetail;
