// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllSetEntries } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistStyleList = () => {
  const { viewSetEntries, sortSetEntries, orderSetEntries, setViewSetEntries, setOrderSetEntries, sortedSetEntries } =
    useGetAllSetEntries('ArtistStyles');

  return (
    <>
      <TitleHeading
        title="Artist Styles"
        subtitle={
          sortedSetEntries ? (
            sortedSetEntries?.length + ' Artist Style' + (sortedSetEntries?.length !== 1 ? 's' : '')
          ) : (
            <>&nbsp;</>
          )
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewSetEntries}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewSetEntries}
          icon={viewSetEntries === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewSetEntries === 'grid' && (
          <>
            <FilterToggle
              value={orderSetEntries}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderSetEntries}
              icon={orderSetEntries === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedSetEntries && <Loading forceVisible inline />}
      {sortedSetEntries && viewSetEntries === 'grid' && <ListCards variant="artistStyles" entries={sortedSetEntries} />}
      {sortSetEntries && viewSetEntries === 'list' && (
        <ListEntries
          variant="artistStyles"
          entries={sortedSetEntries}
          sortKey={sortSetEntries}
          orderKey={orderSetEntries}
        />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistStyleList;
