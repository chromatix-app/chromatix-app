// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FilterSelect, FilterWrap, ListCards, Loading, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const AlbumList = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;
  const sortAlbums = useSelector(({ sessionModel }) => sessionModel.sortAlbums);
  const orderAlbums = useSelector(({ sessionModel }) => sessionModel.orderAlbums);

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums = allAlbums ? sortList(allAlbums, sortAlbums, orderAlbums) : null;

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return (
    <>
      <TitleHeading
        title="Albums"
        subtitle={sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : null}
      />
      <FilterWrap>
        <FilterSelect
          value={sortAlbums}
          options={[
            { value: 'title', label: 'Alphabetical' },
            { value: 'artist', label: 'Artist' },
            { value: 'artist-asc-releaseDate-asc', label: 'Artist, Newest Release First' },
            { value: 'artist-asc-releaseDate-desc', label: 'Artist, Oldest Release First' },
            { value: 'userRating', label: 'Rating' },
            { value: 'releaseDate', label: 'Release Date' },
            { value: 'addedAt', label: 'Recently Added' },
            { value: 'lastPlayed', label: 'Recently Played' },
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
      </FilterWrap>
      {!sortedAlbums && <Loading forceVisible inline />}
      {sortedAlbums && <ListCards variant="albums" entries={sortedAlbums} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
