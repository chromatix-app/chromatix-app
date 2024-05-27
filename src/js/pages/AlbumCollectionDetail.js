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

const AlbumCollectionDetail = () => {
  const { collectionId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allAlbumCollections = useSelector(({ appModel }) => appModel.allAlbumCollections);
  const currentAlbumCollection = allAlbumCollections?.filter(
    (collection) => collection.collectionId === collectionId
  )[0];

  const allAlbumCollectionItems = useSelector(({ appModel }) => appModel.allAlbumCollectionItems);
  const currentAlbumCollectionItems = allAlbumCollectionItems[libraryId + '-' + collectionId];

  const collectionThumb = currentAlbumCollection?.thumb;
  const collectionTitle = currentAlbumCollection?.title;
  const collectionRating = currentAlbumCollection?.userRating;

  useEffect(() => {
    plex.getAllCollections();
    plex.getAlbumCollectionItems(libraryId, collectionId);
  }, [collectionId, libraryId]);

  return (
    <>
      {currentAlbumCollection && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          detail={
            optionShowStarRatings &&
            typeof collectionRating !== 'undefined' && (
              <StarRating type="collection" ratingKey={collectionId} rating={collectionRating} size={13} inline />
            )
          }
          subtitle={
            currentAlbumCollectionItems ? (
              currentAlbumCollectionItems?.length + ' Album' + (currentAlbumCollectionItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentAlbumCollection && currentAlbumCollectionItems) && <Loading forceVisible inline />}
      {currentAlbumCollection && currentAlbumCollectionItems && (
        <ListCards variant={'albums'} entries={currentAlbumCollectionItems} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionDetail;
