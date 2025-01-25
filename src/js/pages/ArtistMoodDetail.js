// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistMoodDetail = () => {
  const { moodId, libraryId } = useParams();

  const {
    sortedCollectionItems,

    // viewCollectionItems,
    // sortCollectionItems,
    // orderCollectionItems,

    // setViewCollectionItems,
    // setSortCollectionItems,
    // setOrderCollectionItems,

    collectionThumb,
    collectionTitle,
  } = useGetCollectionItems({
    libraryId,
    collectionId: moodId,
    collectionFilter: 'moodId',
    collectionKey: 'ArtistMoods',
    itemsKey: 'ArtistMoodItems',
  });

  return (
    <>
      {sortedCollectionItems && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          subtitle={
            sortedCollectionItems ? (
              sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
          icon={'ArtistMoodsIcon'}
        />
      )}
      {!sortedCollectionItems && <Loading forceVisible inline />}
      {sortedCollectionItems && <ListCards variant="artists" entries={sortedCollectionItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistMoodDetail;
