// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumStyleDetail = () => {
  const { styleId, libraryId } = useParams();

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
    collectionId: styleId,
    collectionFilter: 'styleId',
    collectionKey: 'AlbumStyles',
    itemsKey: 'AlbumStyleItems',
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
          icon={'AlbumStylesIcon'}
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

export default AlbumStyleDetail;
