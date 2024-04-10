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

const CollectionDetail = () => {
  const { collectionId, libraryId } = useParams();

  const allCollections = useSelector(({ appModel }) => appModel.allCollections);
  const currentCollection = allCollections?.filter((collection) => collection.collectionId === collectionId)[0];

  const allCollectionItems = useSelector(({ appModel }) => appModel.allCollectionItems);
  const currentCollectionItems = allCollectionItems[libraryId + '-' + collectionId];

  const collectionType = currentCollection?.type;
  const collectionThumb = currentCollection?.thumb;
  const collectionTitle = currentCollection?.title;
  const collectionRating = currentCollection?.userRating;

  const collectionTypeCapitalized = collectionType?.charAt(0).toUpperCase() + collectionType?.slice(1);

  useEffect(() => {
    plex.getAllCollections();
    if (collectionType) {
      plex.getCollectionItems(libraryId, collectionId, collectionType);
    }
  }, [collectionId, libraryId, collectionType]);

  return (
    <>
      {currentCollection && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          detail={collectionRating && <StarRating rating={collectionRating} size={13} inline />}
          subtitle={
            currentCollectionItems ? (
              currentCollectionItems?.length +
              ' ' +
              collectionTypeCapitalized +
              (currentCollectionItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentCollection && currentCollectionItems) && <Loading forceVisible inline />}
      {currentCollection && currentCollectionItems && (
        <ListCards variant={collectionType + 's'} entries={currentCollectionItems} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default CollectionDetail;
