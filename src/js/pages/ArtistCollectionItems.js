// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { FilterSelect, FilterToggle, ListCards, ListTable, Loading, StarRating, TitleHeading } from 'js/components';
import { useGetCollectionItems } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistCollectionItems = () => {
  const { libraryId, collectionId } = useParams();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);

  const {
    sortedCollectionItems,

    viewCollectionItems,
    sortCollectionItems,
    orderCollectionItems,

    setViewCollectionItems,
    setSortCollectionItems,
    setOrderCollectionItems,

    collectionThumb,
    collectionTitle,
    collectionRating,
  } = useGetCollectionItems({
    collectionId,
    libraryId,
    collectionKey: 'ArtistCollections',
    itemsKey: 'ArtistCollectionItems',
  });

  return (
    <>
      {sortedCollectionItems && (
        <TitleHeading
          key={libraryId + '-' + collectionId}
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
          subtitle={sortedCollectionItems?.length + ' Artist' + (sortedCollectionItems?.length !== 1 ? 's' : '')}
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
      )}
      {!sortedCollectionItems && <Loading forceVisible inline />}
      {sortedCollectionItems && viewCollectionItems === 'grid' && (
        <ListCards variant={'artists'} entries={sortedCollectionItems} />
      )}
      {sortedCollectionItems && viewCollectionItems === 'list' && (
        <ListTable
          variant="artistCollectionItems"
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

export default ArtistCollectionItems;
