// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ListCards, Loading, Select, TitleHeading } from 'js/components';
import { sortList } from 'js/utils';
import * as plex from 'js/services/plex';

// ======================================================================
// COMPONENT
// ======================================================================

const isLocal = process.env.REACT_APP_ENV === 'local';

const AlbumList = () => {
  const dispatch = useDispatch();

  const currentLibrary = useSelector(({ sessionModel }) => sessionModel.currentLibrary);
  const currentLibraryId = currentLibrary?.libraryId;
  const sortAlbums = useSelector(({ sessionModel }) => sessionModel.sortAlbums);

  const allAlbums = useSelector(({ appModel }) => appModel.allAlbums)?.filter(
    (album) => album.libraryId === currentLibraryId
  );
  const sortedAlbums = allAlbums ? sortList(allAlbums, sortAlbums) : null;

  useEffect(() => {
    plex.getAllAlbums();
  }, []);

  return (
    <>
      <TitleHeading
        title="Albums"
        subtitle={sortedAlbums ? sortedAlbums?.length + ' Album' + (sortedAlbums?.length !== 1 ? 's' : '') : null}
      />
      {isLocal && (
        <Select
          value={sortAlbums}
          options={[
            { value: 'title', label: 'Alphabetical' },
            { value: 'artist', label: 'Artist' },
            { value: 'artist-releaseDate', label: 'Artist, by Newest Release' },
            { value: 'artist-releaseDateDesc', label: 'Artist, by Oldest Release' },
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
      )}
      {!sortedAlbums && <Loading forceVisible inline />}
      {sortedAlbums && <ListCards variant="albums" entries={sortedAlbums} />}
    </>
  );
};

// ======================================================================
// EXPORT
// ======================================================================

export default AlbumList;
