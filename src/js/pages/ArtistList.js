// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListTable, Loading, TitleHeading } from 'js/components';
import { useGetAllArtists } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const ArtistList = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewArtists, sortArtists, orderArtists, setViewArtists, setSortArtists, setOrderArtists, sortedArtists } =
    useGetAllArtists();

  return (
    <>
      <TitleHeading
        key="ArtistList"
        title="Artists"
        subtitle={
          sortedArtists ? sortedArtists?.length + ' Artist' + (sortedArtists?.length !== 1 ? 's' : '') : <>&nbsp;</>
        }
      />
      <FilterWrap>
        <FilterToggle
          value={viewArtists}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewArtists}
          icon={viewArtists === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
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
              setter={setSortArtists}
            />
            <FilterToggle
              value={orderArtists}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderArtists}
              icon={orderArtists === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedArtists && <Loading forceVisible inline />}
      {sortedArtists && viewArtists === 'grid' && <ListCards variant="artists" entries={sortedArtists} />}
      {sortedArtists && viewArtists === 'list' && (
        <ListTable variant="artists" entries={sortedArtists} sortKey={sortArtists} orderKey={orderArtists} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default ArtistList;
