// ======================================================================
// IMPORTS
// ======================================================================

import { useDispatch } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, ListEntries, Loading, TitleHeading } from 'js/components';
import { useGetAllAlbums } from 'js/hooks';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const AlbumList = () => {
  const dispatch = useDispatch();

  const { viewAlbums, sortAlbums, orderAlbums, sortedAlbums } = useGetAllAlbums();

  return (
    <>
      <TitleHeading
        title="Albums"
        subtitle={sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        {isLocal && (
          <FilterSelect
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
        )}
        {viewAlbums !== 'grid2' && (
          <>
            <FilterSelect
              value={sortAlbums}
              options={[
                { value: 'title', label: 'Alphabetical' },
                { value: 'artist', label: 'Artist' },
                { value: 'artist-asc-releaseDate-asc', label: 'Artist, newest release first' },
                { value: 'artist-asc-releaseDate-desc', label: 'Artist, oldest release first' },
                { value: 'userRating', label: 'Rating' },
                { value: 'releaseDate', label: 'Release date' },
                { value: 'addedAt', label: 'Recently added' },
                { value: 'lastPlayed', label: 'Recently played' },
              ]}
              setter={(sortAlbums) => {
                dispatch.sessionModel.setSessionState({
                  sortAlbums,
                });
              }}
            />
            <FilterSelect
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
