// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterToggle, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
  const dispatch = useDispatch();

  const optionShowStarRatings = useSelector(({ sessionModel }) => sessionModel.optionShowStarRatings);
  const { viewAlbums, sortAlbums, orderAlbums, sortedAlbums } = useGetAllAlbums();

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
          setter={(viewAlbums) => {
            dispatch.sessionModel.setSessionState({
              viewAlbums,
            });
          }}
          icon={viewAlbums === 'grid' ? 'GridIcon' : 'ListIcon'}
        />
        {viewAlbums === 'grid' && (
          <>
            <FilterSelect
              value={sortAlbums}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'artist', label: 'Artist' },
                // only allow sub-sorting in grid view
                ...(viewAlbums === 'grid'
                  ? [
                      { value: 'artist-asc-releaseDate-asc', label: 'Artist, newest release first' },
                      { value: 'artist-asc-releaseDate-desc', label: 'Artist, oldest release first' },
                    ]
                  : []),
                { value: 'addedAt', label: 'Date added' },
                { value: 'lastPlayed', label: 'Date played' },
                { value: 'releaseDate', label: 'Date released' },
                // only allow sorting by rating if the option is enabled
                ...(optionShowStarRatings ? [{ value: 'userRating', label: 'Rating' }] : []),
              ]}
              setter={(sortAlbums) => {
                dispatch.sessionModel.setSessionState({
                  sortAlbums,
                });
              }}
            />
            <FilterToggle
              value={orderAlbums}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              setter={(orderAlbums) => {
                dispatch.sessionModel.setSessionState({
                  orderAlbums,
                });
              }}
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
