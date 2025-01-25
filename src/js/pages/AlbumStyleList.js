// ======================================================================
// IMPORTS
// ======================================================================

import { FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllSetEntries } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumStyleList = () => {
  const { viewSetEntries, sortSetEntries, orderSetEntries, setViewSetEntries, setOrderSetEntries, sortedSetEntries } =
    useGetAllSetEntries('AlbumStyles');

  return (
    <>
      <TitleHeading
        title="Album Styles"
        subtitle={
          sortedSetEntries ? (
            sortedSetEntries?.length + ' Album Style' + (sortedSetEntries?.length !== 1 ? 's' : '')
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
      {sortedSetEntries && viewSetEntries === 'grid' && <ListCards variant="albumStyles" entries={sortedSetEntries} />}
      {sortSetEntries && viewSetEntries === 'list' && (
        <ListEntries
          variant="albumStyles"
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

export default AlbumStyleList;
