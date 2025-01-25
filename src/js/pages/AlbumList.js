// ======================================================================
// IMPORTS
// ======================================================================

import { useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewAlbums, sortAlbums, orderAlbums, setViewAlbums, setSortAlbums, setOrderAlbums, sortedAlbums } =
    useGetAllAlbums();

  return (
    <>
      <TitleHeading
        title="Albums"
        subtitle={sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        <FilterToggle
          value={viewAlbums}
          options={[
            { value: 'grid', label: 'Grid view' },
            { value: 'list', label: 'List view' },
          ]}
          setter={setViewAlbums}
          icon={viewAlbums === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewAlbums === 'grid' && (
          <>
            <FilterSelect
              value={sortAlbums}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'artist', label: 'Artist' },
                { value: 'artist-asc-releaseDate-desc', label: 'Artist, newest release first' },
                { value: 'artist-asc-releaseDate-asc', label: 'Artist, oldest release first' },
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'releaseDate', label: 'Date released' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={setSortAlbums}
            />
            <FilterToggle
              value={orderAlbums}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={setOrderAlbums}
              icon={orderAlbums === 'asc' ? 'ArrowDownLongIcon' : 'ArrowUpLongIcon'}
            />
          </>
        )}
      </FilterWrap>
      {!sortedAlbums && <Loading forceVisible inline />}
      {sortedAlbums && viewAlbums === 'grid' && <ListCards variant="albums" entries={sortedAlbums} />}
      {sortedAlbums && viewAlbums === 'list' && (
        <ListEntries variant="albums" entries={sortedAlbums} sortKey={sortAlbums} orderKey={orderAlbums} />
      )}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
