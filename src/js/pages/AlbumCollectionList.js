// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumCollectionList = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setSortCollections,
    setOrderCollections,
    sortedCollections,
  } = useGetAllCollections('AlbumCollections');

  return (
    <>
      <TitleHeading
        key="AlbumCollectionList"
        title="Album Collections"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Album Collection' + (sortedCollections?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewCollections}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewCollections}
          icon={viewCollections === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewCollections === 'grid' && (
          <>
            <FilterSelect
              value={sortCollections}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={setSortCollections}
            />
            <FilterToggle
              value={orderCollections}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderCollections}
              icon={orderCollections === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedCollections && <Loading forceVisible inline showOffline />}
      {sortedCollections && viewCollections === 'grid' && (
        <ListCards variant="collections" entries={sortedCollections} />
      )}
      {sortedCollections && viewCollections === 'list' && (
        <ListTable
          variant="albumCollections"
          entries={sortedCollections}
          sortKey={sortCollections}
          orderKey={orderCollections}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumCollectionList;
