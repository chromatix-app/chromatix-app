// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const ArtistList = () => {
  const dispatch = useDispatch();

  const { viewArtists, sortArtists, orderArtists, sortedArtists } = useGetAllArtists();

  return (
    <>
      <TitleHeading
        title="Artists"
        subtitle={sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        {isLocal && (
          <FilterSelect
            value={viewArtists}
            options={[
              { value: 'grid', label: 'Grid view' },
              { value: 'list', label: 'List view' },
            ]}
            setter={(viewArtists) => {
              dispatch.sessionModel.setSessionState({
                viewArtists,
              });
            }}
            icon={viewArtists === 'grid' ? 'GridIcon' : 'ListIcon'}
          />
        )}
        {viewArtists !== 'grid2' && (
          <>
            <FilterSelect
              value={sortArtists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'userRating', label: 'Rating' },
                { value: 'addedAt', label: 'Recently added' },
                { value: 'lastPlayed', label: 'Recently played' },
              ]}
              setter={(sortArtists) => {
                console.log(sortArtists);
                dispatch.sessionModel.setSessionState({
                  sortArtists,
                });
              }}
            />
            <FilterSelect
              value={orderArtists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderArtists) => {
                dispatch.sessionModel.setSessionState({
                  orderArtists,
                });
              }}
            />
          </>
        )}
      </FilterWrap>
      {!sortedArtists && <Loading forceVisible inline />}
      {sortedArtists && viewArtists === 'grid' && <ListCards variant="artists" entries={sortedArtists} />}
      {sortedArtists && viewArtists === 'list' && (
        <ListEntries variant="artists" entries={sortedArtists} sortKey={sortArtists} orderKey={orderArtists} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
