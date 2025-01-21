// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllSetEntries } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumMoodList = () => {
  const dispatch = useDispatch();

  const { viewSetEntries, sortSetEntries, orderSetEntries, sortedSetEntries } = useGetAllSetEntries('AlbumMoods');

  return (
    <>
      <TitleHeading
        title="Album Moods"
        subtitle={
          sortedSetEntries ? (
            sortedSetEntries?.length + ' Album Mood' + (sortedSetEntries?.length !== 1 ? 's' : '')
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
          setter={(viewSetEntries) => {
            dispatch.sessionModel.setSessionState({
              viewAlbumMoods: viewSetEntries,
            });
          }}
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
              setter={(orderSetEntries) => {
                dispatch.sessionModel.setSessionState({
                  orderAlbumMoods: orderSetEntries,
                });
              }}
              icon={orderSetEntries === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedSetEntries && <Loading forceVisible inline />}
      {sortedSetEntries && viewSetEntries === 'grid' && <ListCards variant="albumMoods" entries={sortedSetEntries} />}
      {sortSetEntries && viewSetEntries === 'list' && (
        <ListEntries
          variant="albumMoods"
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

export default AlbumMoodList;
