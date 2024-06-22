// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, Loading, TitleHeading } from 'js/components';
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
        {viewPlaylists === 'grid' && (
          <>
            <FilterSelect
              value={sortPlaylists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'userRating', label: 'Rating' },
                { value: 'addedAt', label: 'Recently added' },
                { value: 'lastPlayed', label: 'Recently played' },
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
      {sortedPlaylists && <ListCards variant="playlists" entries={sortedPlaylists} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default PlaylistList;
