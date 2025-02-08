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

const ArtistMoodItems = () => {
  const { libraryId, moodId } = useParams();

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
    collectionId: moodId,
    collectionFilter: 'moodId',
    collectionKey: 'ArtistMoods',
    itemsKey: 'ArtistMoodItems',
  });

  if (!collectionInfo) {
    return <Loading forceVisible inline showOffline />;
  }

  return (
    <>
      <TitleHeading
        key={libraryId + '-' + moodId}
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
                    { value: 'addedAt', label: 'Date added' },
                    { value: 'lastPlayed', label: 'Date played' },
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
        <ListCards variant={'artists'} entries={sortedCollectionItems} />
      )}
      {sortedCollectionItems && viewCollectionItems === 'list' && (
        <ListTable
          variant="artistMoodItems"
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

export default ArtistMoodItems;
