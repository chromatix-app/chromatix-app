// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumMoodDetail = () => {
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
    collectionKey: 'AlbumMoods',
    itemsKey: 'AlbumMoodItems',
  });

  return (
    <>
      {sortedCollectionItems && (
        <TitleHeading
          thumb={collectionThumb}
          title={collectionTitle}
          subtitle={
            sortedCollectionItems ? (
              sortedCollectionItems?.length + ' Album' + (sortedCollectionItems?.length !== 1 ? 's' : '')
            ) : (
              <>&nbsp;</>
            )
          }
          icon={'AlbumMoodsIcon'}
        />
      )}
      {!sortedCollectionItems && <Loading forceVisible inline />}
      {sortedCollectionItems && <ListCards variant="albums" entries={sortedCollectionItems} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumMoodDetail;
