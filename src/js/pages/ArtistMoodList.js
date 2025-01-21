// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllSetEntries } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistMoodList = () => {
  const dispatch = useDispatch();

  const { viewSetEntries, sortSetEntries, orderSetEntries, sortedSetEntries } = useGetAllSetEntries('ArtistMoods');

  return (
    <>
      <TitleHeading
        title="Artist Moods"
        subtitle={
          sortedSetEntries ? (
            sortedSetEntries?.length + ' Artist Mood' + (sortedSetEntries?.length !== 1 ? 's' : '')
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
              viewArtistMoods: viewSetEntries,
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
                  orderArtistMoods: orderSetEntries,
                });
              }}
              icon={orderSetEntries === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedSetEntries && <Loading forceVisible inline />}
      {sortedSetEntries && viewSetEntries === 'grid' && <ListCards variant="artistMoods" entries={sortedSetEntries} />}
      {sortSetEntries && viewSetEntries === 'list' && (
        <ListEntries
          variant="artistMoods"
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

export default ArtistMoodList;
