// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumGenreItems = () => {
  const { libraryId, genreId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const {
    collectionInfo,
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,

    collectionThumb,
    collectionTitle,
  } = useGetCollectionItems({
    libraryId,
    collectionId: genreId,
    collectionFilter: 'genreId',
    collectionKey: 'AlbumGenres',
    itemsKey: 'AlbumGenreItems',
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  return (
    <>
      <TitleHeading
        key={libraryId + '-' + genreId}
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
        filters={
          <>
            <FilterToggle
              value={viewCollectionItems}
              options={[
                { value: 'grid', label: 'Grid view' },
                { value: 'list', label: 'List view' },
              ]}
              setter={setViewCollectionItems}
              icon={viewCollectionItems === 'grid' ? 'GridIcon' : 'ListIcon'}
            />
            {viewCollectionItems === 'grid' && (
              <>
                <FilterSelect
                  value={sortCollectionItems}
                  options={[
                    { value: 'title', label: 'Alphabetical' },
                    { value: 'artist', label: 'Artist' },
                    { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                    { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                    { value: 'addedAt', label: 'Date added' },
                    { value: 'lastPlayed', label: 'Date played' },
                    { value: 'releaseDate', label: 'Date released' },
                    // only allow sorting by rating if the option is enabled
                    ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
                  ]}
                  setter={setSortCollectionItems}
                />
                <FilterToggle
                  value={orderCollectionItems}
                  options={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                  ]}
                  setter={setOrderCollectionItems}
                  icon={orderCollectionItems === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
                />
              </>
            )}
          </>
        }
      />
      {!sortedCollectionItems && <Loading forceVisible inline showOffline />}
      {sortedCollectionItems && viewCollectionItems === 'grid' && (
        <ListCards variant={'albums'} entries={sortedCollectionItems} />
      )}
      {sortedCollectionItems && viewCollectionItems === 'list' && (
        <ListTable
          variant="albumGenreItems"
          entries={sortedCollectionItems}
          sortKey={sortCollectionItems}
          orderKey={orderCollectionItems}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumGenreItems;
