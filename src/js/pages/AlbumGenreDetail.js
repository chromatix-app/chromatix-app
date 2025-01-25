// ======================================================================
// IMPORTS
// ======================================================================

import { useParams } from 'react-router-dom';

import { ListCards, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreDetail = () => {
  const { genreId, libraryId } = useParams();

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
    collectionId: genreId,
    collectionFilter: 'genreId',
    collectionKey: 'AlbumGenres',
    itemsKey: 'AlbumGenreItems',
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
          icon={'AlbumGenresIcon'}
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

export default AlbumGenreDetail;
