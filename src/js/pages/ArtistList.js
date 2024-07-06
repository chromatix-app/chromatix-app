// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const ArtistList = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewArtists, sortArtists, orderArtists, sortedArtists } = useGetAllArtists();

  return (
    <>
      <TitleHeading
        title="Artists"
        subtitle={sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        {isLocal && (
          <FilterToggle
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
        {viewArtists === 'grid' && (
          <>
            <FilterSelect
              value={sortArtists}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={(sortArtists) => {
                dispatch.sessionModel.setSessionState({
                  sortArtists,
                });
              }}
            />
            <FilterToggle
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
              icon={orderArtists === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
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
