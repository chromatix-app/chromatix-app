// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllPlaylists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const PlaylistList = () => {
  const dispatch = useDispatch();

  const { viewPlaylists, sortPlaylists, orderPlaylists, sortedPlaylists } = useGetAllPlaylists();

  return (
    <>
      <TitleHeading
        title="Playlists"
        subtitle={
          sortedPlaylists ? sortedPlaylists?.length + ' Playlist' + (sortedPlaylists?.length !== 1 ? 's' : '') : null
        }
      />
      <FilterWrap>
        {isLocal && (
          <FilterSelect
            value={viewPlaylists}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={(viewPlaylists) => {
              dispatch.sessionModel.setSessionState({
                viewPlaylists,
              });
            }}
            icon={viewPlaylists === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
        )}
        {viewPlaylists !== 'grid2' && (
          <>
            <FilterSelect
              value={sortPlaylists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'userRating', label: 'Rating' },
                { value: 'addedAt', label: 'Recently added' },
                { value: 'lastPlayed', label: 'Recently played' },
                { value: 'totalTracks', label: 'Track count' },
                { value: 'duration', label: 'Duration' },
              ]}
              setter={(sortPlaylists) => {
                dispatch.sessionModel.setSessionState({
                  sortPlaylists,
                });
              }}
            />
            <FilterSelect
              value={orderPlaylists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderPlaylists) => {
                dispatch.sessionModel.setSessionState({
                  orderPlaylists,
                });
              }}
            />
          </>
        )}
      </FilterWrap>
      {!sortedPlaylists && <Loading forceVisible inline />}
      {sortedPlaylists && viewPlaylists === 'grid' && <ListCards variant="playlists" entries={sortedPlaylists} />}
      {sortedPlaylists && viewPlaylists === 'list' && (
        <ListEntries variant="playlists" entries={sortedPlaylists} sortKey={sortPlaylists} orderKey={orderPlaylists} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
