// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { ListCards, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionDetail = () => {
  const { collectionId, libraryId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const { currentCollectionItems, collectionThumb, collectionTitle, collectionRating } = useGetCollectionItems({
    collectionId,
    libraryId,
    collectionKey: 'ArtistCollections',
    itemsKey: 'ArtistCollectionItems',
  });

  return (
    <>
      {currentCollectionItems && (
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
          subtitle={currentCollectionItems?.length + ' Artist' + (currentCollectionItems?.length !== 1 ? 's' : '')}
        />
      )}
      {!currentCollectionItems && <Loading forceVisible inline />}
      {currentCollectionItems && <ListCards variant={'artists'} entries={currentCollectionItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistCollectionDetail;
