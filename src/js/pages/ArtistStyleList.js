// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetAllCollections } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistStyleList = () => {
  const {
    viewCollections,
    sortCollections,
    orderCollections,
    setViewCollections,
    setOrderCollections,
    sortedCollections,
  } = useGetAllCollections('ArtistStyles');

  return (
    <>
      <TitleHeading
        key="ArtistStyleList"
        title="Artist Styles"
        subtitle={
          sortedCollections ? (
            sortedCollections?.length + ' Artist Style' + (sortedCollections?.length !== 1 ? 's' : '')
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
        <ListCards variant="artistStyles" entries={sortedCollections} />
      )}
      {sortCollections && viewCollections === 'list' && (
        <ListTable
          variant="artistStyles"
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

export default ArtistStyleList;
