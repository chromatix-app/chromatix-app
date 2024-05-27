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

const ArtistCollectionDetail = () => {
  const { collectionId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const allArtistCollections = useSelector(({ appModel }) => appModel.allArtistCollections);
  const currentArtistCollection = allArtistCollections?.filter(
    (collection) => collection.collectionId === collectionId
  )[0];

  const allArtistCollectionItems = useSelector(({ appModel }) => appModel.allArtistCollectionItems);
  const currentArtistCollectionItems = allArtistCollectionItems[libraryId + '-' + collectionId];

  const collectionThumb = currentArtistCollection?.thumb;
  const collectionTitle = currentArtistCollection?.title;
  const collectionRating = currentArtistCollection?.userRating;

  useEffect(() => {
    plex.getAllCollections();
    plex.getArtistCollectionItems(libraryId, collectionId);
  }, [collectionId, libraryId]);

  return (
    <>
      {currentArtistCollection && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          detail={
            optionShowStarRatings && (
              <StarRating
                type="collection"
                ratingKey={collectionId}
                rating={collectionRating}
                inline
                editable
                alwaysVisible
              />
            )
          }
          subtitle={
            currentArtistCollectionItems ? (
              currentArtistCollectionItems?.length + ' Artist' + (currentArtistCollectionItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
        />
      )}
      {!(currentArtistCollection && currentArtistCollectionItems) && <Loading forceVisible inline />}
      {currentArtistCollection && currentArtistCollectionItems && (
        <ListCards variant={'artists'} entries={currentArtistCollectionItems} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionDetail;
