// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetAllPlaylists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const PlaylistList = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const {
    viewPlaylists,
    sortPlaylists,
    orderPlaylists,
    setViewPlaylists,
    setSortPlaylists,
    setOrderPlaylists,
    sortedPlaylists,
  } = useGetAllPlaylists();

  return (
    <>
      <TitleHeading
        title="Playlists"
        subtitle={
          sortedPlaylists ? sortedPlaylists?.length + ' Playlist' + (sortedPlaylists?.length !== 1 ? 's' : '') : null
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewPlaylists}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewPlaylists}
          icon={viewPlaylists === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewPlaylists === 'grid' && (
          <>
            <FilterSelect
              value={sortPlaylists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'duration', label: 'Duration' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
                { value: 'totalTracks', label: 'Track count' },
              ]}
              setter={setSortPlaylists}
            />
            <FilterToggle
              value={orderPlaylists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderPlaylists}
              icon={orderPlaylists === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedPlaylists && <Loading forceVisible inline />}
      {sortedPlaylists && viewPlaylists === 'grid' && <ListCards variant="playlists" entries={sortedPlaylists} />}
      {sortedPlaylists && viewPlaylists === 'list' && (
        <ListTable variant="playlists" entries={sortedPlaylists} sortKey={sortPlaylists} orderKey={orderPlaylists} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
